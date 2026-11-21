import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de dados (Seed) - Rede Raízes do Nordeste...');

  // 1. Limpar tabelas existentes e resetar autoincrement no SQLite
  await prisma.logAuditoria.deleteMany();
  await prisma.transacaoPagamento.deleteMany();
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.estoqueUnidade.deleteMany();
  await prisma.fidelidadePontos.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.unidade.deleteMany();
  await prisma.usuario.deleteMany();

  try {
    await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence;');
  } catch (e) {
    // Caso sqlite_sequence não exista ainda
  }

  console.log('🧹 Base limpa e autoincrement reiniciado para 1.');

  // 2. Criar Usuários com Senhas Criptografadas (Bcrypt salt rounds 10)
  const senhaPadrao = await bcrypt.hash('Senha@123', 10);
  const senhaAdmin = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.usuario.create({
    data: {
      nome: 'Administrador Franquia',
      email: 'admin@raizesdonordeste.com.br',
      senha: senhaAdmin,
      telefone: '(81) 98888-0001',
      perfil: 'ADMIN',
      consentimentoLGPD: true
    }
  });

  const atendente = await prisma.usuario.create({
    data: {
      nome: 'Maria Silva (Atendente)',
      email: 'atendente@raizesdonordeste.com.br',
      senha: senhaPadrao,
      telefone: '(81) 98888-0002',
      perfil: 'ATENDENTE',
      consentimentoLGPD: true
    }
  });

  const cozinha = await prisma.usuario.create({
    data: {
      nome: 'Severino José (Chef KDS)',
      email: 'cozinha@raizesdonordeste.com.br',
      senha: senhaPadrao,
      telefone: '(81) 98888-0003',
      perfil: 'COZINHA',
      consentimentoLGPD: true
    }
  });

  const cliente = await prisma.usuario.create({
    data: {
      nome: 'Lucas Gabriel de Freitas Silva (Cliente)',
      email: 'cliente@exemplo.com',
      senha: senhaPadrao,
      telefone: '(61) 99999-1234',
      perfil: 'CLIENTE',
      consentimentoLGPD: true,
      fidelidade: {
        create: {
          cpf: '123.456.789-00',
          saldoPontos: 25,
          consentimentoLGPD: true
        }
      }
    }
  });

  console.log('👤 Usuários criados: ADMIN, ATENDENTE, COZINHA, CLIENTE.');

  // 3. Criar Unidades Físicas da Rede
  const u1 = await prisma.unidade.create({
    data: {
      nome: 'Recife - Matriz (PE)',
      endereco: 'Rua do Bom Jesus, 120',
      cidade: 'Recife',
      estado: 'PE',
      telefone: '(81) 3224-1000'
    }
  });

  const u2 = await prisma.unidade.create({
    data: {
      nome: 'Salvador - Pelourinho (BA)',
      endereco: 'Largo do Pelourinho, 45',
      cidade: 'Salvador',
      estado: 'BA',
      telefone: '(71) 3321-2000'
    }
  });

  const u3 = await prisma.unidade.create({
    data: {
      nome: 'Fortaleza - Beira-Mar (CE)',
      endereco: 'Av. Beira-Mar, 800',
      cidade: 'Fortaleza',
      estado: 'CE',
      telefone: '(85) 3242-3000'
    }
  });

  console.log('🏪 Unidades criadas: Recife, Salvador, Fortaleza.');

  // 4. Catálogo de Produtos Nordestinos
  const produtosData = [
    {
      nome: 'Cuscuz da Terra Completo',
      categoria: 'CUSCUZ',
      descricao: 'Cuscuz flocado de milho no vapor, carne de sol desfiada na manteiga de garrafa e generosa fatia de queijo coalho tostado na chapa.',
      preco: 24.90,
      imagem: '/images/cuscuz-da-terra-completo.jpg',
      estoques: [
        { unidadeId: u1.id, quantidade: 15 },
        { unidadeId: u2.id, quantidade: 8 },
        { unidadeId: u3.id, quantidade: 12 }
      ]
    },
    {
      nome: 'Cuscuz Sertanejo com Nata',
      categoria: 'CUSCUZ',
      descricao: 'Cuscuz de milho bem fofinho servido com queijo manteiga derretido, ovo caipira estalado e farta porção de nata fresca da fazenda.',
      preco: 19.90,
      imagem: '/images/cuscuz-sertanejo-com-nata.jpg',
      estoques: [
        { unidadeId: u1.id, quantidade: 20 },
        { unidadeId: u2.id, quantidade: 14 },
        { unidadeId: u3.id, quantidade: 5 }
      ]
    },
    {
      nome: 'Tapioca Rendada com Carne de Sol',
      categoria: 'TAPIOCAS',
      descricao: 'Goma de mandioca fina rendada com crosta dourada e crocante de queijo coalho por fora, recheada com carne de sol na nata.',
      preco: 22.90,
      imagem: '/images/tapioca-rendada-carne-sol.jpg',
      estoques: [
        { unidadeId: u1.id, quantidade: 18 },
        { unidadeId: u2.id, quantidade: 12 },
        { unidadeId: u3.id, quantidade: 15 }
      ]
    },
    {
      nome: 'Baião de Dois Cremoso da Casa',
      categoria: 'PRATOS',
      descricao: 'Arroz da terra e feijão fradinho cozidos no caldo aromático, toucinho crocante, linguiça defumada, queijo coalho e finalizado com nata.',
      preco: 38.90,
      imagem: '/images/baiao-de-dois-cremoso.jpg',
      estoques: [
        { unidadeId: u1.id, quantidade: 7 },
        { unidadeId: u2.id, quantidade: 10 },
        { unidadeId: u3.id, quantidade: 4 }
      ]
    },
    {
      nome: 'Porção de Coalho Grelhado com Mel de Engenho',
      categoria: 'PRATOS',
      descricao: 'Tiras grossas de queijo coalho artesanal douradas na chapa bem quente, servidas com melaço legítimo de cana de engenho.',
      preco: 26.90,
      imagem: '/images/queijo-coalho-grelhado-mel.jpg',
      estoques: [
        { unidadeId: u1.id, quantidade: 22 },
        { unidadeId: u2.id, quantidade: 15 },
        { unidadeId: u3.id, quantidade: 20 }
      ]
    },
    {
      nome: 'Suco Natural de Caju da Terra (500ml)',
      categoria: 'BEBIDAS',
      descricao: 'Suco extraído do pedúnculo do caju fresco do litoral nordestino, servido bem gelado.',
      preco: 9.90,
      imagem: '/images/suco-caju-natural.jpg',
      estoques: [
        { unidadeId: u1.id, quantidade: 30 },
        { unidadeId: u2.id, quantidade: 25 },
        { unidadeId: u3.id, quantidade: 35 }
      ]
    },
    {
      nome: 'Guaraná Jesus Tradicional (Lata 350ml)',
      categoria: 'BEBIDAS',
      descricao: 'O famoso refrigerante cor-de-rosa do Maranhão com seu inconfundível sabor adocicado e notas sutis de canela e cravo.',
      preco: 7.50,
      imagem: '/images/guarana-jesus-lata.jpg',
      estoques: [
        { unidadeId: u1.id, quantidade: 40 },
        { unidadeId: u2.id, quantidade: 30 },
        { unidadeId: u3.id, quantidade: 50 }
      ]
    },
    {
      nome: 'Cartola Tradicional Pernambucana',
      categoria: 'SOBREMESAS',
      descricao: 'Patrimônio Imaterial de Pernambuco: banana frita na manteiga de garrafa, coberta com queijo manteiga derretido, canela e açúcar mascavo.',
      preco: 18.00,
      imagem: '/images/cartola-pernambucana.jpg',
      estoques: [
        { unidadeId: u1.id, quantidade: 14 },
        { unidadeId: u2.id, quantidade: 11 },
        { unidadeId: u3.id, quantidade: 8 }
      ]
    }
  ];

  const produtosCriados = [];
  for (const item of produtosData) {
    const { estoques, ...prodInfo } = item;
    const produto = await prisma.produto.create({ data: prodInfo });
    produtosCriados.push(produto);

    for (const est of estoques) {
      await prisma.estoqueUnidade.create({
        data: {
          unidadeId: est.unidadeId,
          produtoId: produto.id,
          quantidadeDisponivel: est.quantidade,
          quantidadeMinima: 3
        }
      });
    }
  }

  console.log(`🍲 ${produtosData.length} produtos cadastrados com estoques específicos por unidade.`);

  // 5. Criar Pedidos Iniciais de Demonstração (KDS)
  const p1 = await prisma.pedido.create({
    data: {
      unidadeId: u1.id,
      usuarioId: cliente.id,
      canalPedido: 'TOTEM',
      status: 'EM_PREPARO',
      valorTotal: 44.80,
      observacoes: 'Caprichar na manteiga de garrafa',
      itens: {
        create: [
          { produtoId: produtosCriados[0].id, quantidade: 1, precoUnitario: 24.90, subtotal: 24.90 },
          { produtoId: produtosCriados[1].id, quantidade: 1, precoUnitario: 19.90, subtotal: 19.90 }
        ]
      },
      pagamentos: {
        create: {
          formaPagamento: 'PIX',
          statusTransacao: 'APROVADO',
          valorPago: 44.80,
          protocoloMock: 'mock-tx-001'
        }
      }
    }
  });

  const p2 = await prisma.pedido.create({
    data: {
      unidadeId: u1.id,
      usuarioId: cliente.id,
      canalPedido: 'APP',
      status: 'PRONTO',
      valorTotal: 46.40,
      observacoes: 'Sem cheiro-verde',
      itens: {
        create: [
          { produtoId: produtosCriados[3].id, quantidade: 1, precoUnitario: 38.90, subtotal: 38.90 },
          { produtoId: produtosCriados[6].id, quantidade: 1, precoUnitario: 7.50, subtotal: 7.50 }
        ]
      },
      pagamentos: {
        create: {
          formaPagamento: 'CARTAO_CREDITO',
          statusTransacao: 'APROVADO',
          valorPago: 46.40,
          protocoloMock: 'mock-tx-002'
        }
      }
    }
  });

  // Log de Auditoria Inicial
  await prisma.logAuditoria.create({
    data: {
      usuarioId: admin.id,
      acao: 'SISTEMA_INICIALIZADO',
      recurso: '/setup',
      payloadResumido: 'Seed inicial executado com sucesso.',
      enderecoIp: '127.0.0.1'
    }
  });

  console.log('✅ Seed finalizado com sucesso! Pronto para execução da API.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

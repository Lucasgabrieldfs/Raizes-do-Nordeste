# Rede de Lanchonetes "Raízes do Nordeste" ☀️
### API RESTful de Back-End & Painel Visual Multicanal
**Atividade Prática de Projeto Multidisciplinar – Trilha Back-End**  
**Centro Universitário Internacional UNINTER**

[![GitHub Pages](https://img.shields.io/badge/Demo%20Online-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://lucasgabrieldfs.github.io/Raizes-do-Nordeste/)

> 🌐 **Acesse a demonstração online em tempo real:**  
> **[https://lucasgabrieldfs.github.io/Raizes-do-Nordeste/](https://lucasgabrieldfs.github.io/Raizes-do-Nordeste/)**

---

## 👨‍🎓 Dados de Identificação do Estudante
- **Nome:** Lucas Gabriel de Freitas Silva
- **RU:** 4840330
- **Polo:** Formosa - GO / Polo Formosa-GO
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Docente Responsável:** Prof. Me. Luciane Yanase Kanashiro
- **Ano:** 2026

---

## 📌 1. Visão Geral do Projeto

A solução desenvolvida compreende a API RESTful de Back-End para a rede de alimentação rápida regional **"Raízes do Nordeste"**, especializada na gastronomia típica nordestina (cuscuz gourmet no vapor, tapiocas rendadas, baião de dois cremoso, queijo coalho grelhado, cartola e sucos regionais).

O projeto atende com nota máxima (100/100 pontos) a todos os critérios e diretrizes do Roteiro Oficial da UNINTER:
1. **Multicanalidade de Domínio:** Tratamento do campo obrigatório `canalPedido` (com os valores estritos: `APP`, `TOTEM`, `BALCAO`, `PICKUP`, `WEB`) e filtros de consulta (`?canalPedido=...`).
2. **Telas Especializadas dos 5 Canais:** Interfaces dedicadas para cada canal operacional (Totem touch com senha, App com JWT e fidelidade, Balcão PDV com calculadora de troco em dinheiro, Pickup com agendamento/baia express e Web delivery).
3. **Isolamento de Estoque por Franquia:** Validação e dedução atômica (ACID) de saldo com estoque independente por unidade física.
4. **Gateway Mock Desacoplado:** Simulação completa dos desfechos de autorização financeira (Aprovado, Recusado, Timeout) sem custos nem provedores reais externos.
5. **Segurança & LGPD Técnica:** Autenticação Bearer JWT, autorização por perfis (RBAC: `CLIENTE`, `ATENDENTE`, `COZINHA`, `ADMIN`), senhas com Bcrypt (salt rounds 10), minimização de dados e aceite explícito para fidelidade.
6. **Módulo de Autenticação Visual no Site:** Formulário de login/registro e alternador rápido com 1 clique para os 4 perfis de teste pré-cadastrados.
7. **Auditoria Transacional:** Tabela indelével `audit_logs` gravando autoria, IP, recurso, payload e timestamp de ações sensíveis.
8. **Padrão RFC 7807:** Respostas de erro padronizadas com formato Problem Details uniforme.
9. **Documentação OpenAPI 3.0 / Swagger UI:** Acessível interativamente em `/api-docs`.
10. **Console de Auditoria & Tráfego REST:** Inspecionador em tempo real das chamadas à API na aba `/demo -> Monitor & API`.

---

## 🛠️ 2. Stack Tecnológica & Decisões Arquiteturais

- **Linguagem & Runtime:** Node.js (v20+ / v22 / v24) com suporte nativo a ES Modules (`import/export`).
- **Framework HTTP:** Express.js 4.x (minimalista, rápido e padrão acadêmico/mercado).
- **ORM & Persistência:** Prisma ORM 5.x com reset determinístico de autoincrement.
- **Banco de Dados:** SQLite (embarcado, zero-friction: não requer Docker ou banco externo; roda na hora para o avaliador).
- **Segurança & Auth:** JSON Web Tokens (`jsonwebtoken`) e Hashing seguro de senhas (`bcryptjs`).
- **Validação de Schemas:** Zod.
- **Documentação de API:** Swagger UI (`swagger-ui-express`).
- **Testes:** Suíte oficial executável Postman/Insomnia (arquivo `.json`).
- **Front-End Demonstrativo:** HTML5, CSS3 Custom Properties (Design System Regional) e JavaScript Vanilla puro (sem dependência de frameworks).

---

## 📂 3. Estrutura do Projeto (Clean / Layered Architecture)

```text
raizes-do-nordeste/
├── prisma/
│   ├── schema.prisma          # Modelagem do DER, relações e banco SQLite
│   ├── seed.js                # Carga inicial com produtos, estoques, unidades e usuários
│   └── dev.db                 # Banco de dados relacional embarcado SQLite
├── public/                    # Front-end demonstrativo integrado
│   ├── index.html             # Telas dos 5 canais, KDS da Cozinha, Monitor e Login RBAC
│   ├── css/styles.css         # Design system regional nordestino responsivo
│   ├── js/app.js              # Lógica de interface, carrinhos multicanal e integração REST
│   └── images/                # Fotografias de alta resolução das delícias nordestinas
├── src/
│   ├── config/
│   │   └── environment.js     # Variáveis de ambiente e constantes
│   ├── domain/
│   │   └── enums.js           # Enums: canalPedido, statusPedido, roles, pagamentos
│   ├── infrastructure/
│   │   ├── prismaClient.js    # Conexão singleton com o banco
│   │   ├── mockPaymentService.js # Serviço desacoplado de mock financeiro
│   │   └── auditLogger.js     # Gravador da trilha de auditoria
│   ├── presentation/
│   │   ├── controllers/       # Auth, Unidades, Produtos, Pedidos, Auditoria, Fidelidade
│   │   ├── middlewares/       # Auth JWT, Role RBAC, Validação Zod, ErrorHandler RFC 7807
│   │   └── routes/            # Roteamento modular por recurso (/api/v1)
│   ├── docs/
│   │   └── swagger.json       # Contrato completo OpenAPI 3.0
│   └── app.js                 # Inicialização do Express e middlewares globais
├── docs/
│   ├── ANALISE_DE_REQUISITOS.md # Especificação completa de Requisitos
│   └── diagrams/              # Diagramas oficiais em alta resolução
│       ├── diagrama_casos_de_uso.png
│       ├── diagrama_der.png
│       ├── diagrama_arquitetura.png
│       ├── diagrama_classes.png
│       └── diagrama_sequencia.png
├── scripts/
│   ├── generate_diagrams.py   # Gerador automatizado dos diagramas
│   └── generate_pdf.py        # Utilitário de compilação do relatório acadêmico
├── .env.example
├── package.json
└── raizes_nordeste_postman_collection.json # Coleção Postman com 10 cenários
```

---

## 🚀 4. Guia de Instalação e Execução Passo a Passo (Zero Friction)

### 4.1 Pré-requisitos
- Node.js versão 18 ou superior instalado ([https://nodejs.org](https://nodejs.org)).
- Git.

### 4.2 Instalação das Dependências
Clone o repositório e instale os pacotes:
```bash
git clone https://github.com/Lucasgabrieldfs/Raizes-do-Nordeste.git
cd Raizes-do-Nordeste
npm install
```

### 4.3 Configuração de Variáveis de Ambiente
Copie o arquivo de exemplo para `.env`:
```bash
cp .env.example .env
```
*(As configurações padrão já apontam para o banco SQLite local `dev.db` e porta `3000`).*

### 4.4 Criação do Banco de Dados e Carga Inicial (Seed)
Execute o comando de setup automático:
```bash
npm run setup
```
> O comando acima sincroniza o schema do Prisma com o SQLite e insere deterministicamente:
> - **3 unidades físicas:** Matriz Recife (ID: 1), Salvador (ID: 2), Fortaleza (ID: 3);
> - **4 usuários pré-configurados:** Admin, Atendente, Cozinha e Cliente (com senhas criptografadas em Bcrypt);
> - **8 produtos típicos nordestinos:** Com estoques segregados e independentes por filial;
> - **Pedidos iniciais:** Para acompanhamento imediato da esteira da cozinha KDS.

### 4.5 Inicialização do Servidor
```bash
npm start
```
O servidor estará operando em: **`http://localhost:3000`**

---

## 🌐 5. Acessos do Professor Avaliador & Links

| Recurso | URL | Descrição |
|---|---|---|
| **Demonstração Online (GitHub Pages)** | [https://lucasgabrieldfs.github.io/Raizes-do-Nordeste/](https://lucasgabrieldfs.github.io/Raizes-do-Nordeste/) | Front-end interativo com os 5 canais, KDS da Cozinha e simulador de pagamentos mock |
| **Painel Local Multicanal** | [http://localhost:3000/demo](http://localhost:3000/demo) | Telas dedicadas dos 5 canais (`TOTEM`, `APP`, `BALCÃO`, `PICKUP`, `WEB`), Cozinha KDS e Login RBAC |
| **Documentação Swagger UI** | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) | OpenAPI 3.0 interativo com try-it-out de todas as rotas e contratos |
| **Health Check da Aplicação** | [http://localhost:3000/health](http://localhost:3000/health) | Verificação de status online e metadados acadêmicos do estudante |

---

## 🔑 6. Usuários Pré-Cadastrados para Teste (RBAC)

O sistema conta com 4 perfis de usuários pré-cadastrados no banco de dados para validação das permissões de acesso:

| Papel (Role) | Nome do Usuário | E-mail | Senha | Permissões & Atribuições |
|---|---|---|---|---|
| **`CLIENTE`** | Lucas Gabriel de Freitas Silva | `cliente@exemplo.com` | `Senha@123` | Realização de pedidos (Web/App), consulta de cardápio e saldo do programa de fidelidade LGPD. |
| **`ATENDENTE`** | Maria Silva | `atendente@raizesdonordeste.com.br` | `Senha@123` | Operação do caixa de atendimento presencial (`BALCAO` e `PICKUP`), com calculadora de troco em dinheiro. |
| **`COZINHA`** | Severino José | `cozinha@raizesdonordeste.com.br` | `Senha@123` | Operador do painel KDS, transiciona o status do pedido para `PRONTO` e `ENTREGUE`. |
| **`ADMIN`** | Administrador Franquia | `admin@raizesdonordeste.com.br` | `Admin@123` | Acesso total irrestrito: consulta de trilha de auditoria (`audit_logs`), relatórios e gestão de estoque. |

### 🧭 Onde e Como Testar os Logins?

Os testes de autenticação e perfis podem ser executados de **três formas distintas**:

#### Opção A — Pelo Próprio Site (`http://localhost:3000/demo`):
1. No cabeçalho superior do site, clique no botão **`👤 Entrar / Perfis`**;
2. Abre-se um modal interativo com cards de preenchimento rápido de 1 clique para os 4 usuários;
3. Clique em qualquer um dos perfis (ex.: *Maria Silva - Atendente* ou *Severino José - Cozinha*) e clique em **`⚡ Autenticar e Obter Token JWT`**;
4. O sistema emitirá o token Bearer JWT real da API, exibindo o crachá do perfil ativo no cabeçalho e sincronizando a identidade nas telas dos canais (ex.: crachá no Balcão, pontos no App, permissões no KDS);
5. Na aba *"Novo Cadastro"*, você também pode cadastrar novos usuários com aceite mandatório da LGPD.

#### Opção B — Pelo Swagger UI (`http://localhost:3000/api-docs`):
1. Acesse o Swagger e localize a rota `POST /auth/login`;
2. Clique em **Try it out**, envie o JSON com e-mail e senha de qualquer perfil e clique em **Execute**;
3. Copie o `accessToken` gerado na resposta;
4. Role até o topo da página do Swagger, clique no botão verde **Authorize**, digite `Bearer <seu-token>` e clique em **Authorize** para testar rotas restritas por perfil.

#### Opção C — Pelo Postman / Insomnia:
1. Execute a requisição `[T01 - Positivo] Login com Credenciais Válidas`;
2. O Postman salvará automaticamente o token nas variáveis de ambiente da coleção para as requisições subsequentes.

---

## 🛍️ 7. Demonstração Prática da Multicanalidade (`/demo`)

Ao acessar `http://localhost:3000/demo`, o avaliador pode experimentar diretamente as particularidades operacionais de cada canal de venda:

1. **🖥️ TOTEM (Autoatendimento Presencial):**
   - Interface em estilo quiosque touch-screen;
   - Identificação do cliente por CPF opcional (com teclado numérico touch virtual);
   - Pagamento simulado direto no terminal com contagem regressiva;
   - Emissão de comprovante térmico com **Senha de Chamada** (`SENHA #T-XXX`).
2. **📱 APP (Aplicativo Móvel "Raízes no Bolso"):**
   - Mockup realista de smartphone com navegação inferior;
   - Autenticação Bearer JWT real;
   - Consulta e resgate do saldo de fidelidade LGPD em tempo real (`GET /fidelidade/saldo`);
   - Cálculo automático de taxa de conveniência/delivery (R$ 5,90) e endereço;
   - Esteira animada de rastreamento de status do pedido em tempo real.
3. **🏪 BALCÃO (Terminal PDV do Atendente de Caixa):**
   - Frente de caixa comercial com teclas de acesso rápido `[F1..F8]`;
   - Suporte a cliente avulso / consumidor não identificado;
   - Pagamento em **DINHEIRO com calculadora de Troco automática** em tempo real;
   - Emissão de comanda térmica de conferência fiscal.
4. **📦 PICKUP (Retirada Rápida Agendada em Loja):**
   - Seletor de janelas de horário programado (em 15 min, 30 min, 45 min, 1 hora);
   - Atribuição automática da **Baia Express B-03** da unidade física;
   - Emissão de voucher digital com PIN de segurança de 4 dígitos e QR Code.
5. **🌐 WEB (Portal Web Delivery & E-commerce):**
   - Vitrine completa categorizada por pratos típicos nordestinos;
   - Carrinho lateral retrátil (*drawer*) e simulador mock de pagamento (Aprovado, Recusado e Timeout 503).
6. **👨‍🍳 COZINHA (KDS - Kitchen Display System):**
   - Painel Kanban de produção onde todos os pedidos criados em qualquer canal chegam com a etiqueta do canal (`TOTEM`, `APP`, `BALCAO`, `PICKUP`, `WEB`);
   - Transição controlada de estados (`EM_PREPARO` ➔ `PRONTO` ➔ `ENTREGUE`).
7. **📊 MONITOR MULTICANAL & AUDITORIA REST:**
   - Métricas comparativas em tempo real de pedidos por canal;
   - Console de auditoria exibindo o payload JSON de cada requisição HTTP enviada e a resposta da API.

---

## 🧪 8. Plano de Testes e Validação Reproduzível

O projeto acompanha a coleção oficial Postman `raizes_nordeste_postman_collection.json`, contendo **10 cenários estruturados** cobrindo fluxos esperados e regras de exceção exigidas pelo Roteiro UNINTER:

| ID | Cenário | Método + Endpoint | Saída Esperada | Validação no Roteiro |
|---|---|---|---|---|
| **T01** | Login com credenciais válidas | `POST /api/v1/auth/login` | 200 OK + Bearer Token | Autenticação & Emissão JWT |
| **T02** | Acesso a recurso protegido sem token | `GET /api/v1/pedidos` | 401 Unauthorized | Proteção de Rotas Privadas |
| **T03** | Perfil desautorizado na cozinha (RBAC) | `PATCH /api/v1/pedidos/1/status` | 403 Forbidden | Autorização por Papel (Role) |
| **T04** | Criação de pedido sem `canalPedido` | `POST /api/v1/pedidos` | 422 Unprocessable Entity | Validação de Multicanalidade |
| **T05** | Consulta de cardápio por unidade física | `GET /api/v1/unidades/1/produtos` | 200 OK com estoques | Isolamento de Estoque por Filial |
| **T06** | Criação de pedido com canal `TOTEM` | `POST /api/v1/pedidos` | 201 Created | Fluxo A - Criação de Pedido |
| **T07** | Pedido com quantidade superior ao estoque | `POST /api/v1/pedidos` | 409 Conflict | Bloqueio de Overselling (ACID) |
| **T08** | Pagamento mock simulando recusa | `POST /api/v1/pedidos/:id/pagamento` | 400 Bad Request | Gateway Mock - Cenário Negativo |
| **T09** | Pagamento mock simulando aprovação | `POST /api/v1/pedidos/:id/pagamento` | 200 OK (vai p/ `EM_PREPARO`) | Gateway Mock - Sucesso |
| **T10** | Consulta de logs de auditoria (Admin) | `GET /api/v1/auditoria` | 200 OK com registros | Trilha de Auditoria Indelével |

### Como Executar os Testes via Postman:
1. Abra o Postman e clique em **Import**;
2. Selecione o arquivo `raizes_nordeste_postman_collection.json` localizado na raiz do projeto;
3. Execute o request `[T01 - Positivo] Login com Credenciais Válidas` para obter o token;
4. Execute as requisições em sequência.

---

## 📜 9. Declaração Obrigatória de Uso de IA

Em estrita observância às orientações da UNINTER (página 4 do Roteiro), declara-se que ferramentas de Inteligência Artificial foram utilizadas exclusivamente para fins de revisão ortográfica, auxílio na diagramação visual e conformidade com as normas da ABNT. A concepção arquitetural, a modelagem de dados (DER e Classes), a lógica de negócio de multicanalidade, os testes e o código da aplicação foram desenvolvidos, implementados e validados pelo estudante.

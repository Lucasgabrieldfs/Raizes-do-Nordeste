import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Configurações globais de estilo
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

NAVY_PRIMARY = '#08285C'
NAVY_LIGHT = '#EBF1F8'
GOLD_ACCENT = '#E5A823'
GOLD_LIGHT = '#FEF3C7'
BORDER_GRAY = '#CBD5E1'
TEXT_DARK = '#1E293B'
GREEN_ACCENT = '#059669'
GREEN_LIGHT = '#D1FAE5'
RED_ACCENT = '#DC2626'
RED_LIGHT = '#FEE2E2'

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'diagrams')
os.makedirs(OUT_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# 1. DIAGRAMA DE CASOS DE USO (UML)
# -----------------------------------------------------------------------------
def generate_use_case_diagram():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7.5)
    ax.axis('off')

    # Fundo do Sistema (System Boundary)
    sys_box = patches.FancyBboxPatch((2.2, 0.4), 6.6, 6.7, boxstyle="round,pad=0.2",
                                     fc='#FFFFFF', ec=NAVY_PRIMARY, lw=2.5, zorder=1)
    ax.add_patch(sys_box)
    ax.text(5.5, 6.8, 'Sistema de Back-End - Rede "Raízes do Nordeste"', 
            ha='center', va='center', fontsize=12, fontweight='bold', color=NAVY_PRIMARY)

    # Atores
    actors = [
        {'name': 'Cliente\n(App/Totem/Web)', 'pos': (1.1, 5.2)},
        {'name': 'Atendente\n(Balcão/Pickup)', 'pos': (1.1, 2.6)},
        {'name': 'Cozinha\n(Chef KDS)', 'pos': (9.9, 5.2)},
        {'name': 'Administrador\n(Franqueador)', 'pos': (9.9, 2.4)},
        {'name': 'Gateway Mock\n(Serviço Externo)', 'pos': (5.5, 0.15)}
    ]

    for act in actors:
        x, y = act['pos']
        # Cabeça
        circle = patches.Circle((x, y + 0.35), 0.18, fc=GOLD_LIGHT, ec=NAVY_PRIMARY, lw=1.8, zorder=3)
        ax.add_patch(circle)
        # Tronco
        ax.plot([x, x], [y + 0.17, y - 0.2], color=NAVY_PRIMARY, lw=2, zorder=3)
        # Braços
        ax.plot([x - 0.25, x + 0.25], [y + 0.05, y + 0.05], color=NAVY_PRIMARY, lw=2, zorder=3)
        # Pernas
        ax.plot([x, x - 0.2], [y - 0.2, y - 0.45], color=NAVY_PRIMARY, lw=2, zorder=3)
        ax.plot([x, x + 0.2], [y - 0.2, y - 0.45], color=NAVY_PRIMARY, lw=2, zorder=3)
        # Nome do Ator
        ax.text(x, y - 0.7, act['name'], ha='center', va='top', fontsize=8.5, fontweight='bold', color=NAVY_PRIMARY)

    # Casos de Uso (Elipses)
    use_cases = [
        {'id': 'UC01', 'name': 'Consultar Cardápio\ne Estoque por Loja', 'pos': (3.6, 6.0), 'w': 2.2, 'h': 0.65},
        {'id': 'UC02', 'name': 'Criar Pedido Multicanal\n(com canalPedido)', 'pos': (3.6, 4.8), 'w': 2.3, 'h': 0.75},
        {'id': 'UC03', 'name': 'Validar e Baixar\nEstoque Atômico', 'pos': (6.9, 4.8), 'w': 2.1, 'h': 0.75},
        {'id': 'UC04', 'name': 'Processar Pagamento\nMock Desacoplado', 'pos': (5.5, 3.4), 'w': 2.4, 'h': 0.75},
        {'id': 'UC05', 'name': 'Pontuar no Programa\nFidelidade (LGPD)', 'pos': (3.7, 2.0), 'w': 2.3, 'h': 0.75},
        {'id': 'UC06', 'name': 'Atualizar Status do\nPedido na Cozinha (KDS)', 'pos': (7.3, 3.4), 'w': 2.4, 'h': 0.75},
        {'id': 'UC07', 'name': 'Consultar Trilha\nde Auditoria', 'pos': (7.3, 1.8), 'w': 2.1, 'h': 0.65},
        {'id': 'UC08', 'name': 'Autenticar com JWT\ne Perfis (RBAC)', 'pos': (5.5, 6.0), 'w': 2.2, 'h': 0.65}
    ]

    for uc in use_cases:
        x, y = uc['pos']
        w, h = uc['w'], uc['h']
        ellipse = patches.Ellipse((x, y), w, h, fc=NAVY_LIGHT, ec=NAVY_PRIMARY, lw=1.6, zorder=2)
        ax.add_patch(ellipse)
        ax.text(x, y, uc['name'], ha='center', va='center', fontsize=7.5, fontweight='bold', color=TEXT_DARK, zorder=4)

    # Conexões Ator -> Caso de Uso
    lines = [
        ((1.3, 5.2), (2.5, 6.0)), # Cliente -> UC01
        ((1.3, 5.2), (2.45, 4.8)), # Cliente -> UC02
        ((1.3, 2.6), (2.5, 4.8)), # Atendente -> UC02
        ((1.3, 5.2), (2.55, 2.0)), # Cliente -> UC05
        ((8.7, 5.2), (8.5, 3.4)), # Cozinha -> UC06
        ((8.7, 2.4), (8.35, 1.8)), # Admin -> UC07
        ((5.5, 0.8), (5.5, 3.0)), # Mock -> UC04
    ]
    for start, end in lines:
        ax.annotate('', xy=end, xytext=start,
                    arrowprops=dict(arrowstyle='-', color=NAVY_PRIMARY, lw=1.3, zorder=2))

    # Relacionamentos <<include>> e <<extend>>
    includes = [
        ((4.75, 4.8), (5.85, 4.8), '<<include>>'), # UC02 -> UC03
        ((4.2, 4.45), (4.9, 3.75), '<<include>>'), # UC02 -> UC04
        ((5.5, 3.77), (5.5, 5.67), '<<extend>>'), # UC04 -> UC08
    ]
    for start, end, label in includes:
        ax.annotate(label, xy=end, xytext=start,
                    ha='center', va='bottom', fontsize=7, fontweight='bold', color='#B45309',
                    arrowprops=dict(arrowstyle='->', color='#B45309', lw=1.4, ls='--', zorder=3))

    out_path = os.path.join(OUT_DIR, 'diagrama_casos_de_uso.png')
    plt.tight_layout()
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print('Casos de Uso salvo em:', out_path)

# -----------------------------------------------------------------------------
# 2. DIAGRAMA ENTIDADE-RELACIONAMENTO (DER)
# -----------------------------------------------------------------------------
def generate_der_diagram():
    fig, ax = plt.subplots(figsize=(12, 8.5), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    tables = [
        {
            'name': 'usuarios',
            'pos': (0.6, 5.6), 'w': 2.4, 'h': 2.4,
            'pk': ['PK: id (INT)'],
            'attrs': ['nome (VARCHAR)', 'email (VARCHAR, UNIQUE)', 'senha (VARCHAR/BCRYPT)', 'perfil (ENUM)', 'telefone (VARCHAR)', 'consentimentoLGPD (BOOL)']
        },
        {
            'name': 'unidades',
            'pos': (4.8, 5.6), 'w': 2.4, 'h': 2.4,
            'pk': ['PK: id (INT)'],
            'attrs': ['nome (VARCHAR)', 'endereco (VARCHAR)', 'cidade (VARCHAR)', 'estado (CHAR(2))', 'telefone (VARCHAR)', 'ativo (BOOLEAN)']
        },
        {
            'name': 'produtos',
            'pos': (9.0, 5.6), 'w': 2.4, 'h': 2.4,
            'pk': ['PK: id (INT)'],
            'attrs': ['nome (VARCHAR)', 'descricao (TEXT)', 'categoria (ENUM)', 'preco (DECIMAL)', 'imagem (VARCHAR)', 'ativo (BOOLEAN)']
        },
        {
            'name': 'pedidos',
            'pos': (0.6, 2.2), 'w': 2.6, 'h': 2.7,
            'pk': ['PK: id (INT)'],
            'attrs': ['FK: unidadeId (INT)', 'FK: usuarioId (INT, NULL)', 'canalPedido (ENUM: TOTEM/APP/..)', 'status (ENUM: EM_PREPARO/..)', 'valorTotal (DECIMAL)', 'observacoes (TEXT)', 'criadoEm (DATETIME)']
        },
        {
            'name': 'estoque_unidade',
            'pos': (6.9, 5.6), 'w': 2.5, 'h': 2.0,
            'pk': ['PK: id (INT)'],
            'attrs': ['FK: unidadeId (INT)', 'FK: produtoId (INT)', 'quantidadeDisponivel (INT)', 'quantidadeMinima (INT)', 'UNIQUE(unidadeId, produtoId)']
        },
        {
            'name': 'itens_pedido',
            'pos': (4.6, 2.2), 'w': 2.5, 'h': 2.2,
            'pk': ['PK: id (INT)'],
            'attrs': ['FK: pedidoId (INT)', 'FK: produtoId (INT)', 'quantidade (INT)', 'precoUnitario (DECIMAL)', 'subtotal (DECIMAL)']
        },
        {
            'name': 'transacoes_pagamento',
            'pos': (0.6, 0.1), 'w': 2.6, 'h': 1.8,
            'pk': ['PK: id (INT)'],
            'attrs': ['FK: pedidoId (INT)', 'formaPagamento (ENUM: PIX/..)', 'statusTransacao (ENUM: APROV/..)', 'valorPago (DECIMAL)', 'protocoloMock (VARCHAR)']
        },
        {
            'name': 'fidelidade_pontos',
            'pos': (4.6, 0.1), 'w': 2.5, 'h': 1.8,
            'pk': ['PK: id (INT)'],
            'attrs': ['FK: usuarioId (INT, UNIQUE)', 'cpf (VARCHAR)', 'saldoPontos (INT)', 'consentimentoLGPD (BOOL)', 'atualizadoEm (DATETIME)']
        },
        {
            'name': 'audit_logs',
            'pos': (8.6, 2.2), 'w': 2.8, 'h': 2.0,
            'pk': ['PK: id (INT)'],
            'attrs': ['FK: usuarioId (INT, NULL)', 'acao (VARCHAR)', 'recurso (VARCHAR)', 'payloadResumido (TEXT)', 'enderecoIp (VARCHAR)', 'dataHora (DATETIME, UTC)']
        }
    ]

    for t in tables:
        x, y = t['pos']
        w, h = t['w'], t['h']

        # Header da tabela
        hdr_box = patches.Rectangle((x, y + h - 0.4), w, 0.4, fc=NAVY_PRIMARY, ec=NAVY_PRIMARY, lw=1.2, zorder=2)
        ax.add_patch(hdr_box)
        ax.text(x + w / 2, y + h - 0.2, t['name'].upper(), ha='center', va='center',
                fontsize=8, fontweight='bold', color='#FFFFFF', zorder=3)

        # Corpo da tabela
        body_box = patches.Rectangle((x, y), w, h - 0.4, fc='#FFFFFF', ec=BORDER_GRAY, lw=1.2, zorder=1)
        ax.add_patch(body_box)

        # Linhas de atributos
        curr_y = y + h - 0.65
        for pk in t['pk']:
            ax.text(x + 0.1, curr_y, pk, ha='left', va='center', fontsize=6.8, fontweight='bold', color=GOLD_ACCENT, zorder=3)
            curr_y -= 0.26
        for attr in t['attrs']:
            ax.text(x + 0.1, curr_y, attr, ha='left', va='center', fontsize=6.3, color=TEXT_DARK, zorder=3)
            curr_y -= 0.25

    # Conexões e Cardinalidades
    conns = [
        ((3.2, 3.5), (4.6, 3.5), '1', 'N'), # pedidos 1 -> N itens_pedido
        ((7.1, 3.5), (9.0, 5.8), 'N', '1'), # itens_pedido N -> 1 produtos
        ((1.8, 2.2), (1.8, 1.9), '1', 'N'), # pedidos 1 -> N pagamentos
        ((1.8, 5.6), (1.8, 4.9), '1', 'N'), # usuarios 1 -> N pedidos
        ((4.8, 6.6), (3.2, 3.9), '1', 'N'), # unidades 1 -> N pedidos
        ((7.2, 5.6), (6.0, 6.0), 'N', '1'), # estoque N -> 1 unidades
        ((9.4, 5.6), (9.0, 6.0), '1', 'N'), # produtos 1 -> N estoque
        ((3.0, 5.6), (4.6, 1.2), '1', '1'), # usuarios 1 -> 1 fidelidade
        ((7.1, 2.8), (8.6, 2.8), '1', 'N'), # usuarios -> audit_logs
    ]
    for start, end, c1, c2 in conns:
        ax.plot([start[0], end[0]], [start[1], end[1]], color=NAVY_PRIMARY, lw=1.4, zorder=2)
        ax.text(start[0], start[1] + 0.08, c1, fontsize=7, fontweight='bold', color=GOLD_ACCENT)
        ax.text(end[0], end[1] + 0.08, c2, fontsize=7, fontweight='bold', color=GOLD_ACCENT)

    out_path = os.path.join(OUT_DIR, 'diagrama_der.png')
    plt.tight_layout()
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print('DER salvo em:', out_path)

# -----------------------------------------------------------------------------
# 3. DIAGRAMA DE ARQUITETURA EM CAMADAS (CLEAN / LAYERED)
# -----------------------------------------------------------------------------
def generate_architecture_diagram():
    fig, ax = plt.subplots(figsize=(10.5, 7.5), dpi=300)
    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 7.5)
    ax.axis('off')

    layers = [
        {
            'name': '1. CAMADA DE APRESENTAÇÃO / API (Presentation & Delivery)',
            'pos': (0.8, 5.6), 'w': 8.9, 'h': 1.5,
            'color': '#1E3A8A', 'bg': '#EFF6FF',
            'components': [
                'Express Router (/api/v1)',
                'Middlewares: Auth JWT, RBAC por Role, Zod Validation',
                'Tratador Global de Erros RFC 7807',
                'Swagger UI (/api-docs)'
            ]
        },
        {
            'name': '2. CAMADA DE APLICAÇÃO (Application / Casos de Uso)',
            'pos': (0.8, 3.8), 'w': 8.9, 'h': 1.5,
            'color': '#065F46', 'bg': '#ECFDF5',
            'components': [
                'PedidoController & Orquestração de Negócio',
                'Validador Atômico de Estoque por Filial',
                'Simulador de Desacoplamento Mock de Pagamento',
                'Gestão da Máquina de Estados da Cozinha (KDS)'
            ]
        },
        {
            'name': '3. CAMADA DE DOMÍNIO (Domain Core)',
            'pos': (0.8, 2.0), 'w': 8.9, 'h': 1.5,
            'color': '#9A3412', 'bg': '#FFF7ED',
            'components': [
                'Enums Nativos: canalPedido (APP, TOTEM, BALCAO, PICKUP, WEB)',
                'Enums de Ciclo: statusPedido (AGUARDANDO_PAGAMENTO -> EM_PREPARO -> ..)',
                'Regras Invariantes: Saldo >= 0, Bloqueio de Duplicidade, Atomicidade ACID',
                'Termos e Bases Legais da LGPD (Art. 7º, I e II)'
            ]
        },
        {
            'name': '4. CAMADA DE INFRAESTRUTURA & PERSISTÊNCIA (Infrastructure)',
            'pos': (0.8, 0.2), 'w': 8.9, 'h': 1.5,
            'color': '#475569', 'bg': '#F8FAFC',
            'components': [
                'Prisma Client (ORM com Transações Atômicas $transaction)',
                'Banco Embarcado SQLite (dev.db) - Zero-Friction',
                'Serviço Desacoplado MockPaymentService',
                'AuditLogger (Tabela audit_logs Imutável / Append-Only)'
            ]
        }
    ]

    for lay in layers:
        x, y = lay['pos']
        w, h = lay['w'], lay['h']

        # Box principal
        box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15",
                                     fc=lay['bg'], ec=lay['color'], lw=2, zorder=1)
        ax.add_patch(box)

        # Título da Camada
        ax.text(x + 0.3, y + h - 0.3, lay['name'], fontsize=9, fontweight='bold', color=lay['color'], zorder=2)

        # Componentes
        cx = x + 0.5
        cy = y + h - 0.65
        for comp in lay['components']:
            ax.text(cx, cy, f"• {comp}", fontsize=7.8, color=TEXT_DARK, zorder=2)
            cy -= 0.23

    # Setas de dependência unidirecionais entre camadas
    arrows = [
        ((5.25, 5.6), (5.25, 5.3)),
        ((5.25, 3.8), (5.25, 3.5)),
        ((5.25, 2.0), (5.25, 1.7))
    ]
    for start, end in arrows:
        ax.annotate('invoca / depende de', xy=end, xytext=start,
                    ha='center', va='center', fontsize=7, fontweight='bold', color=NAVY_PRIMARY,
                    arrowprops=dict(arrowstyle='->', color=NAVY_PRIMARY, lw=2, zorder=3))

    out_path = os.path.join(OUT_DIR, 'diagrama_arquitetura.png')
    plt.tight_layout()
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print('Arquitetura salva em:', out_path)

# -----------------------------------------------------------------------------
# 4. DIAGRAMA DE SEQUÊNCIA (FLUXO CRÍTICO: PEDIDO -> MOCK -> KDS)
# -----------------------------------------------------------------------------
def generate_sequence_diagram():
    fig, ax = plt.subplots(figsize=(12, 8.5), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    participants = [
        {'name': 'Cliente / Totem\n(Front-End)', 'x': 1.2},
        {'name': 'API REST\n(PedidoController)', 'x': 3.8},
        {'name': 'Prisma ORM\n(Estoque / ACID)', 'x': 6.4},
        {'name': 'MockPayment\n(Gateway Desacoplado)', 'x': 8.8},
        {'name': 'Cozinha KDS\n(Display de Preparo)', 'x': 10.8}
    ]

    for p in participants:
        x = p['x']
        # Caixa do participante topo
        box = patches.FancyBboxPatch((x - 0.9, 7.6), 1.8, 0.7, boxstyle="round,pad=0.1",
                                     fc=NAVY_PRIMARY, ec=NAVY_PRIMARY, lw=1.2, zorder=2)
        ax.add_patch(box)
        ax.text(x, 7.95, p['name'], ha='center', va='center', fontsize=7.5, fontweight='bold', color='#FFFFFF', zorder=3)

        # Linha de vida
        ax.plot([x, x], [1.0, 7.6], color=BORDER_GRAY, lw=1.5, ls='--', zorder=1)

    # Mensagens de Sequência
    steps = [
        {'from': 1.2, 'to': 3.8, 'y': 7.1, 'text': '1: POST /pedidos (canalPedido: "TOTEM", itens, unidadeId)', 'ret': False},
        {'from': 3.8, 'to': 6.4, 'y': 6.6, 'text': '2: $transaction: Verifica saldo por filial & Dedução atômica', 'ret': False},
        {'from': 6.4, 'to': 3.8, 'y': 6.1, 'text': '3: Saldo confirmado e itens decrementados no SQLite', 'ret': True},
        {'from': 3.8, 'to': 1.2, 'y': 5.6, 'text': '4: 201 Created (pedidoId: 9001, status: AGUARDANDO_PAGAMENTO)', 'ret': True},
        {'from': 1.2, 'to': 3.8, 'y': 4.9, 'text': '5: POST /pedidos/9001/pagamento (PIX, statusSimulado: APROVADO)', 'ret': False},
        {'from': 3.8, 'to': 8.8, 'y': 4.3, 'text': '6: processPayment({ pedidoId, valor, forma, statusSimulado })', 'ret': False},
        {'from': 8.8, 'to': 3.8, 'y': 3.7, 'text': '7: Sucesso Mock (protocolo: MOCK-TX-..., autorizacao: AUTH-...)', 'ret': True},
        {'from': 3.8, 'to': 6.4, 'y': 3.1, 'text': '8: Transiciona status para EM_PREPARO + Pontos Fidelidade', 'ret': False},
        {'from': 3.8, 'to': 10.8, 'y': 2.5, 'text': '9: Notifica esteira KDS: Pedido #9001 disponível para produção', 'ret': False},
        {'from': 3.8, 'to': 1.2, 'y': 1.9, 'text': '10: 200 OK (Pagamento Aprovado, novoStatus: EM_PREPARO)', 'ret': True},
        {'from': 10.8, 'to': 3.8, 'y': 1.3, 'text': '11: PATCH /pedidos/9001/status (novoStatus: PRONTO / ENTREGUE)', 'ret': False}
    ]

    for s in steps:
        y = s['y']
        x1, x2 = s['from'], s['to']
        is_ret = s['ret']

        ls = '--' if is_ret else '-'
        col = GREEN_ACCENT if '200' in s['text'] or '201' in s['text'] or 'Sucesso' in s['text'] else NAVY_PRIMARY

        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle='->', color=col, lw=1.5, ls=ls, zorder=2))

        # Texto da mensagem
        mid_x = (x1 + x2) / 2
        ax.text(mid_x, y + 0.12, s['text'], ha='center', va='bottom', fontsize=6.8, fontweight='bold', color=TEXT_DARK, zorder=3)

    out_path = os.path.join(OUT_DIR, 'diagrama_sequencia.png')
    plt.tight_layout()
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print('Sequência salva em:', out_path)

# -----------------------------------------------------------------------------
# 5. DIAGRAMA DE CLASSES (VISÃO DE DOMÍNIO - UML)
# -----------------------------------------------------------------------------
def generate_class_diagram():
    fig, ax = plt.subplots(figsize=(12, 8.5), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    classes = [
        {
            'name': '<<entity>>\\nUsuario',
            'pos': (0.6, 5.5), 'w': 2.5, 'h': 2.5,
            'attrs': ['- id: int', '- nome: string', '- email: string', '- senhaHash: string', '- perfil: RoleUsuarioEnum', '- consentimentoLGPD: bool'],
            'methods': ['+ autenticar(senha): bool', '+ possuiPermissao(role): bool']
        },
        {
            'name': '<<entity>>\\nUnidade',
            'pos': (4.8, 5.5), 'w': 2.5, 'h': 2.5,
            'attrs': ['- id: int', '- nome: string', '- endereco: string', '- cidade: string', '- estado: string', '- ativo: bool'],
            'methods': ['+ consultarEstoque(): List', '+ estaAtiva(): bool']
        },
        {
            'name': '<<entity>>\\nProduto',
            'pos': (9.0, 5.5), 'w': 2.5, 'h': 2.5,
            'attrs': ['- id: int', '- nome: string', '- categoria: string', '- preco: float', '- ativo: bool'],
            'methods': ['+ obterPreco(): float', '+ validarAtivo(): bool']
        },
        {
            'name': '<<aggregate root>>\\nPedido',
            'pos': (0.6, 1.8), 'w': 2.6, 'h': 3.1,
            'attrs': ['- id: int', '- unidadeId: int', '- usuarioId: int?', '- canalPedido: CanalPedidoEnum', '- status: StatusPedidoEnum', '- valorTotal: float', '- criadoEm: DateTime'],
            'methods': ['+ calcularTotal(): float', '+ transicionarStatus(novo)', '+ validarCanal(): bool']
        },
        {
            'name': '<<entity>>\\nItemPedido',
            'pos': (4.8, 2.5), 'w': 2.5, 'h': 2.2,
            'attrs': ['- id: int', '- pedidoId: int', '- produtoId: int', '- quantidade: int', '- precoUnitario: float', '- subtotal: float'],
            'methods': ['+ calcularSubtotal(): float']
        },
        {
            'name': '<<entity>>\\nEstoqueUnidade',
            'pos': (9.0, 2.5), 'w': 2.5, 'h': 2.2,
            'attrs': ['- id: int', '- unidadeId: int', '- produtoId: int', '- quantidadeDisponivel: int'],
            'methods': ['+ decrementar(qtd): void', '+ temSaldo(qtd): bool']
        },
        {
            'name': '<<entity>>\\nFidelidadePontos',
            'pos': (4.8, 0.2), 'w': 2.5, 'h': 1.8,
            'attrs': ['- id: int', '- usuarioId: int', '- cpf: string?', '- saldoPontos: int', '- consentimentoLGPD: bool'],
            'methods': ['+ creditarPontos(valor): int', '+ resgatar(pts): bool']
        },
        {
            'name': '<<entity>>\\nTransacaoPagamento',
            'pos': (0.6, 0.1), 'w': 2.6, 'h': 1.5,
            'attrs': ['- id: int', '- pedidoId: int', '- forma: FormaPagtoEnum', '- status: StatusTransacaoEnum', '- protocoloMock: string'],
            'methods': ['+ processarMock(): bool']
        }
    ]

    for c in classes:
        x, y = c['pos']
        w, h = c['w'], c['h']

        # Header da classe
        hdr_box = patches.Rectangle((x, y + h - 0.5), w, 0.5, fc=NAVY_PRIMARY, ec=NAVY_PRIMARY, lw=1.2, zorder=2)
        ax.add_patch(hdr_box)
        ax.text(x + w / 2, y + h - 0.25, c['name'], ha='center', va='center',
                fontsize=7.5, fontweight='bold', color='#FFFFFF', zorder=3)

        # Corpo com atributos e métodos
        body_box = patches.Rectangle((x, y), w, h - 0.5, fc='#FFFFFF', ec=BORDER_GRAY, lw=1.2, zorder=1)
        ax.add_patch(body_box)

        curr_y = y + h - 0.72
        for attr in c['attrs']:
            ax.text(x + 0.1, curr_y, attr, ha='left', va='center', fontsize=6.2, color=TEXT_DARK, zorder=3)
            curr_y -= 0.21

        # Divisor de métodos
        ax.plot([x, x + w], [curr_y + 0.08, curr_y + 0.08], color=BORDER_GRAY, lw=0.8, zorder=2)
        curr_y -= 0.12

        for meth in c['methods']:
            ax.text(x + 0.1, curr_y, meth, ha='left', va='center', fontsize=6.2, fontstyle='italic', color='#0369a1', zorder=3)
            curr_y -= 0.21

    # Associações entre classes
    conns = [
        ((3.2, 3.6), (4.8, 3.6), '1', '*'), # Pedido 1 -> * ItemPedido
        ((7.3, 3.6), (9.0, 5.8), '*', '1'), # ItemPedido * -> 1 Produto
        ((1.9, 1.8), (1.9, 1.6), '1', '*'), # Pedido 1 -> * TransacaoPagamento
        ((1.9, 5.5), (1.9, 4.9), '1', '*'), # Usuario 1 -> * Pedido
        ((3.1, 5.8), (4.8, 1.1), '1', '0..1'), # Usuario 1 -> 0..1 Fidelidade
        ((6.0, 5.5), (9.0, 3.6), '1', '*'), # Unidade 1 -> * EstoqueUnidade
        ((9.5, 5.5), (9.5, 4.7), '1', '*'), # Produto 1 -> * EstoqueUnidade
    ]
    for start, end, c1, c2 in conns:
        ax.plot([start[0], end[0]], [start[1], end[1]], color=NAVY_PRIMARY, lw=1.4, zorder=2)
        ax.text(start[0], start[1] + 0.08, c1, fontsize=7, fontweight='bold', color=GOLD_ACCENT)
        ax.text(end[0], end[1] + 0.08, c2, fontsize=7, fontweight='bold', color=GOLD_ACCENT)

    out_path = os.path.join(OUT_DIR, 'diagrama_classes.png')
    plt.tight_layout()
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print('Diagrama de Classes salvo em:', out_path)

if __name__ == '__main__':
    generate_use_case_diagram()
    generate_der_diagram()
    generate_architecture_diagram()
    generate_class_diagram()
    generate_sequence_diagram()
    print('Todos os 5 diagramas oficiais foram gerados com sucesso!')

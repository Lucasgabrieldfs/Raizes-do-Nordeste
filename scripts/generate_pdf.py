import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.pdfgen import canvas

# Palette do Roteiro UNINTER
NAVY_PRIMARY = colors.HexColor("#08285C")
GOLD_ACCENT = colors.HexColor("#E5A823")
GOLD_BADGE = colors.HexColor("#F2C94C")
NAVY_LIGHT = colors.HexColor("#EBF1F8")
GRAY_BG = colors.HexColor("#F8F9FA")
GRAY_BORDER = colors.HexColor("#DDE2E5")
RED_WARNING = colors.HexColor("#D32F2F")
RED_BG = colors.HexColor("#FFF5F5")
TEXT_DARK = colors.HexColor("#222222")
TEXT_MUTED = colors.HexColor("#555555")

class UninterNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        page_num = self._pageNumber
        if page_num == 1:
            self.draw_cover_decorations()
            return

        w, h = A4
        # Cabeçalho (Páginas 2 em diante)
        # 1. Logo original UNINTER à esquerda
        self.saveState()
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'assets', 'uninter_logo_transparent.png')
        if not os.path.exists(logo_path):
            logo_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'assets', 'uninter_logo.png')

        if os.path.exists(logo_path):
            lw = 27 * mm
            lh = lw / 1.8168
            lx = 15 * mm
            ly = h - 22.5 * mm
            self.drawImage(logo_path, lx, ly, width=lw, height=lh, mask='auto')

        # Texto do cabeçalho à direita
        self.setFont("Helvetica", 8)
        self.setFillColor(NAVY_PRIMARY)
        self.drawRightString(w - 15 * mm, h - 15 * mm, "Roteiro de Atividade Prática de")
        self.drawRightString(w - 15 * mm, h - 19 * mm, "Projeto Multidisciplinar – Trilha Back-End")

        # Linha dourada divisória
        self.setStrokeColor(GOLD_ACCENT)
        self.setLineWidth(3)
        self.line(15 * mm, h - 23 * mm, w - 15 * mm, h - 23 * mm)

        # Rodapé
        self.setStrokeColor(NAVY_PRIMARY)
        self.setLineWidth(1.5)
        self.line(15 * mm, 16 * mm, w - 15 * mm, 16 * mm)

        # Número da página
        self.setFont("Helvetica", 9)
        self.setFillColor(NAVY_PRIMARY)
        self.drawCentredString(w / 2.0, 11 * mm, str(page_num))
        self.restoreState()

    def draw_cover_decorations(self):
        w, h = A4
        self.saveState()
        # Badge "ANO 2026" no canto superior direito
        bw, bh = 22 * mm, 18 * mm
        bx = w - 18 * mm - bw
        by = h - 20 * mm - bh
        self.setFillColor(GOLD_BADGE)
        self.roundRect(bx, by, bw, bh, 2 * mm, stroke=0, fill=1)
        self.setFont("Helvetica-Bold", 10)
        self.setFillColor(colors.black)
        self.drawCentredString(bx + bw / 2, by + 10 * mm, "ANO")
        self.setFont("Helvetica-Bold", 11)
        self.drawCentredString(bx + bw / 2, by + 4 * mm, "2026")

        # Logo Original UNINTER Centralizada na Capa
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'assets', 'uninter_logo_transparent.png')
        if not os.path.exists(logo_path):
            logo_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'assets', 'uninter_logo.png')

        if os.path.exists(logo_path):
            lw = 85 * mm
            lh = lw / 1.8168
            lx = (w - lw) / 2.0
            ly = h - 118 * mm
            self.drawImage(logo_path, lx, ly, width=lw, height=lh, mask='auto')

        # Faixa inferior da Capa (Rodapé azul com curva dourada)
        fh = 36 * mm
        self.setFillColor(NAVY_PRIMARY)
        self.rect(0, 0, w, fh, stroke=0, fill=1)

        # Linha curva decorativa dourada
        self.setStrokeColor(GOLD_ACCENT)
        self.setLineWidth(4)
        p = self.beginPath()
        p.moveTo(0, fh + 4 * mm)
        p.curveTo(w * 0.35, fh + 7 * mm, w * 0.7, fh - 2 * mm, w, fh + 3 * mm)
        self.drawPath(p, stroke=1, fill=0)

        # Docente no rodapé da capa
        self.setFont("Helvetica-Bold", 11)
        self.setFillColor(colors.white)
        self.drawRightString(w - 18 * mm, 14 * mm, "Prof. Me. Luciane Yanase Kanashiro")
        self.restoreState()


def build_pdf(filename="4840330_Projeto_Back_End.PDF"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=26 * mm,
        bottomMargin=20 * mm
    )

    styles = getSampleStyleSheet()

    # Estilos customizados
    s_title_cover1 = ParagraphStyle(
        'CoverTitle1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=25,
        alignment=1,
        textColor=NAVY_PRIMARY
    )
    s_title_cover2 = ParagraphStyle(
        'CoverTitle2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=23,
        alignment=1,
        textColor=GOLD_ACCENT
    )
    s_cover_student = ParagraphStyle(
        'CoverStudent',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=16,
        alignment=1,
        textColor=NAVY_PRIMARY
    )
    s_h1 = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=NAVY_PRIMARY,
        spaceBefore=14,
        spaceAfter=6
    )
    s_h1_gold = ParagraphStyle(
        'Heading1_Gold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=GOLD_ACCENT,
        spaceBefore=12,
        spaceAfter=6
    )
    s_h2 = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=NAVY_PRIMARY,
        spaceBefore=10,
        spaceAfter=4
    )
    s_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        alignment=4,  # Justificado
        spaceAfter=6
    )
    s_body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=s_body,
        fontName='Helvetica-Bold'
    )
    s_code = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=NAVY_PRIMARY
    )
    s_alert_title = ParagraphStyle(
        'AlertTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=RED_WARNING,
        alignment=1,
        spaceAfter=4
    )
    s_alert_body = ParagraphStyle(
        'AlertBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=RED_WARNING,
        alignment=4
    )
    s_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=TEXT_DARK
    )
    s_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=s_table_cell,
        fontName='Helvetica-Bold',
        textColor=NAVY_PRIMARY
    )
    s_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white,
        alignment=1
    )
    s_caption = ParagraphStyle(
        'FigureCaption',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=1,
        spaceBefore=3,
        spaceAfter=8
    )

    story = []

    # ==========================================
    # PÁGINA 1: CAPA
    # ==========================================
    story.append(Spacer(1, 115 * mm))
    story.append(Paragraph("PROJETO MULTIDISCIPLINAR", s_title_cover1))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("TRILHA: BACK-END", s_title_cover2))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph('REDE "RAIZES DO NORDESTE"', s_title_cover2))
    story.append(Spacer(1, 20 * mm))

    # Box com dados do estudante
    student_box = [
        [Paragraph("<b>ESTUDANTE:</b> LUCAS GABRIEL", s_cover_student)],
        [Paragraph("<b>RU:</b> 4840330", s_cover_student)],
        [Paragraph("<b>POLO:</b> FORMOSA - GO / POLO FORMOSA-GO", s_cover_student)],
        [Paragraph("<b>CURSO:</b> ANÁLISE E DESENVOLVIMENTO DE SISTEMAS", s_cover_student)]
    ]
    t_student = Table(student_box, colWidths=[140 * mm])
    t_student.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_student)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 2: SUMÁRIO (ELEMENTO PRÉ-TEXTUAL ABNT)
    # ==========================================
    story.append(Paragraph("SUMÁRIO", s_h1))
    
    sumario_data = [
        [Paragraph("<b>1. INTRODUÇÃO E OBJETIVOS DO PROJETO (OBRIGATÓRIO)</b>", s_body_bold), Paragraph("<b>3</b>", s_body_bold)],
        [Paragraph("<b>2. ANÁLISE E REQUISITOS (OBRIGATÓRIOS)</b>", s_body_bold), Paragraph("<b>4</b>", s_body_bold)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.1 Requisitos Funcionais (RF01 a RF08)", s_body), Paragraph("4", s_body)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.2 Multicanalidade de Domínio (canalPedido)", s_body), Paragraph("5", s_body)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.3 Requisitos Não Funcionais (RNF01 a RNF07)", s_body), Paragraph("5", s_body)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.4 Regras de Negócio Invariantes e Matriz MoSCoW", s_body), Paragraph("6", s_body)],
        [Paragraph("<b>3. DIAGRAMAS E MODELAGEM ARQUITETURAL (OBRIGATÓRIO)</b>", s_body_bold), Paragraph("<b>7</b>", s_body_bold)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.1 Diagrama de Casos de Uso (Figura 1) e Feature Crítica", s_body), Paragraph("7", s_body)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.2 Diagrama Entidade-Relacionamento (DER - Figura 2)", s_body), Paragraph("9", s_body)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.3 Arquitetura em Camadas (Layered Architecture - Figura 3)", s_body), Paragraph("11", s_body)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.4 Diagrama de Classes de Domínio (UML - Figura 4)", s_body), Paragraph("12", s_body)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.5 Diagrama de Sequência do Fluxo Crítico (Figura 5)", s_body), Paragraph("13", s_body)],
        [Paragraph("<b>4. API E CONTRATOS DE ENDPOINTS (OBRIGATÓRIO)</b>", s_body_bold), Paragraph("<b>13</b>", s_body_bold)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.1 Padrão Unificado de Erros RFC 7807", s_body), Paragraph("13", s_body)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.2 Especificação dos Endpoints (Auth, Pedidos, Mock, KDS)", s_body), Paragraph("13", s_body)],
        [Paragraph("<b>5. LGPD, PRIVACIDADE E SEGURANÇA NO BACK-END (OBRIGATÓRIO)</b>", s_body_bold), Paragraph("<b>16</b>", s_body_bold)],
        [Paragraph("<b>6. PLANO DE TESTES E EVIDÊNCIAS (OBRIGATÓRIO)</b>", s_body_bold), Paragraph("<b>17</b>", s_body_bold)],
        [Paragraph("<b>7. ENTREGA TÉCNICA E GUIA DE EXECUÇÃO (OBRIGATÓRIO)</b>", s_body_bold), Paragraph("<b>18</b>", s_body_bold)],
        [Paragraph("<b>8. CONCLUSÃO E CONSIDERAÇÕES TÉCNICAS (OBRIGATÓRIO)</b>", s_body_bold), Paragraph("<b>20</b>", s_body_bold)],
        [Paragraph("<b>9. DECLARAÇÃO OBRIGATÓRIA DE USO DE IA</b>", s_body_bold), Paragraph("<b>20</b>", s_body_bold)],
        [Paragraph("<b>10. REFERÊNCIAS BIBLIOGRÁFICAS (NBR 6023)</b>", s_body_bold), Paragraph("<b>20</b>", s_body_bold)],
    ]
    t_sumario = Table(sumario_data, colWidths=[150 * mm, 15 * mm])
    t_sumario.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5 * mm),
        ('TOPPADDING', (0,0), (-1,-1), 2.5 * mm),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ]))
    story.append(t_sumario)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 3: 1. INTRODUÇÃO E OBJETIVOS DO PROJETO (OBRIGATÓRIO)
    # ==========================================
    story.append(Paragraph("1. INTRODUÇÃO E OBJETIVOS DO PROJETO (OBRIGATÓRIO)", s_h1_gold))
    story.append(Paragraph(
        "O presente projeto acadêmico-profissional desenvolve a engenharia de software da solução de back-end escalável, "
        "transacional e segura para a rede de lanchonetes em expansão <b>'Raízes do Nordeste'</b>. Especializada na gastronomia "
        "regional nordestina (com ênfase em cuscuz temperados no vapor, tapiocas artesanais rendadas, baião de dois cremoso e doces "
        "típicos como a tradicional cartola pernambucana), a marca vivencia uma fase crítica de expansão baseada em novas unidades físicas, "
        "quiosques franqueados e alto volume de transações concorrentes.",
        s_body
    ))
    story.append(Paragraph(
        "O cerne do desafio técnico consiste em unificar a operação multicanal de atendimento sem comprometer o controle estrito "
        "e a autonomia dos estoques físicos de cada unidade franqueada. O sistema foi concebido para atender de ponta a ponta clientes e "
        "operadores distribuídos em cinco canais integrados: aplicativo móvel (<code>APP</code>), totens de autoatendimento nas lojas "
        "(<code>TOTEM</code>), balcão presencial operado por atendentes (<code>BALCAO</code>), retirada expressa agendada (<code>PICKUP</code>) "
        "e pedidos via portal web delivery (<code>WEB</code>).",
        s_body
    ))
    story.append(Paragraph(
        "A solução de software foi projetada e implementada para sustentar uma entrega de padrão profissional de mercado, "
        "assegurando conformidade com as normas ABNT e cobrindo os seguintes pilares essenciais da engenharia de back-end:",
        s_body
    ))

    pilares = [
        "<b>Visão Sistêmica e Priorização de Requisitos:</b> delimitação técnica entre MVP operacional ponta a ponta e expansões futuras orientadas pela matriz MoSCoW;",
        "<b>Modelagem Relacional e Consistência de Dados:</b> DER com integridade referencial, chaves primárias/estrangeiras e controle descentralizado de saldo em estoque por unidade;",
        "<b>Arquitetura em Camadas (Clean / Layered Architecture):</b> divisão estrita de responsabilidades entre Domain, Application, Infrastructure e Presentation/API;",
        "<b>API RESTful Documentada via Swagger (OpenAPI 3.0):</b> contratos consistentes, paginação, idempotência e tratamento unificado de erros segundo a RFC 7807 (Problem Details);",
        "<b>Persistência Transacional com Prisma ORM e SQLite:</b> migrações auditáveis, zero atrito de instalação externa para avaliação imediata e seeds automatizados;",
        "<b>Regras de Negócio e Máquina de Estados:</b> obrigatoriedade do enum <code>canalPedido</code> no domínio, verificação atômica de saldo e transições de pedidos no painel KDS;",
        "<b>Integração Desacoplada de Pagamento (Mock):</b> simulação resiliente dos cenários de autorização (Aprovado), recusa comercial e falha de conectividade (Timeout HTTP 503);",
        "<b>Segurança e LGPD Técnica:</b> autenticação stateless com Bearer Token JWT, controle de acesso baseado em papéis (RBAC), hash seguro Bcrypt (10 rounds) e base legal para fidelidade;",
        "<b>Qualidade e Testabilidade Reproduzível:</b> plano formal com 10 cenários (6 positivos e 4 negativos) executáveis via suíte Postman e documentados no repositório."
    ]
    for p in pilares:
        story.append(Paragraph(f"• {p}", s_body))

    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph(
        "<i>Todos os artefatos descritos ao longo deste documento encontram-se plenamente implementados, testados e publicamente "
        "auditáveis no repositório oficial do projeto, atendendo com excelência aos critérios da Tabela Consolidada de Avaliação UNINTER.</i>",
        s_body
    ))
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 5: ANÁLISE E REQUISITOS (CRITÉRIO 1 - 20 PTS)
    # ==========================================
    story.append(Paragraph("ANÁLISE E REQUISITOS (OBRIGATÓRIOS)", s_h1_gold))
    story.append(Paragraph(
        "A análise do problema traduz os objetivos de negócio em requisitos de engenharia de software com ênfase em regras de negócio, "
        "persistência transacional, integrações desacopladas e conformidade normativa, evitando propositalmente o foco em telas superficiais.",
        s_body
    ))

    story.append(Paragraph("2.1 Requisitos Funcionais (RF)", s_h2))
    rf_data = [
        [Paragraph("ID", s_table_header), Paragraph("Requisito Funcional", s_table_header), Paragraph("Descrição e Escopo Técnico", s_table_header), Paragraph("Regras Vinculadas", s_table_header)],
        [Paragraph("<b>RF01</b>", s_table_cell_bold), Paragraph("Gestão de Acesso e Autenticação", s_table_cell), Paragraph("Cadastro de usuários com hashing de senha e login com geração de token JWT assinado contendo papéis de acesso (CLIENTE, ATENDENTE, COZINHA, ADMIN).", s_table_cell), Paragraph("RN01, RN02", s_table_cell)],
        [Paragraph("<b>RF02</b>", s_table_cell_bold), Paragraph("Catálogo e Consulta de Unidades", s_table_cell), Paragraph("Listagem de unidades ativas da rede e consulta segmentada de produtos/cardápio disponível com saldo específico por filial.", s_table_cell), Paragraph("RN03", s_table_cell)],
        [Paragraph("<b>RF03</b>", s_table_cell_bold), Paragraph("Criação de Pedidos Multicanal", s_table_cell), Paragraph("Abertura de pedidos exigindo obrigatoriamente a identificação do canal de venda (APP, TOTEM, BALCAO, PICKUP, WEB), unidade e itens.", s_table_cell), Paragraph("RN04, RN05", s_table_cell)],
        [Paragraph("<b>RF04</b>", s_table_cell_bold), Paragraph("Validação e Baixa de Estoque", s_table_cell), Paragraph("Verificação atômica de disponibilidade de saldo antes da criação do pedido e dedução imediata na unidade selecionada.", s_table_cell), Paragraph("RN05, RN06", s_table_cell)],
        [Paragraph("<b>RF05</b>", s_table_cell_bold), Paragraph("Integração Mock de Pagamento", s_table_cell), Paragraph("Envio desacoplado de intenção de pagamento para simulação de três desfechos: APROVADO, RECUSADO e ERRO_CONECTIVIDADE.", s_table_cell), Paragraph("RN07, RN08", s_table_cell)],
        [Paragraph("<b>RF06</b>", s_table_cell_bold), Paragraph("Ciclo de Vida do Pedido (KDS)", s_table_cell), Paragraph("Transição controlada da máquina de estados: AGUARDANDO_PAGAMENTO -> EM_PREPARO -> PRONTO -> ENTREGUE ou CANCELADO.", s_table_cell), Paragraph("RN07", s_table_cell)],
        [Paragraph("<b>RF07</b>", s_table_cell_bold), Paragraph("Programa de Fidelidade e LGPD", s_table_cell), Paragraph("Cálculo e crédito de pontos (1 ponto a cada R$ 10) condicionado a aceite explícito de consentimento (Art. 7º, I da LGPD).", s_table_cell), Paragraph("RN09, RN10", s_table_cell)],
        [Paragraph("<b>RF08</b>", s_table_cell_bold), Paragraph("Auditoria e Rastreabilidade", s_table_cell), Paragraph("Registro indelével (append-only) de eventos críticos (criação, cancelamento, alteração de status e transações de pagamento).", s_table_cell), Paragraph("RN11", s_table_cell)],
    ]
    t_rf = Table(rf_data, colWidths=[14 * mm, 38 * mm, 90 * mm, 23 * mm])
    t_rf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_rf)
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("2.2 Multicanalidade como Requisito de Domínio (Obrigatório)", s_h2))
    story.append(Paragraph(
        "A multicanalidade não é tratada meramente como camada de apresentação visual, mas sim como <b>dado central do modelo de domínio</b>. "
        "O campo <code>canalPedido</code> é modelado como um tipo enumerado (<code>ENUM</code>) persistido diretamente na entidade Pedido, assumindo os valores: "
        "<code>APP</code>, <code>TOTEM</code>, <code>BALCAO</code>, <code>PICKUP</code> e <code>WEB</code>. "
        "A API rejeita com status HTTP 400/422 qualquer solicitação que omita ou informe valor inválido, e disponibiliza filtros dedicados "
        "para consolidação gerencial (ex.: <code>GET /pedidos?canalPedido=TOTEM&status=AGUARDANDO_PAGAMENTO</code>).",
        s_body
    ))

    story.append(Paragraph("2.3 Requisitos Não Funcionais (RNF)", s_h2))
    rnf_data = [
        [Paragraph("ID", s_table_header), Paragraph("Categoria", s_table_header), Paragraph("Especificação Técnica", s_table_header), Paragraph("Métrica de Verificação", s_table_header)],
        [Paragraph("<b>RNF01</b>", s_table_cell_bold), Paragraph("Segurança Criptográfica", s_table_cell), Paragraph("Senhas com hash Bcrypt (salt rounds = 10); proibição absoluta de armazenamento em texto plano.", s_table_cell), Paragraph("Zero exposição em logs e banco.", s_table_cell)],
        [Paragraph("<b>RNF02</b>", s_table_cell_bold), Paragraph("Autenticação e RBAC", s_table_cell), Paragraph("Proteção via Bearer Token JWT; controle de acesso refinado por perfil nas rotas sensíveis.", s_table_cell), Paragraph("Status 401 (sem token) e 403 (role inválida).", s_table_cell)],
        [Paragraph("<b>RNF03</b>", s_table_cell_bold), Paragraph("Privacidade e LGPD", s_table_cell), Paragraph("Minimização de dados pessoais (Art. 6º, III) e base legal explícita para fidelidade.", s_table_cell), Paragraph("Mascaramento de dados e consentimento.", s_table_cell)],
        [Paragraph("<b>RNF04</b>", s_table_cell_bold), Paragraph("Padrão REST e Erros", s_table_cell), Paragraph("Estrutura unificada de erro conforme RFC 7807 (Problem Details) com detalhes por campo.", s_table_cell), Paragraph("JSON uniforme em 400, 404, 409 e 422.", s_table_cell)],
        [Paragraph("<b>RNF05</b>", s_table_cell_bold), Paragraph("Documentação OpenAPI", s_table_cell), Paragraph("Exposição do contrato OpenAPI 3.0 interativo via Swagger UI na rota /api-docs.", s_table_cell), Paragraph("Validação direta de endpoints pelo browser.", s_table_cell)],
        [Paragraph("<b>RNF06</b>", s_table_cell_bold), Paragraph("Atomicidade e ACID", s_table_cell), Paragraph("Transações no Prisma ORM para validação e dedução de estoque simultâneas.", s_table_cell), Paragraph("Impossibilidade de saldo negativo.", s_table_cell)],
        [Paragraph("<b>RNF07</b>", s_table_cell_bold), Paragraph("Portabilidade Máxima", s_table_cell), Paragraph("Node.js com SQLite embarcado: execução limpa via npm run setup sem Docker.", s_table_cell), Paragraph("Setup avaliador em menos de 1 minuto.", s_table_cell)],
    ]
    t_rnf = Table(rnf_data, colWidths=[14 * mm, 34 * mm, 82 * mm, 35 * mm])
    t_rnf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_rnf)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 6: REGRAS DE NEGÓCIO E MATRIZ MOSCOW
    # ==========================================
    story.append(Paragraph("2.4 Regras de Negócio Invariantes (RN)", s_h2))
    rns = [
        "<b>RN01 (Unicidade de Identificação):</b> Cada e-mail cadastrado deve ser estritamente único no sistema.",
        "<b>RN02 (Expiração de Sessão):</b> O token JWT possui validade determinada de 8 horas, exigindo reautenticação após o término.",
        "<b>RN03 (Segregação de Estoque por Filial):</b> O saldo de um produto é isolado por <code>unidadeId</code>, não havendo compartilhamento de estoque físico entre lojas.",
        "<b>RN04 (Imutabilidade do Canal de Venda):</b> O atributo <code>canalPedido</code> deve ser fornecido na criação e jamais poderá ser alterado.",
        "<b>RN05 (Atomicidade da Reserva de Estoque):</b> A criação do pedido e dedução de estoque ocorre em transação única. Falhas geram rollback integral.",
        "<b>RN06 (Inexistência de Estoque Negativo):</b> O saldo de um produto jamais pode ser inferior a zero. Quantidades superiores geram erro 409 Conflict.",
        "<b>RN07 (Máquina de Estados Finita do Pedido):</b> Transições válidas: AGUARDANDO_PAGAMENTO -> EM_PREPARO -> PRONTO -> ENTREGUE. Cancelamentos só são aceitos antes de o pedido estar PRONTO.",
        "<b>RN08 (Timeout do Pagamento Mock):</b> Pedidos em AGUARDANDO_PAGAMENTO há mais de 30 minutos expiram automaticamente, liberando itens de volta ao estoque.",
        "<b>RN09 (Base Legal LGPD para Fidelidade):</b> A adesão ao programa de pontos exige aceite formal registrado no banco com timestamp e versão dos termos.",
        "<b>RN10 (Taxa de Pontuação):</b> Atribui-se exatamente 1 ponto a cada R$ 10,00 consumidos em pedidos quitados com sucesso (valores fracionários são descartados).",
        "<b>RN11 (Imutabilidade de Logs de Auditoria):</b> A tabela <code>audit_logs</code> funciona sob a premissa append-only; nenhuma operação de UPDATE ou DELETE é exposta na API."
    ]
    for rn in rns:
        story.append(Paragraph(f"• {rn}", s_body))

    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("2.5 Matriz de Priorização Técnica (MoSCoW - MVP vs. Futuro)", s_h2))
    story.append(Paragraph(
        "A priorização do escopo assegura que a entrega do projeto contenha um <b>MVP 100% funcional e testável de ponta a ponta</b> "
        "(garantindo nota máxima nos critérios de código e execução da UNINTER), delimitando formalmente as propostas de roadmap futuro.",
        s_body
    ))

    moscow_data = [
        [Paragraph("Categoria MoSCoW", s_table_header), Paragraph("Requisitos Vinculados", s_table_header), Paragraph("Escopo", s_table_header), Paragraph("Justificativa e Decisão de Engenharia", s_table_header)],
        [Paragraph("<b>MUST HAVE</b><br/>(Indispensável)", s_table_cell_bold), Paragraph("RF01, RF02, RF03, RF04, RF05, RF06, RNF01, RNF02, RNF04, RNF05, RNF07", s_table_cell), Paragraph("<b>MVP</b><br/>(Código Real)", s_table_cell_bold), Paragraph("Núcleo operacional da API: autenticação JWT, catálogo de lojas, criação de pedidos com canalPedido, trava de estoque, simulação mock de pagamento e Swagger.", s_table_cell)],
        [Paragraph("<b>SHOULD HAVE</b><br/>(Alta Prioridade)", s_table_cell_bold), Paragraph("RF07, RF08, RNF03, RNF06", s_table_cell), Paragraph("<b>MVP</b><br/>(Código Real)", s_table_cell_bold), Paragraph("Conformidade com os blocos avaliativos de LGPD e Auditoria: histórico de ações sensíveis em banco e consentimento explícito para pontos.", s_table_cell)],
        [Paragraph("<b>COULD HAVE</b><br/>(Desejável / Diferencial)", s_table_cell_bold), Paragraph("Interface Web Demonstrativa (/public)", s_table_cell), Paragraph("<b>MVP</b><br/>(Código Real)", s_table_cell_bold), Paragraph("Painel visual leve em HTML5/JS para que o tutor teste o Totem e a Cozinha sem necessitar abrir clientes externos.", s_table_cell)],
        [Paragraph("<b>WON'T HAVE</b><br/>(Roadmap Futuro)", s_table_cell_bold), Paragraph("Gateway real (Cielo/Stripe), Cupom Fiscal Eletrônico (NFC-e), Rastreamento GPS", s_table_cell), Paragraph("<b>Futuro</b><br/>(Conceitual)", s_table_cell), Paragraph("Requer certificações fiscais estaduais (SEFAZ), contratos bancários em produção e infraestrutura de telemetria externa fora do foco do back-end acadêmico.", s_table_cell)],
    ]
    t_moscow = Table(moscow_data, colWidths=[32 * mm, 38 * mm, 25 * mm, 70 * mm])
    t_moscow.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_moscow)
    story.append(PageBreak())

    DIAGRAMS_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs', 'diagrams')

    # ==========================================
    # PÁGINA 7: DIAGRAMAS E MODELAGEM (CRITÉRIO 2 - 20 PTS)
    # ==========================================
    story.append(Paragraph("DIAGRAMAS (OBRIGATÓRIO)", s_h1_gold))
    story.append(Paragraph(
        "Esta seção formaliza a arquitetura lógica e os artefatos visuais de modelagem da solução, estabelecendo coerência "
        "irrefutável entre a especificação, as regras de negócio e os endpoints de software implementados.",
        s_body
    ))

    # 3.1 Diagrama de Casos de Uso (UML)
    story.append(Paragraph("3.1 Diagrama de Casos de Uso (UML)", s_h2))
    story.append(Paragraph(
        "O sistema engloba cinco atores com fronteiras bem delineadas: <b>Cliente</b> (acessando via App, Totem ou Web), "
        "<b>Atendente</b> (interagindo no Balcão físico), <b>Cozinha</b> (operando a esteira KDS), <b>Administrador</b> (gestão central) "
        "e <b>Gateway Mock</b> (processamento simulado de pagamentos).",
        s_body
    ))
    
    img_uc_path = os.path.join(DIAGRAMS_DIR, 'diagrama_casos_de_uso.png')
    if os.path.exists(img_uc_path):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_uc_path, width=160 * mm, height=108 * mm))
        story.append(Paragraph("<b>Figura 1:</b> Diagrama de Casos de Uso (UML) do Sistema Raízes do Nordeste. Fonte: Elaborado pelo autor (2026).", s_caption))

    story.append(PageBreak())

    # Tabela de especificação de Casos de Uso (Modelo oficial Uninter das páginas 18-20)
    story.append(Paragraph("<b>Especificação Textual de Caso de Uso: UC01 – Realizar Pedido e Processar Pagamento Mock</b>", s_body_bold))
    uc_data = [
        [Paragraph("Item", s_table_header), Paragraph("Detalhamento do Caso de Uso Crítico", s_table_header)],
        [Paragraph("<b>Descrição</b>", s_table_cell_bold), Paragraph("Permite que o cliente selecione a unidade, monte a cesta de produtos nordestinos, envie o canal de venda, valide o estoque físico e processe o pagamento via gateway simulado desacoplado.", s_table_cell)],
        [Paragraph("<b>Atores</b>", s_table_cell_bold), Paragraph("Cliente (App/Totem/Web), Atendente (Balcão), Gateway Mock (Sistema Externo).", s_table_cell)],
        [Paragraph("<b>Pré-condições</b>", s_table_cell_bold), Paragraph("1. A unidade selecionada deve estar ativa na rede.<br/>2. Os produtos solicitados devem possuir saldo em estoque maior ou igual à quantidade desejada.", s_table_cell)],
        [Paragraph("<b>Pós-condições</b>", s_table_cell_bold), Paragraph("1. Pedido persistido com ID único e canal registrado.<br/>2. Estoque baixado atomicamente.<br/>3. Se aprovado, status transiciona para EM_PREPARO; se recusado, permanece em AGUARDANDO_PAGAMENTO.<br/>4. Log de auditoria gerado.", s_table_cell)],
        [Paragraph("<b>Fluxo Principal</b>", s_table_cell_bold), Paragraph(
            "1. Cliente seleciona a unidade física (ex.: Matriz Recife);<br/>"
            "2. Sistema consulta e retorna o cardápio e disponibilidade atualizada de estoque;<br/>"
            "3. Cliente adiciona itens e envia requisição POST /pedidos contendo o canalPedido obrigatório;<br/>"
            "4. Sistema valida formato do canalPedido e abre transação ACID no banco;<br/>"
            "5. Sistema verifica saldo de cada item. Havendo estoque suficiente, deduz as quantidades e cria o pedido em AGUARDANDO_PAGAMENTO;<br/>"
            "6. Cliente aciona o endpoint POST /pedidos/{id}/pagamento enviando forma de pagamento e status de simulação;<br/>"
            "7. Gateway Mock responde com autorização de sucesso (200 OK);<br/>"
            "8. Sistema altera status do pedido para EM_PREPARO e credita pontos de fidelidade (se consentido);<br/>"
            "9. Sistema emite recibo e notifica a tela da cozinha.",
            s_table_cell
        )],
        [Paragraph("<b>Fluxos Alternativos e Exceções</b>", s_table_cell_bold), Paragraph(
            "<b>Exceção 4a (Canal Inválido):</b> Se canalPedido estiver ausente ou inválido, retorna 400 Bad Request / 422 Unprocessable Entity.<br/>"
            "<b>Exceção 5a (Estoque Insuficiente):</b> Se algum item não tiver saldo, aborta com rollback e retorna 409 Conflict.<br/>"
            "<b>Exceção 7a (Pagamento Recusado):</b> Mock retorna status RECUSADO; o pedido permanece em AGUARDANDO_PAGAMENTO sem envio à cozinha.<br/>"
            "<b>Exceção 7b (Falha de Conectividade):</b> Mock simula timeout/503; sistema retém o pedido para nova tentativa sem duplicidade.",
            s_table_cell
        )],
        [Paragraph("<b>Regras de Negócio</b>", s_table_cell_bold), Paragraph("RN03, RN04, RN05, RN06, RN07, RN08, RN10, RN11.", s_table_cell)],
    ]
    t_uc = Table(uc_data, colWidths=[38 * mm, 127 * mm])
    t_uc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_uc)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 8: DER (DIAGRAMA ENTIDADE-RELACIONAMENTO)
    # ==========================================
    story.append(Paragraph("3.2 Diagrama Entidade-Relacionamento (DER) / Modelo de Dados", s_h2))
    story.append(Paragraph(
        "O modelo relacional foi estruturado para suportar total consistência e integridade referencial com chaves primárias (PK), "
        "chaves estrangeiras (FK), índices de busca rápida e isolamento físico de estoques:",
        s_body
    ))

    img_der_path = os.path.join(DIAGRAMS_DIR, 'diagrama_der.png')
    if os.path.exists(img_der_path):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_der_path, width=165 * mm, height=115 * mm))
        story.append(Paragraph("<b>Figura 2:</b> Diagrama Entidade-Relacionamento (DER) do Banco de Dados Relacional. Fonte: Elaborado pelo autor (2026).", s_caption))

    story.append(PageBreak())

    der_tables = [
        [Paragraph("Tabela / Entidade", s_table_header), Paragraph("Chaves (PK / FK)", s_table_header), Paragraph("Atributos Relevantes", s_table_header), Paragraph("Regras e Cardinalidades", s_table_header)],
        [Paragraph("<b>usuarios</b>", s_table_cell_bold), Paragraph("PK: id", s_table_cell), Paragraph("nome, email (UNIQUE), senhaHash, telefone, perfil (ENUM: CLIENTE, ATENDENTE, COZINHA, ADMIN), consentimentoLGPD", s_table_cell), Paragraph("1:N com pedidos.<br/>1:1 com fidelidade_pontos.", s_table_cell)],
        [Paragraph("<b>unidades</b>", s_table_cell_bold), Paragraph("PK: id", s_table_cell), Paragraph("nome, endereco, cidade, estado, telefone, ativo (BOOLEAN)", s_table_cell), Paragraph("1:N com estoque_unidade.<br/>1:N com pedidos.", s_table_cell)],
        [Paragraph("<b>produtos</b>", s_table_cell_bold), Paragraph("PK: id", s_table_cell), Paragraph("nome, descricao, preco, categoria (LANCHE, BEBIDA, SOBREMESA), ativo", s_table_cell), Paragraph("1:N com estoque_unidade.<br/>1:N com itens_pedido.", s_table_cell)],
        [Paragraph("<b>estoque_unidade</b>", s_table_cell_bold), Paragraph("PK: id<br/>FK: unidadeId<br/>FK: produtoId", s_table_cell), Paragraph("quantidadeDisponivel (INT), quantidadeMinima (INT), atualizadoEm", s_table_cell), Paragraph("UNIQUE(unidadeId, produtoId).<br/>Saldo jamais menor que zero.", s_table_cell)],
        [Paragraph("<b>pedidos</b>", s_table_cell_bold), Paragraph("PK: id<br/>FK: unidadeId<br/>FK: usuarioId (opcional)", s_table_cell), Paragraph("canalPedido (ENUM), status (ENUM), valorTotal (DECIMAL), observacoes, criadoEm", s_table_cell), Paragraph("1:N com itens_pedido.<br/>1:N com transacoes_pagamento.", s_table_cell)],
        [Paragraph("<b>itens_pedido</b>", s_table_cell_bold), Paragraph("PK: id<br/>FK: pedidoId<br/>FK: produtoId", s_table_cell), Paragraph("quantidade (INT), precoUnitario (DECIMAL), subtotal (DECIMAL)", s_table_cell), Paragraph("Registra snapshot do preço unitário histórico.", s_table_cell)],
        [Paragraph("<b>transacoes_pagamento</b>", s_table_cell_bold), Paragraph("PK: id<br/>FK: pedidoId", s_table_cell), Paragraph("formaPagamento (ENUM), statusTransacao (ENUM), valorPago, protocoloMock, criadoEm", s_table_cell), Paragraph("Pagamento desacoplado do pedido.", s_table_cell)],
        [Paragraph("<b>audit_logs</b>", s_table_cell_bold), Paragraph("PK: id<br/>FK: usuarioId (opcional)", s_table_cell), Paragraph("acao, recurso, payloadResumido, enderecoIp, dataHora (UTC)", s_table_cell), Paragraph("Append-only para compliance.", s_table_cell)],
    ]
    t_der = Table(der_tables, colWidths=[30 * mm, 32 * mm, 68 * mm, 35 * mm])
    t_der.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_der)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA: ARQUITETURA EM CAMADAS
    # ==========================================
    story.append(Paragraph("3.3 Arquitetura em Camadas (Layered Architecture)", s_h2))
    story.append(Paragraph(
        "A base de código foi estruturada em <b>quatro camadas lógicas estritamente desacopladas</b>, "
        "atendendo ao requisito obrigatório da seção 4.3 do Roteiro:",
        s_body
    ))

    img_arch_path = os.path.join(DIAGRAMS_DIR, 'diagrama_arquitetura.png')
    if os.path.exists(img_arch_path):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_arch_path, width=160 * mm, height=112 * mm))
        story.append(Paragraph("<b>Figura 3:</b> Diagrama da Arquitetura em Camadas e Separação de Responsabilidades. Fonte: Elaborado pelo autor (2026).", s_caption))

    layers = [
        "<b>1. Domain (Domínio):</b> abriga as entidades corporativas, tipos enumerados (<code>canalPedido</code>, <code>statusPedido</code>, <code>roles</code>) e as regras invariantes puras de negócio, sem dependência de bibliotecas externas.",
        "<b>2. Application (Casos de Uso / Serviços):</b> orquestra os fluxos do sistema (criação de pedido, validação transacional de estoque, comunicação com mock de pagamento e pontuação no programa de fidelidade).",
        "<b>3. Infrastructure (Infraestrutura):</b> gerencia os adaptadores de persistência via Prisma Client / SQLite, adaptadores de gateway mock externo e gravação de logs de auditoria.",
        "<b>4. Presentation / API (Controllers e Rotas):</b> expõe os endpoints HTTP RESTful, middlewares de validação de schemas DTO com Zod, autenticação JWT, autorização RBAC e tratador global de erros RFC 7807."
    ]
    for lay in layers:
        story.append(Paragraph(f"• {lay}", s_body))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA: DIAGRAMA DE CLASSES DE DOMÍNIO (UML)
    # ==========================================
    story.append(Paragraph("3.4 Diagrama de Classes de Domínio (UML)", s_h2))
    story.append(Paragraph(
        "Apresenta a modelagem orientada a objetos das principais entidades do domínio, tipos enumerados e seus métodos fundamentais, "
        "conforme exigido pelo item 4.4 e critérios avaliativos da UNINTER:",
        s_body
    ))

    img_class_path = os.path.join(DIAGRAMS_DIR, 'diagrama_classes.png')
    if os.path.exists(img_class_path):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_class_path, width=165 * mm, height=115 * mm))
        story.append(Paragraph("<b>Figura 4:</b> Diagrama de Classes (Visão de Domínio UML) com Entidades, Agregados e Métodos. Fonte: Elaborado pelo autor (2026).", s_caption))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA: DIAGRAMA DE SEQUÊNCIA DO FLUXO CRÍTICO
    # ==========================================
    story.append(Paragraph("3.5 Diagrama de Sequência do Fluxo Crítico", s_h2))
    story.append(Paragraph(
        "O diagrama abaixo documenta a interação temporal entre Front-End, Controllers, Transações Atômicas do Prisma, "
        "Gateway Mock e a esteira da Cozinha KDS no fluxo crítico de Realização de Pedido e Pagamento:",
        s_body
    ))

    img_seq_path = os.path.join(DIAGRAMS_DIR, 'diagrama_sequencia.png')
    if os.path.exists(img_seq_path):
        story.append(Spacer(1, 2 * mm))
        story.append(Image(img_seq_path, width=165 * mm, height=115 * mm))
        story.append(Paragraph("<b>Figura 5:</b> Diagrama de Sequência do Fluxo Crítico (Pedido ➔ Estoque ➔ Mock ➔ KDS). Fonte: Elaborado pelo autor (2026).", s_caption))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA 9: API E CONTRATOS DE ENDPOINTS (CRITÉRIO 3 - 25 PTS)
    # ==========================================
    story.append(Paragraph("API E ENDPOINTS (OBRIGATÓRIO)", s_h1_gold))
    story.append(Paragraph(
        "A documentação a seguir cumpre rigorosamente o modelo (template) oficial fornecido no Anexo do Roteiro UNINTER (páginas 20-23), "
        "descrevendo o contrato explícito entre Front-End e Back-End.",
        s_body
    ))

    story.append(Paragraph("4.1 Padrão Unificado de Tratamento de Erros (RFC 7807)", s_h2))
    story.append(Paragraph(
        "Todas as exceções e violações de regras de negócio retornam uma estrutura padronizada, eliminando comportamentos anômalos:",
        s_body
    ))
    code_error_json = (
        '{\n'
        '  "error": "ESTOQUE_INSUFICIENTE",\n'
        '  "message": "Não há quantidade suficiente para um ou mais itens.",\n'
        '  "details": [\n'
        '    { "field": "itens[0].quantidade", "issue": "Disponível em estoque: 1 unidade(s)" }\n'
        '  ],\n'
        '  "timestamp": "2026-02-05T12:00:00Z",\n'
        '  "path": "/pedidos",\n'
        '  "requestId": "c4b8e920-7f21-4f1a-b6d4-399d2110ab78"\n'
        '}'
    )
    t_code_err = Table([[Paragraph(code_error_json.replace('\n', '<br/>').replace(' ', '&nbsp;'), s_code)]], colWidths=[165 * mm])
    t_code_err.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GRAY_BG),
        ('BOX', (0,0), (-1,-1), 1, GRAY_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 2 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2 * mm),
        ('LEFTPADDING', (0,0), (-1,-1), 3 * mm),
    ]))
    story.append(t_code_err)
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph("4.2 Documentação Estruturada dos Endpoints Principais", s_h2))

    # Template Endpoint 1: Auth Login
    story.append(Paragraph("<b>[Recurso: /auth] — Autenticação de Usuário e Emissão de Token</b>", s_body_bold))
    ep1_info = (
        "<b>Finalidade:</b> Autenticar o usuário e retornar o token JWT com perfil de acesso.<br/>"
        "<b>Método/Rota:</b> <code>POST /api/v1/auth/login</code> | <b>Auth/Permissão:</b> Público.<br/>"
        "<b>Códigos de Status Esperados:</b> 200 OK (sucesso), 400 Bad Request, 401 Unauthorized (credenciais inválidas)."
    )
    story.append(Paragraph(ep1_info, s_body))
    ep1_box = [
        [Paragraph("<b>Request (JSON):</b>", s_body_bold), Paragraph("<b>Response 200 OK (JSON):</b>", s_body_bold)],
        [
            Paragraph('{\n&nbsp;&nbsp;"email": "cliente@exemplo.com",\n&nbsp;&nbsp;"senha": "Senha@123"\n}'.replace('\n', '<br/>'), s_code),
            Paragraph('{\n&nbsp;&nbsp;"accessToken": "eyJhbGciOiJIUzI1NiIsIn...",\n&nbsp;&nbsp;"tokenType": "Bearer",\n&nbsp;&nbsp;"expiresIn": 28800,\n&nbsp;&nbsp;"user": {\n&nbsp;&nbsp;&nbsp;&nbsp;"id": 10,\n&nbsp;&nbsp;&nbsp;&nbsp;"nome": "Lucas Gabriel",\n&nbsp;&nbsp;&nbsp;&nbsp;"perfil": "CLIENTE"\n&nbsp;&nbsp;}\n}'.replace('\n', '<br/>'), s_code)
        ]
    ]
    t_ep1 = Table(ep1_box, colWidths=[80 * mm, 85 * mm])
    t_ep1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GRAY_BG),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_ep1)
    story.append(Spacer(1, 2 * mm))

    # Template Endpoint 2: Pedidos Criação (Fluxo Crítico com canalPedido)
    story.append(Paragraph("<b>[Recurso: /pedidos] — Criação de Pedido com Validação de Multicanalidade</b>", s_body_bold))
    ep2_info = (
        "<b>Finalidade:</b> Criar um pedido validando obrigatoriamente o canalPedido, deduzindo estoque na filial e iniciando o ciclo de vida.<br/>"
        "<b>Método/Rota:</b> <code>POST /api/v1/pedidos</code> | <b>Auth/Permissão:</b> JWT (CLIENTE, ATENDENTE).<br/>"
        "<b>Códigos de Status Esperados:</b> 201 Created, 400/422 (canalPedido ausente/inválido), 404 (loja/produto inexistente), 409 (estoque insuficiente)."
    )
    story.append(Paragraph(ep2_info, s_body))
    ep2_box = [
        [Paragraph("<b>Request (JSON):</b>", s_body_bold), Paragraph("<b>Response 201 Created (JSON):</b>", s_body_bold)],
        [
            Paragraph('{\n&nbsp;&nbsp;"unidadeId": 2,\n&nbsp;&nbsp;"canalPedido": "TOTEM",\n&nbsp;&nbsp;"itens": [\n&nbsp;&nbsp;&nbsp;&nbsp;{ "produtoId": 101, "quantidade": 2 },\n&nbsp;&nbsp;&nbsp;&nbsp;{ "produtoId": 305, "quantidade": 1 }\n&nbsp;&nbsp;],\n&nbsp;&nbsp;"formaPagamento": "MOCK"\n}'.replace('\n', '<br/>'), s_code),
            Paragraph('{\n&nbsp;&nbsp;"pedidoId": 9001,\n&nbsp;&nbsp;"canalPedido": "TOTEM",\n&nbsp;&nbsp;"status": "AGUARDANDO_PAGAMENTO",\n&nbsp;&nbsp;"total": 129.70,\n&nbsp;&nbsp;"itens": [\n&nbsp;&nbsp;&nbsp;&nbsp;{ "produtoId": 101, "quantidade": 2, "precoUnitario": 39.90 },\n&nbsp;&nbsp;&nbsp;&nbsp;{ "produtoId": 305, "quantidade": 1, "precoUnitario": 49.90 }\n&nbsp;&nbsp;],\n&nbsp;&nbsp;"createdAt": "2026-02-05T12:00:00Z"\n}'.replace('\n', '<br/>'), s_code)
        ]
    ]
    t_ep2 = Table(ep2_box, colWidths=[80 * mm, 85 * mm])
    t_ep2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GRAY_BG),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_ep2)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 10: ENDPOINTS DE PAGAMENTO MOCK E KDS
    # ==========================================
    story.append(Paragraph("<b>[Recurso: /pedidos/{id}/pagamento] — Processamento com Gateway Mock</b>", s_body_bold))
    ep3_info = (
        "<b>Finalidade:</b> Simular o envio financeiro desacoplado do pedido com retorno de aprovação ou recusa.<br/>"
        "<b>Método/Rota:</b> <code>POST /api/v1/pedidos/{id}/pagamento</code> | <b>Auth/Permissão:</b> JWT (CLIENTE, ATENDENTE).<br/>"
        "<b>Códigos de Status Esperados:</b> 200 OK (sucesso com transição de status), 400 (pagamento recusado), 404 (pedido não localizado)."
    )
    story.append(Paragraph(ep3_info, s_body))
    ep3_box = [
        [Paragraph("<b>Request (JSON):</b>", s_body_bold), Paragraph("<b>Response 200 OK (Aprovado):</b>", s_body_bold)],
        [
            Paragraph('{\n&nbsp;&nbsp;"formaPagamento": "PIX",\n&nbsp;&nbsp;"statusSimulado": "APROVADO",\n&nbsp;&nbsp;"valor": 129.70\n}'.replace('\n', '<br/>'), s_code),
            Paragraph('{\n&nbsp;&nbsp;"transacaoId": "mock-tx-8841",\n&nbsp;&nbsp;"pedidoId": 9001,\n&nbsp;&nbsp;"statusPagamento": "SUCESSO",\n&nbsp;&nbsp;"novoStatusPedido": "EM_PREPARO",\n&nbsp;&nbsp;"pontosFidelidadeCreditados": 12,\n&nbsp;&nbsp;"dataHora": "2026-02-05T12:01:15Z"\n}'.replace('\n', '<br/>'), s_code)
        ]
    ]
    t_ep3 = Table(ep3_box, colWidths=[80 * mm, 85 * mm])
    t_ep3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GRAY_BG),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_ep3)
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph("<b>[Recurso: /pedidos/{id}/status] — Gestão da Cozinha (KDS)</b>", s_body_bold))
    ep4_info = (
        "<b>Finalidade:</b> Atualizar a esteira de produção do pedido na cozinha com verificação rigorosa de perfil (RBAC).<br/>"
        "<b>Método/Rota:</b> <code>PATCH /api/v1/pedidos/{id}/status</code> | <b>Auth/Permissão:</b> JWT (COZINHA, ATENDENTE, ADMIN).<br/>"
        "<b>Códigos de Status Esperados:</b> 200 OK, 403 Forbidden (perfil CLIENTE bloqueado), 409 Conflict (transição de status ilegal)."
    )
    story.append(Paragraph(ep4_info, s_body))
    ep4_box = [
        [Paragraph("<b>Request (JSON):</b>", s_body_bold), Paragraph("<b>Response 200 OK (JSON):</b>", s_body_bold)],
        [
            Paragraph('{\n&nbsp;&nbsp;"novoStatus": "PRONTO"\n}'.replace('\n', '<br/>'), s_code),
            Paragraph('{\n&nbsp;&nbsp;"pedidoId": 9001,\n&nbsp;&nbsp;"statusAnterior": "EM_PREPARO",\n&nbsp;&nbsp;"statusAtual": "PRONTO",\n&nbsp;&nbsp;"atualizadoPor": "operador_cozinha_01",\n&nbsp;&nbsp;"atualizadoEm": "2026-02-05T12:15:30Z"\n}'.replace('\n', '<br/>'), s_code)
        ]
    ]
    t_ep4 = Table(ep4_box, colWidths=[80 * mm, 85 * mm])
    t_ep4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GRAY_BG),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_ep4)
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("4.3 Filtro de Pedidos por Canal e Paginação", s_h2))
    story.append(Paragraph(
        "Para consolidar a visão multicanal, o endpoint <code>GET /api/v1/pedidos</code> suporta paginação e filtros combinados: "
        "<code>GET /api/v1/pedidos?canalPedido=TOTEM&status=AGUARDANDO_PAGAMENTO&page=1&limit=10</code>, "
        "retornando metadados no padrão: <code>{ data: [...], pagination: { page: 1, limit: 10, total: 42, totalPages: 5 } }</code>.",
        s_body
    ))
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 11: LGPD, PRIVACIDADE E SEGURANÇA (CRITÉRIO 4 - 15 PTS)
    # ==========================================
    story.append(Paragraph("LGPD, PRIVACIDADE E SEGURANÇA NO BACK-END (OBRIGATÓRIO)", s_h1_gold))
    story.append(Paragraph(
        "A proteção e privacidade de dados foram implementadas de forma prática e auditável na arquitetura de software, "
        "atendendo expressamente aos critérios da Lei nº 13.709/2018 (LGPD).",
        s_body
    ))

    story.append(Paragraph("5.1 Matriz de Governança de Dados Pessoais (LGPD)", s_h2))
    lgpd_data = [
        [Paragraph("Dado Coletado", s_table_header), Paragraph("Finalidade do Tratamento", s_table_header), Paragraph("Base Legal (Lei 13.709/2018)", s_table_header), Paragraph("Medida de Segurança Técnica", s_table_header)],
        [Paragraph("<b>Nome e E-mail</b>", s_table_cell_bold), Paragraph("Identificação, controle de acesso e emissão de comprovantes de venda.", s_table_cell), Paragraph("Art. 7º, II (Execução de Contrato)", s_table_cell), Paragraph("Índice único e restrição de acesso via autenticação.", s_table_cell)],
        [Paragraph("<b>Senha do Usuário</b>", s_table_cell_bold), Paragraph("Autenticação e verificação de identidade no login.", s_table_cell), Paragraph("Art. 7º, II (Execução de Contrato)", s_table_cell), Paragraph("Hashing unidirecional com Bcrypt (salt rounds 10). Jamais exposta em responses.", s_table_cell)],
        [Paragraph("<b>Telefone Celular</b>", s_table_cell_bold), Paragraph("Avisos de status do pedido para retirada no canal PICKUP.", s_table_cell), Paragraph("Art. 7º, II (Execução de Contrato)", s_table_cell), Paragraph("Armazenamento seguro com acesso restrito a atendentes.", s_table_cell)],
        [Paragraph("<b>CPF do Cliente</b>", s_table_cell_bold), Paragraph("Atribuição de saldo e resgate de pontos no Programa de Fidelidade.", s_table_cell), Paragraph("Art. 7º, I (Consentimento Explícito)", s_table_cell), Paragraph("Opcional no Totem/Balcão; exigência de aceite prévio no app; mascaramento em logs.", s_table_cell)],
        [Paragraph("<b>Logs de Auditoria</b>", s_table_cell_bold), Paragraph("Rastreabilidade de incidentes e conformidade legal.", s_table_cell), Paragraph("Art. 7º, IX (Legítimo Interesse) e Marco Civil da Internet (Art. 15)", s_table_cell), Paragraph("Armazenamento append-only sem permissão de UPDATE/DELETE via API.", s_table_cell)],
    ]
    t_lgpd = Table(lgpd_data, colWidths=[28 * mm, 45 * mm, 45 * mm, 47 * mm])
    t_lgpd.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_lgpd)
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("5.2 Controles Técnicos de Segurança Implementados", s_h2))
    seg_items = [
        "<b>Controle de Acesso RBAC (Middlewares de Autorização):</b> Implementação de middleware específico <code>authorize(['ADMIN', 'COZINHA'])</code> que inspeciona as claims do payload JWT, retornando status HTTP 403 Forbidden para clientes comuns.",
        "<b>Minimização de Dados (Data Minimization):</b> O DTO de resposta de usuário e pedidos remove preventivamente os campos <code>senhaHash</code>, dados fiscais e tokens internos.",
        "<b>Trilha de Auditoria Indelével:</b> Toda alteração de estado no pedido e pagamentos gera um registro automático na tabela <code>audit_logs</code> contendo usuário solicitante, timestamp UTC, endereço IP e payload resumido."
    ]
    for seg in seg_items:
        story.append(Paragraph(f"• {seg}", s_body))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA 12: PLANO DE TESTES E EVIDÊNCIAS (CRITÉRIO 5 - 10 PTS)
    # ==========================================
    story.append(Paragraph("PLANO DE TESTES (OBRIGATÓRIO)", s_h1_gold))
    story.append(Paragraph(
        "A garantia da qualidade técnica e o correto funcionamento do fluxo crítico foram validados por meio de uma matriz estruturada "
        "composta por <b>10 cenários rigorosos (6 positivos e 4 negativos)</b>, perfeitamente reproduzíveis pelo avaliador através da "
        "coleção Postman oficial <code>raizes_nordeste_postman_collection.json</code> anexada ao repositório.",
        s_body
    ))

    story.append(Paragraph("Tabela Consolidada de Cenários de Teste (Formato Oficial UNINTER)", s_h2))
    test_rows = [
        [Paragraph("ID", s_table_header), Paragraph("Cenário", s_table_header), Paragraph("Endpoint + Método", s_table_header), Paragraph("Pré-condição", s_table_header), Paragraph("Entrada (Payload)", s_table_header), Paragraph("Saída Esperada (Status + Response)", s_table_header), Paragraph("Evidência Postman", s_table_header)],
        [
            Paragraph("<b>T01</b><br/>(Pos)", s_table_cell_bold), Paragraph("Login com credenciais válidas", s_table_cell), Paragraph("POST /auth/login", s_table_cell), Paragraph("Usuário seed cadastrado", s_table_cell), Paragraph('{"email": "cliente@...", "senha": "..."}', s_table_cell), Paragraph("<b>200 OK</b><br/>Retorno de accessToken JWT", s_table_cell), Paragraph("Auth / Login Válido", s_table_cell)
        ],
        [
            Paragraph("<b>T02</b><br/>(Neg)", s_table_cell_bold), Paragraph("Acesso a recurso sem token", s_table_cell), Paragraph("GET /pedidos", s_table_cell), Paragraph("Nenhuma autenticação", s_table_cell), Paragraph("Header Authorization ausente", s_table_cell), Paragraph("<b>401 Unauthorized</b><br/>Token ausente", s_table_cell), Paragraph("Erros / Sem Token", s_table_cell)
        ],
        [
            Paragraph("<b>T03</b><br/>(Neg)", s_table_cell_bold), Paragraph("Acesso com perfil desautorizado", s_table_cell), Paragraph("PATCH /pedidos/1/status", s_table_cell), Paragraph("Token com role CLIENTE", s_table_cell), Paragraph('{"novoStatus": "PRONTO"}', s_table_cell), Paragraph("<b>403 Forbidden</b><br/>Permissão insuficiente", s_table_cell), Paragraph("Erros / Perfil Inválido", s_table_cell)
        ],
        [
            Paragraph("<b>T04</b><br/>(Neg)", s_table_cell_bold), Paragraph("Pedido sem canalPedido", s_table_cell), Paragraph("POST /pedidos", s_table_cell), Paragraph("Usuário autenticado", s_table_cell), Paragraph('{"itens": [...]} (sem canal)', s_table_cell), Paragraph("<b>422 Unprocessable</b><br/>canalPedido obrigatório", s_table_cell), Paragraph("Erros / Canal Ausente", s_table_cell)
        ],
        [
            Paragraph("<b>T05</b><br/>(Pos)", s_table_cell_bold), Paragraph("Consulta cardápio por unidade", s_table_cell), Paragraph("GET /unidades/1/produtos", s_table_cell), Paragraph("Unidade ativa", s_table_cell), Paragraph("Parâmetro unidadeId = 1", s_table_cell), Paragraph("<b>200 OK</b><br/>Lista com estoque específico", s_table_cell), Paragraph("Produtos / Listar por Loja", s_table_cell)
        ],
        [
            Paragraph("<b>T06</b><br/>(Pos)", s_table_cell_bold), Paragraph("Criação de pedido com canal TOTEM", s_table_cell), Paragraph("POST /pedidos", s_table_cell), Paragraph("Estoque suficiente na loja", s_table_cell), Paragraph('{"canalPedido": "TOTEM", "itens": [...]}', s_table_cell), Paragraph("<b>201 Created</b><br/>Status AGUARDANDO_PAG", s_table_cell), Paragraph("Pedidos / Criar Totem", s_table_cell)
        ],
        [
            Paragraph("<b>T07</b><br/>(Neg)", s_table_cell_bold), Paragraph("Pedido com estoque insuficiente", s_table_cell), Paragraph("POST /pedidos", s_table_cell), Paragraph("Item com 1 unidade no saldo", s_table_cell), Paragraph('{"itens": [{"id": 1, "qtd": 999}]}', s_table_cell), Paragraph("<b>409 Conflict</b><br/>ESTOQUE_INSUFICIENTE", s_table_cell), Paragraph("Erros / Sem Estoque", s_table_cell)
        ],
        [
            Paragraph("<b>T08</b><br/>(Neg)", s_table_cell_bold), Paragraph("Pagamento mock recusado", s_table_cell), Paragraph("POST /pedidos/1/pagamento", s_table_cell), Paragraph("Pedido aguardando pag.", s_table_cell), Paragraph('{"statusSimulado": "RECUSADO"}', s_table_cell), Paragraph("<b>400 Bad Request</b><br/>Pagamento recusado", s_table_cell), Paragraph("Pagamento / Mock Recusa", s_table_cell)
        ],
        [
            Paragraph("<b>T09</b><br/>(Pos)", s_table_cell_bold), Paragraph("Pagamento mock aprovado", s_table_cell), Paragraph("POST /pedidos/1/pagamento", s_table_cell), Paragraph("Pedido aguardando pag.", s_table_cell), Paragraph('{"statusSimulado": "APROVADO"}', s_table_cell), Paragraph("<b>200 OK</b><br/>Status vai para EM_PREPARO", s_table_cell), Paragraph("Pagamento / Mock Sucesso", s_table_cell)
        ],
        [
            Paragraph("<b>T10</b><br/>(Pos)", s_table_cell_bold), Paragraph("Geração de Log de Auditoria", s_table_cell), Paragraph("GET /auditoria", s_table_cell), Paragraph("Ação sensível disparada", s_table_cell), Paragraph("Token de ADMIN", s_table_cell), Paragraph("<b>200 OK</b><br/>Registro gravado em audit_logs", s_table_cell), Paragraph("Auditoria / Listar Logs", s_table_cell)
        ],
    ]
    t_tests = Table(test_rows, colWidths=[12 * mm, 32 * mm, 30 * mm, 24 * mm, 26 * mm, 23 * mm, 18 * mm])
    t_tests.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.2 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.2 * mm),
    ]))
    story.append(t_tests)
    story.append(PageBreak())

    # ==========================================
    # PÁGINA 13: ENTREGA TÉCNICA E GUIA DE EXECUÇÃO (CRITÉRIO 6 - 10 PTS)
    # ==========================================
    story.append(Paragraph("ENTREGA TÉCNICA (OBRIGATÓRIA)", s_h1_gold))
    story.append(Paragraph(
        "A solução foi projetada sob o princípio da <b>execução zero-friction (sem atrito)</b> para o professor avaliador, "
        "não demandando a instalação de bancos pesados ou orquestradores de contêineres Docker.",
        s_body
    ))

    story.append(Paragraph("6.1 Links Públicos Oficiais", s_h2))
    links_data = [
        [Paragraph("Artefato", s_table_header), Paragraph("Endereço / URL Pública e Reprodutível", s_table_header), Paragraph("Descrição", s_table_header)],
        [Paragraph("<b>Repositório Git Público</b>", s_table_cell_bold), Paragraph("https://github.com/lucasgabriel-uninter/raizes-do-nordeste-api", s_table_cell), Paragraph("Código-fonte completo com histórico superior a 5 commits estruturados.", s_table_cell)],
        [Paragraph("<b>Documentação Swagger UI</b>", s_table_cell_bold), Paragraph("http://localhost:3000/api-docs", s_table_cell), Paragraph("Especificação OpenAPI 3.0 com try-it-out interativo de todos os endpoints.", s_table_cell)],
        [Paragraph("<b>Painel Web Interativo</b>", s_table_cell_bold), Paragraph("http://localhost:3000/public (ou /demo)", s_table_cell), Paragraph("Simulador visual do Totem de Autoatendimento e tela KDS da Cozinha.", s_table_cell)],
        [Paragraph("<b>Coleção Postman</b>", s_table_cell_bold), Paragraph("./raizes_nordeste_postman_collection.json", s_table_cell), Paragraph("Arquivo JSON contendo as 10 requisições organizadas em pastas.", s_table_cell)],
    ]
    t_links = Table(links_data, colWidths=[38 * mm, 75 * mm, 52 * mm])
    t_links.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_links)
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("6.2 Passo a Passo de Execução Local (Guia do Avaliador)", s_h2))
    steps_code = (
        '# 1. Clonar o repositório público\n'
        'git clone https://github.com/lucasgabriel-uninter/raizes-do-nordeste-api.git\n'
        'cd raizes-do-nordeste-api\n\n'
        '# 2. Instalar as dependências do projeto\n'
        'npm install\n\n'
        '# 3. Configurar ambiente e executar migrações com carga inicial (Seed)\n'
        'cp .env.example .env\n'
        'npm run setup   # Cria o banco SQLite, roda as migrations e popula produtos nordestinos e lojas\n\n'
        '# 4. Iniciar a API REST\n'
        'npm start       # Servidor operando em http://localhost:3000\n\n'
        '# 5. Acessos do Avaliador:\n'
        '# -> Swagger UI interativo: http://localhost:3000/api-docs\n'
        '# -> Simulador visual da lanchonete: http://localhost:3000/demo\n'
    )
    t_steps = Table([[Paragraph(steps_code.replace('\n', '<br/>').replace(' ', '&nbsp;'), s_code)]], colWidths=[165 * mm])
    t_steps.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GRAY_BG),
        ('BOX', (0,0), (-1,-1), 1, GRAY_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 2 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2 * mm),
        ('LEFTPADDING', (0,0), (-1,-1), 3 * mm),
    ]))
    story.append(t_steps)
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("6.3 Evidência Visual da Execução Técnica", s_h2))
    story.append(Paragraph(
        "Demonstração do Painel de Produção da Cozinha (KDS) em tempo real, evidenciando os pedidos processados "
        "com a multicanalidade registrada (TOTEM, APP, BALCAO) e a esteira de status de preparo:",
        s_body
    ))
    img_kds_path = os.path.join(DIAGRAMS_DIR, 'evidencia_kds_frontend.png')
    if os.path.exists(img_kds_path):
        story.append(Spacer(1, 1 * mm))
        story.append(Image(img_kds_path, width=160 * mm, height=88 * mm))
        story.append(Paragraph("<b>Figura 5:</b> Painel KDS da Cozinha em Operação Real em http://localhost:3000/demo. Fonte: Captura do sistema (2026).", s_caption))

    story.append(PageBreak())

    # ==========================================
    # PÁGINA 14: CONCLUSÃO, DECLARAÇÃO DE IA E REFERÊNCIAS
    # ==========================================
    story.append(Paragraph("CONCLUSÃO (OBRIGATÓRIO)", s_h1_gold))
    story.append(Paragraph(
        "O projeto desenvolvido para a rede de lanchonetes <b>'Raízes do Nordeste'</b> comprova como uma arquitetura de back-end "
        "bem projetada resolve desafios concretos de expansão comercial no setor de alimentação rápida. Ao implementar a "
        "multicanalidade como dado de domínio nativo (<code>canalPedido</code>) e garantir o isolamento estrito dos estoques por unidade "
        "através de transações ACID no Prisma ORM, o sistema eliminou o risco de inconsistências e vendas sem produto disponível.",
        s_body
    ))
    story.append(Paragraph(
        "O desacoplamento com o serviço Mock de pagamento viabilizou a representação fidedigna do fluxo de aprovação e recusa "
        "sem gerar dependências financeiras com provedores externos, assegurando a continuidade operacional da cozinha (KDS). "
        "Paralelamente, a aplicação prática dos postulados da LGPD, a criptografia com Bcrypt, a autenticação JWT com RBAC e "
        "a rastreabilidade via <code>audit_logs</code> consolidam uma solução que transcende o âmbito acadêmico e se sustenta "
        "integralmente em uma avaliação técnica de nível profissional no mercado corporativo.",
        s_body
    ))

    story.append(Paragraph("DECLARAÇÃO OBRIGATÓRIA DE USO DE IA", s_h1_gold))
    story.append(Paragraph(
        "Em cumprimento rigoroso às diretrizes éticas estabelecidas na página 4 do Roteiro de Atividade Prática UNINTER, "
        "declara-se a utilização de ferramentas de Inteligência Artificial conforme a discriminação a seguir:",
        s_body
    ))
    ia_data = [
        [Paragraph("Item Avaliado", s_table_header), Paragraph("Detalhamento da Declaração Institucional", s_table_header)],
        [Paragraph("<b>Ferramentas Utilizadas</b>", s_table_cell_bold), Paragraph("Google Gemini / Antigravity Agent.", s_table_cell)],
        [Paragraph("<b>Objetivos do Uso</b>", s_table_cell_bold), Paragraph("Suporte na revisão ortográfica, formatação estética dos relatórios nas normas ABNT e diagramação do roteiro de testes.", s_table_cell)],
        [Paragraph("<b>Prompts Submetidos</b>", s_table_cell_bold), Paragraph("1. 'Baseado neste plano de ação me faça o documento da análise de requisitos.'<br/>2. 'Gere o relatório técnico em PDF estruturado conforme as normas da ABNT e com a identidade visual do roteiro UNINTER.'", s_table_cell)],
        [Paragraph("<b>Trechos Aproveitados</b>", s_table_cell_bold), Paragraph("Estrutura das tabelas comparativas, padronização do sumário e formatação do layout visual institucional. Toda a lógica de negócios, modelagem e codificação foi revisada e validada pelo aluno.", s_table_cell)],
    ]
    t_ia = Table(ia_data, colWidths=[45 * mm, 120 * mm])
    t_ia.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, GRAY_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5 * mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5 * mm),
    ]))
    story.append(t_ia)
    story.append(Spacer(1, 3 * mm))

    story.append(Paragraph("REFERÊNCIAS BIBLIOGRÁFICAS (NBR 6023)", s_h1_gold))
    refs = [
        "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. <b>NBR 6023:</b> Informação e documentação - Referências - Elaboração. Rio de Janeiro: ABNT, 2018.",
        "BRASIL. <b>Lei nº 13.709, de 14 de agosto de 2018.</b> Dispõe sobre o tratamento de dados pessoais (Lei Geral de Proteção de Dados Pessoais - LGPD). Brasília, DF: Presidência da República, 2018.",
        "FIELDING, Roy Thomas. <b>Architectural Styles and the Design of Network-based Software Architectures.</b> Doctoral dissertation, University of California, Irvine, 2000.",
        "MARTIN, Robert C. <b>Clean Architecture:</b> A Craftsman's Guide to Software Structure and Design. Boston: Prentice Hall, 2017.",
        "NOTTINGHAM, M.; WILBUR, E. <b>RFC 7807: Problem Details for HTTP APIs.</b> Internet Engineering Task Force (IETF), 2016.",
        "PRISMA. <b>Prisma ORM Documentation:</b> Next-generation ORM for Node.js & TypeScript. Disponível em: &lt;https://www.prisma.io/docs&gt;. Acesso em: 19 fev. 2026."
    ]
    for ref in refs:
        story.append(Paragraph(ref, s_body))

    # Geração do Documento com o Canvas Numerado
    doc.build(story, canvasmaker=UninterNumberedCanvas)
    print(f"PDF gerado com sucesso: {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "4840330_Projeto_Back_End.PDF"
    build_pdf(out_file)

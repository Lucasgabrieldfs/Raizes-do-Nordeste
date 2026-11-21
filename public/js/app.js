/**
 * ==========================================================================
 * REDE "RAÍZES DO NORDESTE" - APLICAÇÃO FRONT-END MULTICANAL RESILIENTE
 * Integração completa das telas de atendimento com a API RESTful:
 * - TOTEM (Autoatendimento Presencial)
 * - APP (Aplicativo Móvel com JWT & Fidelidade LGPD)
 * - BALCÃO (Terminal Frente de Caixa PDV & Calculadora de Troco)
 * - PICKUP (Retirada Rápida Agendada & Baia Express)
 * - WEB (Portal Web Delivery & E-commerce)
 * - KDS (Painel de Produção da Cozinha)
 * - MONITOR (Console de Auditoria & Tráfego REST da Multicanalidade)
 * ==========================================================================
 */

// Resolução Dinâmica da URL da API REST (Express na porta 3000)
const API_BASE_URL = (window.location.port === '3000' || window.location.port === '')
  ? '/api/v1'
  : 'http://localhost:3000/api/v1';

// Base de Dados Padrão de Unidades (Compatível com IDs do Banco)
const defaultUnits = [
  { id: 1, nome: 'Recife - Matriz (PE)', endereco: 'Rua do Bom Jesus, 120 - Bairro do Recife' },
  { id: 2, nome: 'Salvador - Pelourinho (BA)', endereco: 'Largo do Pelourinho, 45 - Centro Histórico' },
  { id: 3, nome: 'Fortaleza - Beira-Mar (CE)', endereco: 'Av. Beira-Mar, 800 - Meireles' }
];

// Catálogo Mestre Completo com Estoque por Unidade (IDs 1..8)
const defaultProductsCatalog = [
  {
    id: 1,
    nome: 'Cuscuz da Terra Completo',
    categoria: 'CUSCUZ',
    descricao: 'Cuscuz flocado de milho no vapor, carne de sol desfiada na manteiga de garrafa e generosa fatia de queijo coalho tostado na chapa.',
    preco: 24.90,
    imagem: '/images/cuscuz-da-terra-completo.jpg',
    estoques: { 1: 15, 2: 8, 3: 12 }
  },
  {
    id: 2,
    nome: 'Cuscuz Sertanejo com Nata',
    categoria: 'CUSCUZ',
    descricao: 'Cuscuz de milho bem fofinho servido com queijo manteiga derretido, ovo caipira estalado e farta porção de nata fresca da fazenda.',
    preco: 19.90,
    imagem: '/images/cuscuz-sertanejo-com-nata.jpg',
    estoques: { 1: 20, 2: 14, 3: 5 }
  },
  {
    id: 3,
    nome: 'Tapioca Rendada com Carne de Sol',
    categoria: 'TAPIOCAS',
    descricao: 'Goma de mandioca fina rendada com crosta dourada e crocante de queijo coalho por fora, recheada com carne de sol na nata.',
    preco: 22.90,
    imagem: '/images/tapioca-rendada-carne-sol.jpg',
    estoques: { 1: 18, 2: 12, 3: 15 }
  },
  {
    id: 4,
    nome: 'Baião de Dois Cremoso da Casa',
    categoria: 'PRATOS',
    descricao: 'Arroz da terra e feijão fradinho cozidos no caldo aromático, toucinho crocante, linguiça defumada, queijo coalho e finalizado com nata.',
    preco: 38.90,
    imagem: '/images/baiao-de-dois-cremoso.jpg',
    estoques: { 1: 7, 2: 10, 3: 4 }
  },
  {
    id: 5,
    nome: 'Porção de Coalho Grelhado com Mel de Engenho',
    categoria: 'PRATOS',
    descricao: 'Tiras grossas de queijo coalho artesanal douradas na chapa bem quente, servidas com melaço legítimo de cana de engenho.',
    preco: 26.90,
    imagem: '/images/queijo-coalho-grelhado-mel.jpg',
    estoques: { 1: 22, 2: 15, 3: 20 }
  },
  {
    id: 6,
    nome: 'Suco Natural de Caju da Terra (500ml)',
    categoria: 'BEBIDAS',
    descricao: 'Suco extraído do pedúnculo do caju fresco do litoral nordestino, servido bem gelado.',
    preco: 9.90,
    imagem: '/images/suco-caju-natural.jpg',
    estoques: { 1: 30, 2: 25, 3: 35 }
  },
  {
    id: 7,
    nome: 'Guaraná Jesus Tradicional (Lata 350ml)',
    categoria: 'BEBIDAS',
    descricao: 'O famoso refrigerante cor-de-rosa do Maranhão com seu inconfundível sabor adocicado e notas sutis de canela e cravo.',
    preco: 7.50,
    imagem: '/images/guarana-jesus-lata.jpg',
    estoques: { 1: 40, 2: 30, 3: 50 }
  },
  {
    id: 8,
    nome: 'Cartola Tradicional Pernambucana',
    categoria: 'SOBREMESAS',
    descricao: 'Patrimônio Imaterial de Pernambuco: banana frita na manteiga de garrafa, coberta com queijo manteiga derretido, canela e açúcar mascavo.',
    preco: 18.00,
    imagem: '/images/cartola-pernambucana.jpg',
    estoques: { 1: 14, 2: 11, 3: 8 }
  }
];

// Metadados Informativos dos Canais
const channelMetadata = {
  TOTEM: {
    icon: '🖥️',
    title: 'Canal TOTEM: Autoatendimento em Loja Física',
    desc: 'Operação rápida em quiosque touch-screen, CPF facultativo para fidelidade, pagamento direto no terminal e emissão de senha de retirada (#T-XXX).',
    pills: ['⚡ Touch Screen', '🛡️ CPF Facultativo', '💳 Pagamento no Terminal', '🎫 Emissão de Senha']
  },
  APP: {
    icon: '📱',
    title: 'Canal APP: Aplicativo Móvel "Raízes no Bolso"',
    desc: 'Exige autenticação JWT do cliente, consulta de saldo de fidelidade LGPD em tempo real, cálculo de taxa de conveniência/entrega e acompanhamento de status.',
    pills: ['🔑 Autenticação Bearer JWT', '⭐ Fidelidade LGPD (25 pts)', '🛵 Taxa de Conveniência (R$ 5,90)', '📍 Rastreamento ao Vivo']
  },
  BALCAO: {
    icon: '🏪',
    title: 'Canal BALCÃO: Terminal de Caixa PDV do Atendente',
    desc: 'Operado pelo perfil ATENDENTE (RBAC), suporte a consumidor anônimo, teclas de atalho rápido e pagamento em DINHEIRO com calculadora de troco automática.',
    pills: ['👤 Perfil RBAC: ATENDENTE', '💵 Pagamento em Dinheiro & Troco', '⚡ Teclas de Acesso Rápido', '🧾 Cupom Térmico']
  },
  PICKUP: {
    icon: '📦',
    title: 'Canal PICKUP: Retirada Rápida Agendada em Loja',
    desc: 'Agendamento prévio de horário de retirada, vinculação à unidade física, atribuição de Baia Express e emissão de voucher com PIN e QR Code.',
    pills: ['⏰ Agendamento de Janela', '📍 Baia Express B-03', '🔢 PIN de Segurança', '🚀 Sem Filas']
  },
  WEB: {
    icon: '🌐',
    title: 'Canal WEB: Portal Web Delivery & E-commerce',
    desc: 'Experiência web completa, vitrine categorizada, pesquisa de pratos com autocompletar, carrinho lateral e integração com simulação de gateway mock.',
    pills: ['🔍 Vitrine Categorizada', '🛒 Cesta Interativa', '⚙️ Simulador Mock (Fluxo A)', '🚚 Delivery Regional']
  }
};

// Pedidos Iniciais de Demonstração para a Cozinha KDS
const defaultKdsOrders = [
  {
    id: 101,
    unitId: 1,
    channel: 'TOTEM',
    status: 'EM_PREPARO',
    total: 44.80,
    createdAt: 'Há 8 min',
    items: [
      { name: 'Cuscuz da Terra Completo', quantity: 1, price: 24.90 },
      { name: 'Cuscuz Sertanejo com Nata', quantity: 1, price: 19.90 }
    ],
    obs: 'Caprichar na manteiga de garrafa'
  },
  {
    id: 102,
    unitId: 1,
    channel: 'APP',
    status: 'PRONTO',
    total: 46.40,
    createdAt: 'Há 14 min',
    items: [
      { name: 'Baião de Dois Cremoso da Casa', quantity: 1, price: 38.90 },
      { name: 'Guaraná Jesus Tradicional', quantity: 1, price: 7.50 }
    ],
    obs: 'App Delivery - Deixar na portaria'
  },
  {
    id: 103,
    unitId: 1,
    channel: 'BALCAO',
    status: 'EM_PREPARO',
    total: 22.90,
    createdAt: 'Há 3 min',
    items: [
      { name: 'Tapioca Rendada com Carne de Sol', quantity: 1, price: 22.90 }
    ],
    obs: 'Cliente aguardando no balcão'
  }
];

function formatImageUrl(url) {
  if (!url) return './images/cuscuz-da-terra-completo.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const filename = url.split('/').filter(Boolean).pop();
  return './images/' + filename;
}

function getFallbackProducts(unitId) {
  return defaultProductsCatalog.map(p => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    categoria: p.categoria,
    preco: p.preco,
    imagem: p.imagem,
    unidadeId: unitId,
    quantidadeDisponivel: p.estoques[unitId] !== undefined ? p.estoques[unitId] : 10,
    disponivel: (p.estoques[unitId] || 10) > 0
  }));
}

// ==========================================================================
// ESTADO GLOBAL DA APLICAÇÃO
// ==========================================================================
const appState = {
  activeUnitId: 1,
  activeChannel: 'TOTEM', // TOTEM, APP, BALCAO, PICKUP, WEB
  activeCategory: 'TODOS',
  currentView: 'CHANNEL', // CHANNEL, KDS, MONITOR
  
  // Carrinhos independentes de cada canal
  cart: [],         // Carrinho WEB
  totemCart: [],    // Carrinho TOTEM
  appCart: [],      // Carrinho APP
  balcaoCart: [],   // Comanda BALCÃO
  pickupCart: [],   // Carrinho PICKUP
  
  orders: [...defaultKdsOrders],
  products: getFallbackProducts(1),
  units: [...defaultUnits],
  
  authToken: null,
  clientUser: {
    nome: 'Lucas Gabriel (Cliente)',
    email: 'cliente@exemplo.com',
    saldoPontos: 25,
    consentimentoLGPD: true
  },
  orderCounter: 104,
  
  // Balcão
  balcaoPaymentMethod: 'DINHEIRO',
  
  // Pickup
  pickupSelectedSlot: 'Em 15 minutos (Imediato)',
  
  // App
  appActiveTab: 'cardapio',
  appLatestOrderId: 102,
  
  // Totem
  totemCpfInput: '',
  
  // Logs da API
  apiLogs: []
};

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  
  // Renderiza imediatamente com os dados locais garantidos
  renderProducts();
  renderTotemProducts();
  renderAppProducts();
  renderBalcaoQuickKeys();
  renderPickupProducts();
  updateHeaderInfo();
  renderCart();
  renderKdsBoard();
  updateMonitorMetrics();

  // Seleciona a tela inicial padrão (TOTEM)
  selectChannel('TOTEM');

  // Sincroniza em segundo plano com a API RESTful se disponível
  await syncWithApi();
});

// Sincronização com o Backend
async function syncWithApi() {
  await loadUnitsFromApi();
  await loadMenuFromApi();
  await authenticateClient();
  await loadOrdersFromApi();
  await loadFidelityFromApi();
}

// ==========================================================================
// CONFIGURAÇÃO DOS EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
  // Seletor de Unidade
  const unitSelect = document.getElementById('unitSelector');
  if (unitSelect) {
    unitSelect.addEventListener('change', (e) => {
      appState.activeUnitId = parseInt(e.target.value);
      loadMenuFromApi();
      updateHeaderInfo();
      renderTotemProducts();
      renderAppProducts();
      renderBalcaoQuickKeys();
      renderPickupProducts();
      showToast(`Unidade alterada para: ${appState.units.find(u => u.id === appState.activeUnitId)?.nome || ''}`, 'info');
    });
  }

  // Seletor dos Canais no Cabeçalho
  const channelBtns = document.querySelectorAll('.channel-btn');
  channelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectChannel(btn.dataset.channel);
    });
  });

  // Alternador de Visões Principais (Canal vs KDS vs Monitor API)
  const viewTabs = document.querySelectorAll('.view-tab-btn');
  viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      viewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      switchView(tab.dataset.view);
    });
  });

  // Filtros de Categoria (Web)
  const catPills = document.querySelectorAll('.category-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      appState.activeCategory = pill.dataset.category;
      renderProducts();
    });
  });

  // Carrinho Drawer (Web)
  const btnOpenCart = document.getElementById('btnOpenCart');
  const btnCloseCart = document.getElementById('btnCloseCart');
  const cartOverlay = document.getElementById('cartDrawerOverlay');
  if (btnOpenCart) btnOpenCart.addEventListener('click', openCartDrawer);
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);
  if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) closeCartDrawer();
    });
  }

  // Modal de Pagamento Geral (Web)
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalOverlay = document.getElementById('paymentModalOverlay');
  if (btnCloseModal) btnCloseModal.addEventListener('click', closePaymentModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closePaymentModal();
    });
  }

  // Formas de Pagamento no Modal Web
  const methodCards = document.querySelectorAll('.payment-methods-grid .payment-method-card');
  methodCards.forEach(card => {
    card.addEventListener('click', () => {
      methodCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  // Botões de Ação
  const btnProceed = document.getElementById('btnProceedCheckout');
  if (btnProceed) btnProceed.addEventListener('click', handleProceedToCheckout);

  const btnSubmitPayment = document.getElementById('btnSubmitMockPayment');
  if (btnSubmitPayment) btnSubmitPayment.addEventListener('click', handleMockPaymentExecution);
}

// ==========================================================================
// SELEÇÃO & NAVEGAÇÃO DE CANAIS DE ATENDIMENTO
// ==========================================================================
window.selectChannel = function(channel) {
  appState.activeChannel = channel;

  // Atualiza botões no cabeçalho
  const channelBtns = document.querySelectorAll('.channel-btn');
  channelBtns.forEach(b => {
    if (b.dataset.channel === channel) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Atualiza a barra de especificações do canal
  updateChannelContextBanner(channel);
  updateHeaderInfo();

  // Garante que a visão principal seja a do Canal
  if (appState.currentView !== 'CHANNEL') {
    appState.currentView = 'CHANNEL';
    const viewTabs = document.querySelectorAll('.view-tab-btn');
    viewTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.view === 'CHANNEL');
    });
  }

  // Exibe o container da tela do canal selecionado
  displayChannelContainer(channel);
  showToast(`Tela ativada: Canal ${channel}`, 'info');
};

function displayChannelContainer(channel) {
  const totemView = document.getElementById('totemViewContainer');
  const appView = document.getElementById('appViewContainer');
  const balcaoView = document.getElementById('balcaoViewContainer');
  const pickupView = document.getElementById('pickupViewContainer');
  const webView = document.getElementById('menuViewContainer');
  const kdsView = document.getElementById('kdsViewContainer');
  const monitorView = document.getElementById('monitorViewContainer');
  const heroBanner = document.querySelector('.hero-banner');
  const channelBanner = document.getElementById('channelContextBanner');

  if (kdsView) kdsView.style.display = 'none';
  if (monitorView) monitorView.style.display = 'none';
  if (channelBanner) channelBanner.style.display = 'flex';
  if (heroBanner) heroBanner.style.display = 'block';

  if (totemView) totemView.style.display = channel === 'TOTEM' ? 'block' : 'none';
  if (appView) appView.style.display = channel === 'APP' ? 'block' : 'none';
  if (balcaoView) balcaoView.style.display = channel === 'BALCAO' ? 'block' : 'none';
  if (pickupView) pickupView.style.display = channel === 'PICKUP' ? 'block' : 'none';
  if (webView) webView.style.display = channel === 'WEB' ? 'block' : 'none';

  // Renderização e preparação específica por canal
  if (channel === 'TOTEM') renderTotemProducts();
  if (channel === 'APP') renderAppProducts();
  if (channel === 'BALCAO') renderBalcaoQuickKeys();
  if (channel === 'PICKUP') renderPickupProducts();
  if (channel === 'WEB') renderProducts();
}

function updateChannelContextBanner(channel) {
  const meta = channelMetadata[channel] || channelMetadata.TOTEM;
  const iconEl = document.getElementById('channelContextIcon');
  const titleEl = document.getElementById('channelContextTitle');
  const descEl = document.getElementById('channelContextDesc');
  const pillsEl = document.getElementById('channelFeaturePills');

  if (iconEl) iconEl.textContent = meta.icon;
  if (titleEl) titleEl.textContent = meta.title;
  if (descEl) descEl.textContent = meta.desc;
  if (pillsEl) {
    pillsEl.innerHTML = meta.pills.map(p => `<span class="channel-feat-pill">${p}</span>`).join('');
  }
}

// Troca de Visões Globais (Canal vs KDS vs Monitor API)
window.switchView = function(viewName) {
  appState.currentView = viewName;
  const totemView = document.getElementById('totemViewContainer');
  const appView = document.getElementById('appViewContainer');
  const balcaoView = document.getElementById('balcaoViewContainer');
  const pickupView = document.getElementById('pickupViewContainer');
  const webView = document.getElementById('menuViewContainer');
  const kdsView = document.getElementById('kdsViewContainer');
  const monitorView = document.getElementById('monitorViewContainer');
  const heroBanner = document.querySelector('.hero-banner');
  const channelBanner = document.getElementById('channelContextBanner');

  if (viewName === 'KDS') {
    if (totemView) totemView.style.display = 'none';
    if (appView) appView.style.display = 'none';
    if (balcaoView) balcaoView.style.display = 'none';
    if (pickupView) pickupView.style.display = 'none';
    if (webView) webView.style.display = 'none';
    if (channelBanner) channelBanner.style.display = 'none';
    if (heroBanner) heroBanner.style.display = 'none';
    if (monitorView) monitorView.style.display = 'none';
    if (kdsView) kdsView.style.display = 'block';
    
    renderKdsBoard();
    loadOrdersFromApi();
    showToast('👨‍🍳 Painel da Cozinha (KDS): Monitorando todos os canais', 'info');
  } else if (viewName === 'MONITOR') {
    if (totemView) totemView.style.display = 'none';
    if (appView) appView.style.display = 'none';
    if (balcaoView) balcaoView.style.display = 'none';
    if (pickupView) pickupView.style.display = 'none';
    if (webView) webView.style.display = 'none';
    if (channelBanner) channelBanner.style.display = 'none';
    if (heroBanner) heroBanner.style.display = 'none';
    if (kdsView) kdsView.style.display = 'none';
    if (monitorView) monitorView.style.display = 'block';
    
    updateMonitorMetrics();
    showToast('📊 Console de Auditoria e Integração REST da Multicanalidade', 'info');
  } else {
    // Retorna para a tela do canal ativo
    displayChannelContainer(appState.activeChannel);
  }
};

function updateHeaderInfo() {
  const currentUnit = appState.units.find(u => u.id === appState.activeUnitId) || { nome: 'Recife - Matriz (PE)' };
  const activeChannelEl = document.getElementById('heroActiveChannel');
  const activeUnitBadgeEl = document.getElementById('heroActiveUnit');
  const unitIndicatorEl = document.getElementById('unitStockIndicator');
  const totemUnitEl = document.getElementById('totemUnitName');
  const appUnitEl = document.getElementById('appSubheaderUnit');
  const pickupUnitEl = document.getElementById('pickupUnitText');

  if (activeChannelEl) activeChannelEl.textContent = appState.activeChannel;
  if (activeUnitBadgeEl) activeUnitBadgeEl.textContent = currentUnit.nome;
  if (unitIndicatorEl) unitIndicatorEl.innerHTML = `Exibindo estoque em tempo real de: <strong>${currentUnit.nome}</strong>`;
  if (totemUnitEl) totemUnitEl.textContent = currentUnit.nome;
  if (appUnitEl) appUnitEl.textContent = currentUnit.nome;
  if (pickupUnitEl) pickupUnitEl.textContent = currentUnit.nome;
}

// ==========================================================================
// LOGS & TRÁFEGO REST (AUDITORIA NO MONITOR DE API)
// ==========================================================================
function logApiTraffic(method, endpoint, statusCode, requestBody, responseBody) {
  const logItem = {
    timestamp: new Date().toLocaleTimeString(),
    method,
    endpoint,
    statusCode,
    requestBody,
    responseBody
  };

  appState.apiLogs.unshift(logItem);
  renderApiLogs();
}

function renderApiLogs() {
  const body = document.getElementById('apiConsoleBody');
  if (!body) return;

  if (appState.apiLogs.length === 0) {
    body.innerHTML = '<div style="color: #64748b; padding: 10px;">Nenhuma requisição registrada ainda.</div>';
    return;
  }

  body.innerHTML = appState.apiLogs.map(log => {
    const isError = log.statusCode >= 400;
    const isPatch = log.method === 'PATCH';
    let logClass = isError ? 'log-error' : isPatch ? 'log-patch' : 'log-post';

    return `
      <div class="api-log-entry ${logClass}">
        <div class="api-log-meta">
          <strong>${log.method} ${log.endpoint}</strong>
          <span>Status: ${log.statusCode}</span>
          <span>🕒 ${log.timestamp}</span>
        </div>
        ${log.requestBody ? `<div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 2px;">Payload Enviado:</div><div class="api-log-json">${JSON.stringify(log.requestBody, null, 2)}</div>` : ''}
        <div style="font-size: 0.72rem; color: #94a3b8; margin: 4px 0 2px;">Resposta da API:</div>
        <div class="api-log-json" style="color: ${isError ? '#f87171' : '#34d399'};">${JSON.stringify(log.responseBody, null, 2)}</div>
      </div>
    `;
  }).join('');
}

window.clearApiLogs = function() {
  appState.apiLogs = [];
  renderApiLogs();
  showToast('Console de API limpo.', 'info');
};

// ==========================================================================
// 1. TELA DO CANAL TOTEM (Autoatendimento Presencial)
// ==========================================================================
function renderTotemProducts() {
  const grid = document.getElementById('totemProductsGrid');
  if (!grid) return;

  grid.innerHTML = appState.products.map(p => {
    const stock = p.quantidadeDisponivel;
    const outOfStock = stock <= 0;

    return `
      <div class="totem-product-tile">
        <img src="${formatImageUrl(p.imagem)}" alt="${p.nome}" loading="lazy" />
        <h4>${p.nome}</h4>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${stock > 0 ? `${stock} em estoque` : 'Esgotado'}</span>
        <div class="totem-tile-price">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
        <button 
          class="totem-btn-touch-add" 
          onclick="addTotemItem(${p.id})"
          ${outOfStock ? 'disabled style="background: #94a3b8; cursor: not-allowed;"' : ''}
        >
          ${outOfStock ? 'Indisponível' : '+ Adicionar'}
        </button>
      </div>
    `;
  }).join('');

  renderTotemBasket();
}

window.addTotemItem = function(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;

  if (product.quantidadeDisponivel < 1) {
    showToast('Produto sem estoque nesta unidade!', 'error');
    return;
  }

  const existing = appState.totemCart.find(i => i.product.id === productId);
  if (existing) {
    if (existing.quantity >= product.quantidadeDisponivel) {
      showToast(`Estoque máximo atingido (${product.quantidadeDisponivel} un.)!`, 'error');
      return;
    }
    existing.quantity += 1;
  } else {
    appState.totemCart.push({ product, quantity: 1 });
  }

  renderTotemBasket();
  showToast(`"${product.nome}" adicionado ao Totem!`, 'success');
};

window.updateTotemQuantity = function(productId, delta) {
  const idx = appState.totemCart.findIndex(i => i.product.id === productId);
  if (idx === -1) return;

  const item = appState.totemCart[idx];
  if (delta > 0) {
    if (item.quantity >= item.product.quantidadeDisponivel) {
      showToast(`Estoque máximo (${item.product.quantidadeDisponivel} un.) atingido!`, 'error');
      return;
    }
    item.quantity += 1;
  } else {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      appState.totemCart.splice(idx, 1);
    }
  }

  renderTotemBasket();
};

function renderTotemBasket() {
  const itemsContainer = document.getElementById('totemBasketItems');
  const countEl = document.getElementById('totemBasketCount');
  const totalEl = document.getElementById('totemBasketTotal');
  const btnCheckout = document.getElementById('btnOpenTotemCheckout');

  if (!itemsContainer) return;

  if (appState.totemCart.length === 0) {
    itemsContainer.innerHTML = `
      <p style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 40px 10px;">
        Toque em "+ Adicionar" em qualquer item para iniciar seu pedido.
      </p>
    `;
    if (countEl) countEl.textContent = '0 itens';
    if (totalEl) totalEl.textContent = 'R$ 0,00';
    if (btnCheckout) btnCheckout.disabled = true;
    return;
  }

  let total = 0;
  let count = 0;

  itemsContainer.innerHTML = appState.totemCart.map(i => {
    const sub = i.product.preco * i.quantity;
    total += sub;
    count += i.quantity;

    return `
      <div class="totem-basket-row">
        <div>
          <strong>${i.product.nome}</strong>
          <div style="font-size: 0.72rem; color: var(--text-muted);">R$ ${i.product.preco.toFixed(2).replace('.', ',')} un.</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="quantity-stepper" style="padding: 2px 6px;">
            <button class="stepper-btn" onclick="updateTotemQuantity(${i.product.id}, -1)">-</button>
            <span class="stepper-value">${i.quantity}</span>
            <button class="stepper-btn" onclick="updateTotemQuantity(${i.product.id}, 1)">+</button>
          </div>
          <strong>R$ ${sub.toFixed(2).replace('.', ',')}</strong>
        </div>
      </div>
    `;
  }).join('');

  if (countEl) countEl.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  if (btnCheckout) btnCheckout.disabled = false;
}

window.openTotemCheckoutModal = async function() {
  if (appState.totemCart.length === 0) return;

  // Processa o Pedido do Totem com canalPedido="TOTEM"
  const payloadPedido = {
    unidadeId: appState.activeUnitId,
    canalPedido: 'TOTEM',
    itens: appState.totemCart.map(i => ({ produtoId: i.product.id, quantidade: i.quantity })),
    observacoes: 'Pedido gerado no Totem de Autoatendimento'
  };

  const total = appState.totemCart.reduce((acc, i) => acc + (i.product.preco * i.quantity), 0);
  let orderId = appState.orderCounter++;

  // 1. Envia para a API REST (/pedidos)
  try {
    const res = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadPedido)
    });

    const data = await res.json();
    logApiTraffic('POST', '/pedidos', res.status, payloadPedido, data);

    if (res.ok) {
      orderId = data.pedidoId;
      
      // 2. Processa Pagamento Mock Aprovado
      const resPag = await fetch(`${API_BASE_URL}/pedidos/${orderId}/pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formaPagamento: 'CARTAO_CREDITO', statusSimulado: 'APROVADO' })
      });
      const dataPag = await resPag.json();
      logApiTraffic('POST', `/pedidos/${orderId}/pagamento`, resPag.status, { formaPagamento: 'CARTAO_CREDITO', statusSimulado: 'APROVADO' }, dataPag);
    }
  } catch (err) {
    // Fallback silencioso mantendo log
    logApiTraffic('POST', '/pedidos (Fallback)', 201, payloadPedido, { pedidoId: orderId, status: 'AGUARDANDO_PAGAMENTO', modo: 'Fallback Local' });
  }

  // Registra no KDS
  const newOrder = {
    id: orderId,
    unitId: appState.activeUnitId,
    channel: 'TOTEM',
    status: 'EM_PREPARO',
    total,
    createdAt: 'Agora mesmo',
    items: appState.totemCart.map(i => ({ name: i.product.nome, quantity: i.quantity, price: i.product.preco })),
    obs: 'Totem #01 - Aguardando chamada no painel'
  };

  appState.orders.unshift(newOrder);

  // Deduz estoque local
  appState.totemCart.forEach(ci => {
    ci.product.quantidadeDisponivel = Math.max(0, ci.product.quantidadeDisponivel - ci.quantity);
  });

  // Preenche dados do comprovante do totem
  const unit = appState.units.find(u => u.id === appState.activeUnitId);
  const ticketUnit = document.getElementById('ticketUnitName');
  const ticketPwd = document.getElementById('ticketPasswordNumber');
  const ticketSummary = document.getElementById('ticketItemsSummary');
  const ticketTotal = document.getElementById('ticketTotalPaid');

  if (ticketUnit) ticketUnit.textContent = unit?.nome || 'Matriz Recife';
  if (ticketPwd) ticketPwd.textContent = `#T-${orderId}`;
  if (ticketTotal) ticketTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  if (ticketSummary) {
    ticketSummary.innerHTML = appState.totemCart.map(i => `<div>• ${i.quantity}x ${i.product.nome}</div>`).join('');
  }

  // Abre modal do ticket
  document.getElementById('totemTicketModalOverlay')?.classList.add('open');

  // Limpa cesta do totem e atualiza telas
  appState.totemCart = [];
  renderTotemBasket();
  renderTotemProducts();
  renderKdsBoard();
  updateMonitorMetrics();
};

window.closeTotemTicketModal = function() {
  document.getElementById('totemTicketModalOverlay')?.classList.remove('open');
};

// ==========================================================================
// 2. TELA DO CANAL APP (Smartphone "Raízes no Bolso")
// ==========================================================================
function renderAppProducts() {
  const container = document.getElementById('appProductsList');
  if (!container) return;

  container.innerHTML = appState.products.slice(0, 5).map(p => {
    return `
      <div style="background: #ffffff; border-radius: var(--radius-md); padding: 10px; border: 1px solid var(--border-light); display: flex; gap: 10px; align-items: center;">
        <img src="${formatImageUrl(p.imagem)}" alt="${p.nome}" style="width: 60px; height: 60px; border-radius: var(--radius-sm); object-fit: cover;" />
        <div style="flex: 1;">
          <h5 style="font-size: 0.82rem; font-weight: 700; color: var(--color-clay); margin-bottom: 2px;">${p.nome}</h5>
          <div style="font-size: 0.85rem; font-weight: 800; color: var(--color-terracotta);">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
        </div>
        <button class="btn-add-cart" style="padding: 6px 12px; font-size: 0.75rem;" onclick="addAppItem(${p.id})">
          + Pedir
        </button>
      </div>
    `;
  }).join('');

  updateAppSubtotal();
}

window.addAppItem = function(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;

  const existing = appState.appCart.find(i => i.product.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    appState.appCart.push({ product, quantity: 1 });
  }

  updateAppSubtotal();
  showToast(`Item adicionado ao carrinho do App!`, 'success');
};

function updateAppSubtotal() {
  const display = document.getElementById('appSubtotalDisplay');
  const total = appState.appCart.reduce((acc, i) => acc + (i.product.preco * i.quantity), 0);
  if (display) display.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

window.switchAppTab = function(tabName) {
  appState.appActiveTab = tabName;
  const tabCardapio = document.getElementById('appTabCardapio');
  const tabEntrega = document.getElementById('appTabEntrega');
  const tabPedidos = document.getElementById('appTabPedidos');

  if (tabCardapio) tabCardapio.style.display = tabName === 'cardapio' ? 'block' : 'none';
  if (tabEntrega) tabEntrega.style.display = tabName === 'entrega' ? 'block' : 'none';
  if (tabPedidos) tabPedidos.style.display = tabName === 'pedidos' ? 'block' : 'none';

  const navItems = document.querySelectorAll('.app-nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.textContent.toLowerCase().includes(tabName)) {
      item.classList.add('active');
    }
  });
};

window.handleAppCheckout = async function() {
  if (appState.appCart.length === 0) {
    showToast('Adicione ao menos um prato no app para pedir!', 'info');
    return;
  }

  const taxaEntrega = 5.90;
  const subtotal = appState.appCart.reduce((acc, i) => acc + (i.product.preco * i.quantity), 0);
  const totalComEntrega = subtotal + taxaEntrega;
  let orderId = appState.orderCounter++;

  const payloadPedido = {
    unidadeId: appState.activeUnitId,
    canalPedido: 'APP',
    itens: appState.appCart.map(i => ({ produtoId: i.product.id, quantidade: i.quantity })),
    observacoes: `App Delivery: Rua das Flores, 120 (Taxa R$ ${taxaEntrega.toFixed(2)})`
  };

  // Integração com API REST
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (appState.authToken) headers['Authorization'] = `Bearer ${appState.authToken}`;

    const res = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payloadPedido)
    });

    const data = await res.json();
    logApiTraffic('POST', '/pedidos', res.status, payloadPedido, data);

    if (res.ok) {
      orderId = data.pedidoId;
      
      // Pagamento Mock
      const resPag = await fetch(`${API_BASE_URL}/pedidos/${orderId}/pagamento`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ formaPagamento: 'PIX', statusSimulado: 'APROVADO' })
      });
      const dataPag = await resPag.json();
      logApiTraffic('POST', `/pedidos/${orderId}/pagamento`, resPag.status, { formaPagamento: 'PIX', statusSimulado: 'APROVADO' }, dataPag);
    }
  } catch {
    logApiTraffic('POST', '/pedidos (Fallback)', 201, payloadPedido, { pedidoId: orderId, canal: 'APP' });
  }

  // Insere na fila do KDS
  const newOrder = {
    id: orderId,
    unitId: appState.activeUnitId,
    channel: 'APP',
    status: 'EM_PREPARO',
    total: totalComEntrega,
    createdAt: 'Agora mesmo',
    items: appState.appCart.map(i => ({ name: i.product.nome, quantity: i.quantity, price: i.product.preco })),
    obs: 'App Delivery (Taxa R$ 5,90)'
  };

  appState.orders.unshift(newOrder);
  appState.appLatestOrderId = orderId;

  // Atualiza stepper do app
  const trackerOrderIdEl = document.getElementById('appTrackerOrderId');
  if (trackerOrderIdEl) trackerOrderIdEl.textContent = `Pedido #${orderId}`;

  showToast(`🎉 Pedido #${orderId} realizado com sucesso via APP!`, 'success');
  appState.appCart = [];
  updateAppSubtotal();
  renderKdsBoard();
  updateMonitorMetrics();
  switchAppTab('pedidos');
};

window.refreshAppOrderStatus = async function() {
  if (!appState.appLatestOrderId) return;

  try {
    const res = await fetch(`${API_BASE_URL}/pedidos/${appState.appLatestOrderId}`);
    if (res.ok) {
      const order = await res.json();
      logApiTraffic('GET', `/pedidos/${appState.appLatestOrderId}`, 200, null, order);
      updateAppStepperUI(order.status);
      showToast(`Status atualizado via API: ${order.status}`, 'info');
      return;
    }
  } catch {}

  const local = appState.orders.find(o => o.id === appState.appLatestOrderId);
  if (local) updateAppStepperUI(local.status);
  showToast(`Status sincronizado com a cozinha!`, 'info');
};

function updateAppStepperUI(status) {
  const stepAguardando = document.getElementById('stepAguardando');
  const stepPreparo = document.getElementById('stepPreparo');
  const stepPronto = document.getElementById('stepPronto');
  const stepEntregue = document.getElementById('stepEntregue');
  const badge = document.getElementById('appTrackerBadgeStatus');

  if (badge) badge.textContent = status;

  if (status === 'EM_PREPARO') {
    stepAguardando?.classList.add('completed');
    stepPreparo?.classList.add('active');
    stepPronto?.classList.remove('completed', 'active');
  } else if (status === 'PRONTO') {
    stepAguardando?.classList.add('completed');
    stepPreparo?.classList.add('completed');
    stepPronto?.classList.add('active');
    stepEntregue?.classList.remove('completed', 'active');
  } else if (status === 'ENTREGUE') {
    stepAguardando?.classList.add('completed');
    stepPreparo?.classList.add('completed');
    stepPronto?.classList.add('completed');
    stepEntregue?.classList.add('completed');
  }
}

// ==========================================================================
// 3. TELA DO CANAL BALCÃO (Terminal de Caixa PDV & Calculadora de Troco)
// ==========================================================================
function renderBalcaoQuickKeys() {
  const grid = document.getElementById('balcaoQuickGrid');
  if (!grid) return;

  grid.innerHTML = appState.products.map((p, index) => {
    return `
      <div class="balcao-key-card" onclick="addBalcaoItem(${p.id})">
        <div>
          <span class="balcao-key-badge">[F${index + 1}]</span>
          <strong style="font-size: 0.85rem; color: var(--color-clay); display: block;">${p.nome}</strong>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${p.quantidadeDisponivel} un. em estoque</span>
        </div>
        <div style="font-weight: 800; color: #0284c7; margin-top: 8px;">
          R$ ${p.preco.toFixed(2).replace('.', ',')}
        </div>
      </div>
    `;
  }).join('');

  renderBalcaoLedger();
}

window.addBalcaoItem = function(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;

  const existing = appState.balcaoCart.find(i => i.product.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    appState.balcaoCart.push({ product, quantity: 1 });
  }

  renderBalcaoLedger();
};

window.removeBalcaoItem = function(productId) {
  const idx = appState.balcaoCart.findIndex(i => i.product.id === productId);
  if (idx !== -1) {
    appState.balcaoCart.splice(idx, 1);
    renderBalcaoLedger();
  }
};

function renderBalcaoLedger() {
  const tbody = document.getElementById('balcaoLedgerBody');
  const totalEl = document.getElementById('balcaoTotalVal');
  if (!tbody) return;

  if (appState.balcaoCart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhum item lançado no caixa.</td></tr>`;
    if (totalEl) totalEl.textContent = 'R$ 0,00';
    calculateBalcaoChange();
    return;
  }

  let total = 0;
  tbody.innerHTML = appState.balcaoCart.map(i => {
    const sub = i.product.preco * i.quantity;
    total += sub;

    return `
      <tr>
        <td><strong>${i.product.nome}</strong></td>
        <td style="text-align: center;">${i.quantity}</td>
        <td style="text-align: right;">R$ ${i.product.preco.toFixed(2).replace('.', ',')}</td>
        <td style="text-align: right; font-weight: 700;">R$ ${sub.toFixed(2).replace('.', ',')}</td>
        <td style="text-align: center;">
          <button style="background: none; border: none; color: #dc2626; cursor: pointer;" onclick="removeBalcaoItem(${i.product.id})">&times;</button>
        </td>
      </tr>
    `;
  }).join('');

  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  calculateBalcaoChange();
}

window.setBalcaoPaymentMethod = function(method) {
  appState.balcaoPaymentMethod = method;
  const btnDinheiro = document.getElementById('btnBalcaoMetodoDinheiro');
  const btnCartao = document.getElementById('btnBalcaoMetodoCartao');
  const btnPix = document.getElementById('btnBalcaoMetodoPix');
  const cashSection = document.getElementById('balcaoCashSection');

  [btnDinheiro, btnCartao, btnPix].forEach(b => {
    if (b) {
      b.style.background = 'var(--bg-subtle)';
      b.style.color = 'var(--text-secondary)';
    }
  });

  if (method === 'DINHEIRO') {
    if (btnDinheiro) {
      btnDinheiro.style.background = '#0284c7';
      btnDinheiro.style.color = '#fff';
    }
    if (cashSection) cashSection.style.display = 'block';
  } else if (method === 'CARTAO_DEBITO') {
    if (btnCartao) {
      btnCartao.style.background = '#0284c7';
      btnCartao.style.color = '#fff';
    }
    if (cashSection) cashSection.style.display = 'none';
  } else {
    if (btnPix) {
      btnPix.style.background = '#0284c7';
      btnPix.style.color = '#fff';
    }
    if (cashSection) cashSection.style.display = 'none';
  }
};

window.calculateBalcaoChange = function() {
  const total = appState.balcaoCart.reduce((acc, i) => acc + (i.product.preco * i.quantity), 0);
  const receivedInput = document.getElementById('balcaoCashReceived');
  const changeEl = document.getElementById('balcaoChangeDisplay');

  if (!receivedInput || !changeEl) return;

  const received = parseFloat(receivedInput.value) || 0;
  if (received >= total && total > 0) {
    const troco = received - total;
    changeEl.textContent = `R$ ${troco.toFixed(2).replace('.', ',')}`;
    changeEl.style.color = '#047857';
  } else {
    changeEl.textContent = 'R$ 0,00';
    changeEl.style.color = '#94a3b8';
  }
};

window.handleBalcaoCheckout = async function() {
  if (appState.balcaoCart.length === 0) {
    showToast('Lance ao menos um item na comanda do balcão!', 'error');
    return;
  }

  const clientName = document.getElementById('balcaoClientInput')?.value || 'Consumidor Balcão';
  const total = appState.balcaoCart.reduce((acc, i) => acc + (i.product.preco * i.quantity), 0);
  const received = parseFloat(document.getElementById('balcaoCashReceived')?.value) || total;
  const troco = Math.max(0, received - total);
  let orderId = appState.orderCounter++;

  const payloadPedido = {
    unidadeId: appState.activeUnitId,
    canalPedido: 'BALCAO',
    itens: appState.balcaoCart.map(i => ({ produtoId: i.product.id, quantidade: i.quantity })),
    observacoes: `Atendente Maria Silva - Cliente: ${clientName}`
  };

  try {
    const res = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadPedido)
    });
    const data = await res.json();
    logApiTraffic('POST', '/pedidos', res.status, payloadPedido, data);

    if (res.ok) {
      orderId = data.pedidoId;
      const resPag = await fetch(`${API_BASE_URL}/pedidos/${orderId}/pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formaPagamento: appState.balcaoPaymentMethod, statusSimulado: 'APROVADO' })
      });
      const dataPag = await resPag.json();
      logApiTraffic('POST', `/pedidos/${orderId}/pagamento`, resPag.status, { formaPagamento: appState.balcaoPaymentMethod, statusSimulado: 'APROVADO' }, dataPag);
    }
  } catch {
    logApiTraffic('POST', '/pedidos (Fallback)', 201, payloadPedido, { pedidoId: orderId, canal: 'BALCAO' });
  }

  // Insere na fila do KDS
  const newOrder = {
    id: orderId,
    unitId: appState.activeUnitId,
    channel: 'BALCAO',
    status: 'EM_PREPARO',
    total,
    createdAt: 'Agora mesmo',
    items: appState.balcaoCart.map(i => ({ name: i.product.nome, quantity: i.quantity, price: i.product.preco })),
    obs: `Balcão: ${clientName}`
  };

  appState.orders.unshift(newOrder);

  // Exibe o cupom do balcão
  const receiptMeta = document.getElementById('balcaoReceiptMeta');
  const receiptClient = document.getElementById('balcaoReceiptClient');
  const receiptItems = document.getElementById('balcaoReceiptItems');
  const receiptTotal = document.getElementById('balcaoReceiptTotal');
  const receiptPaid = document.getElementById('balcaoReceiptPaid');
  const receiptChange = document.getElementById('balcaoReceiptChange');

  if (receiptMeta) receiptMeta.textContent = `Pedido: #${orderId} | Canal: BALCÃO`;
  if (receiptClient) receiptClient.textContent = `Cliente: ${clientName}`;
  if (receiptItems) {
    receiptItems.innerHTML = appState.balcaoCart.map(i => `<div>${i.quantity}x ${i.product.nome} — R$ ${(i.product.preco * i.quantity).toFixed(2).replace('.', ',')}</div>`).join('');
  }
  if (receiptTotal) receiptTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  if (receiptPaid) receiptPaid.textContent = `R$ ${received.toFixed(2).replace('.', ',')}`;
  if (receiptChange) receiptChange.textContent = `R$ ${troco.toFixed(2).replace('.', ',')}`;

  document.getElementById('balcaoReceiptModalOverlay')?.classList.add('open');

  appState.balcaoCart = [];
  renderBalcaoLedger();
  renderKdsBoard();
  updateMonitorMetrics();
};

window.closeBalcaoReceiptModal = function() {
  document.getElementById('balcaoReceiptModalOverlay')?.classList.remove('open');
};

// ==========================================================================
// 4. TELA DO CANAL PICKUP (Retirada Rápida Agendada)
// ==========================================================================
function renderPickupProducts() {
  const grid = document.getElementById('pickupProductsGrid');
  if (!grid) return;

  grid.innerHTML = appState.products.slice(0, 6).map(p => {
    return `
      <div class="totem-product-tile">
        <img src="${formatImageUrl(p.imagem)}" alt="${p.nome}" loading="lazy" />
        <h4>${p.nome}</h4>
        <div class="totem-tile-price">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
        <button class="btn-checkout-proceed" style="padding: 8px; font-size: 0.8rem;" onclick="addPickupItem(${p.id})">
          + Incluir p/ Retirada
        </button>
      </div>
    `;
  }).join('');

  updatePickupSummary();
}

window.selectPickupSlot = function(btnEl, slotText) {
  document.querySelectorAll('.pickup-slot-btn').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  appState.pickupSelectedSlot = slotText;
  const textEl = document.getElementById('pickupSelectedTimeText');
  if (textEl) textEl.textContent = slotText;
};

window.addPickupItem = function(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;

  const existing = appState.pickupCart.find(i => i.product.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    appState.pickupCart.push({ product, quantity: 1 });
  }

  updatePickupSummary();
  showToast(`"${product.nome}" incluído para retirada expressa!`, 'success');
};

function updatePickupSummary() {
  const totalEl = document.getElementById('pickupTotalDisplay');
  const total = appState.pickupCart.reduce((acc, i) => acc + (i.product.preco * i.quantity), 0);
  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

window.handlePickupCheckout = async function() {
  if (appState.pickupCart.length === 0) {
    showToast('Selecione produtos para retirada no canal PICKUP!', 'error');
    return;
  }

  const total = appState.pickupCart.reduce((acc, i) => acc + (i.product.preco * i.quantity), 0);
  let orderId = appState.orderCounter++;

  const payloadPedido = {
    unidadeId: appState.activeUnitId,
    canalPedido: 'PICKUP',
    itens: appState.pickupCart.map(i => ({ produtoId: i.product.id, quantidade: i.quantity })),
    observacoes: `Retirada Agendada: ${appState.pickupSelectedSlot} • Baia Express B-03`
  };

  try {
    const res = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadPedido)
    });
    const data = await res.json();
    logApiTraffic('POST', '/pedidos', res.status, payloadPedido, data);

    if (res.ok) {
      orderId = data.pedidoId;
      const resPag = await fetch(`${API_BASE_URL}/pedidos/${orderId}/pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formaPagamento: 'PIX', statusSimulado: 'APROVADO' })
      });
      const dataPag = await resPag.json();
      logApiTraffic('POST', `/pedidos/${orderId}/pagamento`, resPag.status, { formaPagamento: 'PIX', statusSimulado: 'APROVADO' }, dataPag);
    }
  } catch {
    logApiTraffic('POST', '/pedidos (Fallback)', 201, payloadPedido, { pedidoId: orderId, canal: 'PICKUP' });
  }

  const newOrder = {
    id: orderId,
    unitId: appState.activeUnitId,
    channel: 'PICKUP',
    status: 'EM_PREPARO',
    total,
    createdAt: 'Agora mesmo',
    items: appState.pickupCart.map(i => ({ name: i.product.nome, quantity: i.quantity, price: i.product.preco })),
    obs: `Retirada: ${appState.pickupSelectedSlot} (Baia B-03)`
  };

  appState.orders.unshift(newOrder);

  // Preenche voucher de retirada
  const unit = appState.units.find(u => u.id === appState.activeUnitId);
  const vPin = document.getElementById('pickupVoucherPin');
  const vUnit = document.getElementById('voucherUnitName');
  const vTime = document.getElementById('voucherTimeText');
  const vOrder = document.getElementById('voucherOrderId');

  const pinRandom = Math.floor(1000 + Math.random() * 9000);
  if (vPin) vPin.textContent = pinRandom;
  if (vUnit) vUnit.textContent = unit?.nome || 'Matriz Recife';
  if (vTime) vTime.textContent = appState.pickupSelectedSlot;
  if (vOrder) vOrder.textContent = `#${orderId}`;

  document.getElementById('pickupVoucherModalOverlay')?.classList.add('open');

  appState.pickupCart = [];
  updatePickupSummary();
  renderKdsBoard();
  updateMonitorMetrics();
};

window.closePickupVoucherModal = function() {
  document.getElementById('pickupVoucherModalOverlay')?.classList.remove('open');
  switchView('KDS');
};

// ==========================================================================
// 5. TELA DO CANAL WEB (Portal Web Delivery)
// ==========================================================================
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const filtered = appState.products.filter(p => {
    if (appState.activeCategory === 'TODOS') return true;
    return p.categoria === appState.activeCategory;
  });

  grid.innerHTML = filtered.map(product => {
    const stock = product.quantidadeDisponivel;
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= 5;

    let stockClass = 'badge-stock';
    let stockText = `${stock} un. em estoque`;
    if (isOutOfStock) {
      stockClass += ' out-of-stock';
      stockText = 'Esgotado nesta filial';
    } else if (isLowStock) {
      stockClass += ' low-stock';
      stockText = `Últimas ${stock} unidades!`;
    }

    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img src="${formatImageUrl(product.imagem)}" alt="${product.nome}" class="product-image" loading="lazy" />
          <span class="badge-category">${product.categoria}</span>
          <span class="${stockClass}">${stockText}</span>
        </div>
        <div class="product-body">
          <h3 class="product-name">${product.nome}</h3>
          <p class="product-description">${product.descricao}</p>
          <div class="product-footer">
            <div class="product-price-box">
              <span class="price-currency">R$</span>
              <span class="price-amount">${product.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <button 
              class="btn-add-cart" 
              onclick="addToCart(${product.id})"
              ${isOutOfStock ? 'disabled' : ''}
            >
              ${isOutOfStock ? 'Indisponível' : '+ Adicionar'}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

window.addToCart = function(productId) {
  const product = appState.products.find(p => p.id === productId);
  if (!product) return;

  const currentStock = product.quantidadeDisponivel;
  const existing = appState.cart.find(i => i.product.id === productId);

  if (existing) {
    if (existing.quantity >= currentStock) {
      showToast(`Estoque máximo (${currentStock} un.) atingido!`, 'error');
      return;
    }
    existing.quantity += 1;
  } else {
    if (currentStock < 1) {
      showToast('Produto sem estoque nesta filial!', 'error');
      return;
    }
    appState.cart.push({ product, quantity: 1 });
  }

  updateCartCounter();
  renderCart();
  showToast(`"${product.nome}" adicionado à cesta!`, 'success');
};

window.updateCartQuantity = function(productId, delta) {
  const idx = appState.cart.findIndex(i => i.product.id === productId);
  if (idx === -1) return;

  const item = appState.cart[idx];
  const maxStock = item.product.quantidadeDisponivel;

  if (delta > 0) {
    if (item.quantity >= maxStock) {
      showToast(`Estoque máximo atingido (${maxStock} un.)!`, 'error');
      return;
    }
    item.quantity += 1;
  } else {
    item.quantity -= 1;
    if (item.quantity <= 0) appState.cart.splice(idx, 1);
  }

  updateCartCounter();
  renderCart();
};

function updateCartCounter() {
  const badge = document.getElementById('cartBadgeCount');
  const count = appState.cart.reduce((acc, i) => acc + i.quantity, 0);
  if (badge) badge.textContent = count;
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const fidelityPointsEl = document.getElementById('cartFidelityPoints');
  const btnProceed = document.getElementById('btnProceedCheckout');

  if (!container) return;

  if (appState.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🛒</div>
        <p style="font-weight: 700; color: var(--color-clay);">Sua cesta está vazia</p>
        <p style="font-size: 0.8rem;">Adicione pratos típicos nordestinos para iniciar.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = 'R$ 0,00';
    if (totalEl) totalEl.textContent = 'R$ 0,00';
    if (fidelityPointsEl) fidelityPointsEl.textContent = '0 pts';
    if (btnProceed) btnProceed.disabled = true;
    return;
  }

  if (btnProceed) btnProceed.disabled = false;
  let subtotal = 0;

  container.innerHTML = appState.cart.map(item => {
    const itemTotal = item.product.preco * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-item">
        <img src="${formatImageUrl(item.product.imagem)}" alt="${item.product.nome}" class="cart-item-thumb" />
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.product.nome}</h4>
          <span class="cart-item-unit-price">R$ ${item.product.preco.toFixed(2).replace('.', ',')} un.</span>
          <div class="cart-item-controls">
            <div class="quantity-stepper">
              <button class="stepper-btn" onclick="updateCartQuantity(${item.product.id}, -1)">-</button>
              <span class="stepper-value">${item.quantity}</span>
              <button class="stepper-btn" onclick="updateCartQuantity(${item.product.id}, 1)">+</button>
            </div>
            <span class="cart-item-subtotal">R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const fidelityPoints = Math.floor(subtotal / 10);
  if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  if (totalEl) totalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  if (fidelityPointsEl) fidelityPointsEl.textContent = `${fidelityPoints} pts`;
}

function openCartDrawer() {
  document.getElementById('cartDrawerOverlay')?.classList.add('open');
}
function closeCartDrawer() {
  document.getElementById('cartDrawerOverlay')?.classList.remove('open');
}
function openPaymentModal() {
  document.getElementById('paymentModalOverlay')?.classList.add('open');
}
function closePaymentModal() {
  document.getElementById('paymentModalOverlay')?.classList.remove('open');
}

function handleProceedToCheckout() {
  if (appState.cart.length === 0) return;

  const subtotal = appState.cart.reduce((acc, i) => acc + (i.product.preco * i.quantity), 0);
  const orderChannelEl = document.getElementById('modalOrderChannel');
  const orderTotalEl = document.getElementById('modalOrderTotal');
  const orderItemsCountEl = document.getElementById('modalOrderItemsCount');

  if (orderChannelEl) orderChannelEl.textContent = `Canal: WEB`;
  if (orderTotalEl) orderTotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  if (orderItemsCountEl) orderItemsCountEl.textContent = `${appState.cart.length} itens`;

  closeCartDrawer();
  openPaymentModal();
}

async function handleMockPaymentExecution() {
  const selectedSimulation = document.querySelector('input[name="mockScenario"]:checked')?.value || 'APROVADO';
  const selectedPaymentMethod = document.querySelector('.payment-methods-grid .payment-method-card.selected')?.dataset.method || 'PIX';
  const obsInput = document.getElementById('orderObservations');

  const btnSubmit = document.getElementById('btnSubmitMockPayment');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Processando Pagamento Mock...';
  }

  try {
    let orderSuccess = false;
    let newOrderId = null;

    const payloadPedido = {
      unidadeId: appState.activeUnitId,
      canalPedido: 'WEB',
      itens: appState.cart.map(i => ({ produtoId: i.product.id, quantidade: i.quantity })),
      observacoes: obsInput?.value || 'Portal Web Delivery'
    };

    try {
      const resPedido = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadPedido)
      });

      const dataPedido = await resPedido.json();
      logApiTraffic('POST', '/pedidos', resPedido.status, payloadPedido, dataPedido);

      if (resPedido.ok) {
        newOrderId = dataPedido.pedidoId;

        const resPag = await fetch(`${API_BASE_URL}/pedidos/${newOrderId}/pagamento`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formaPagamento: selectedPaymentMethod, statusSimulado: selectedSimulation })
        });
        const dataPag = await resPag.json();
        logApiTraffic('POST', `/pedidos/${newOrderId}/pagamento`, resPag.status, { formaPagamento: selectedPaymentMethod, statusSimulado: selectedSimulation }, dataPag);

        if (resPag.ok) {
          orderSuccess = true;
        } else if (resPag.status === 400) {
          showToast(`❌ Pagamento RECUSADO pelo Mock! Pedido #${newOrderId} permanece em AGUARDANDO_PAGAMENTO.`, 'error');
          return;
        } else {
          showToast(`⚠️ Falha de comunicação simulada (HTTP ${resPag.status}).`, 'error');
          return;
        }
      }
    } catch {
      // Fallback local
    }

    if (selectedSimulation === 'RECUSADO') {
      showToast(`❌ Pagamento RECUSADO pelo Mock! O pedido não foi enviado para a cozinha.`, 'error');
      return;
    }

    if (selectedSimulation === 'TIMEOUT') {
      showToast(`🟡 Falha de conexão simulada com o gateway (HTTP 503). Tente novamente.`, 'error');
      return;
    }

    if (!newOrderId) newOrderId = appState.orderCounter++;
    const subtotal = appState.cart.reduce((acc, i) => acc + (i.product.preco * i.quantity), 0);

    const newOrder = {
      id: newOrderId,
      unitId: appState.activeUnitId,
      channel: 'WEB',
      status: 'EM_PREPARO',
      total: subtotal,
      createdAt: 'Agora mesmo',
      items: appState.cart.map(i => ({ name: i.product.nome, quantity: i.quantity, price: i.product.preco })),
      obs: obsInput?.value || 'Portal Web Delivery'
    };

    appState.orders.unshift(newOrder);

    appState.cart.forEach(ci => {
      ci.product.quantidadeDisponivel = Math.max(0, ci.product.quantidadeDisponivel - ci.quantity);
    });

    showToast(`🎉 Pedido #${newOrderId} APROVADO via ${selectedPaymentMethod}! Enviado para a Cozinha KDS.`, 'success');
    appState.cart = [];
    updateCartCounter();
    renderCart();
    renderProducts();
    renderKdsBoard();
    updateMonitorMetrics();
    closePaymentModal();

    setTimeout(() => {
      switchView('KDS');
    }, 600);

  } catch (err) {
    showToast(`Erro na operação: ${err.message}`, 'error');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '⚡ Processar Pagamento (Mock)';
    }
  }
}

// ==========================================================================
// 6. PAINEL DA COZINHA (KDS - KITCHEN DISPLAY SYSTEM)
// ==========================================================================
function renderKdsBoard() {
  const prepList = document.getElementById('kdsPreparingList');
  const readyList = document.getElementById('kdsReadyList');
  const deliveredList = document.getElementById('kdsDeliveredList');

  const countPrep = document.getElementById('kdsCountPreparing');
  const countReady = document.getElementById('kdsCountReady');

  if (!prepList || !readyList || !deliveredList) return;

  prepList.innerHTML = '';
  readyList.innerHTML = '';
  deliveredList.innerHTML = '';

  const prepOrders = appState.orders.filter(o => o.status === 'EM_PREPARO');
  const readyOrders = appState.orders.filter(o => o.status === 'PRONTO');
  const deliveredOrders = appState.orders.filter(o => o.status === 'ENTREGUE');

  if (countPrep) countPrep.textContent = prepOrders.length;
  if (countReady) countReady.textContent = readyOrders.length;

  if (prepOrders.length === 0) {
    prepList.innerHTML = '<p style="text-align:center; padding:20px; font-size:0.8rem; color:var(--text-muted);">Nenhum pedido em preparo.</p>';
  } else {
    prepOrders.forEach(order => prepList.appendChild(createKdsOrderCard(order)));
  }

  if (readyOrders.length === 0) {
    readyList.innerHTML = '<p style="text-align:center; padding:20px; font-size:0.8rem; color:var(--text-muted);">Nenhum pedido pronto.</p>';
  } else {
    readyOrders.forEach(order => readyList.appendChild(createKdsOrderCard(order)));
  }

  if (deliveredOrders.length === 0) {
    deliveredList.innerHTML = '<p style="text-align:center; padding:20px; font-size:0.8rem; color:var(--text-muted);">Nenhum pedido entregue recentemente.</p>';
  } else {
    deliveredOrders.forEach(order => deliveredList.appendChild(createKdsOrderCard(order)));
  }
}

function createKdsOrderCard(order) {
  const card = document.createElement('div');
  card.className = `kds-order-card priority-high`;

  const itemsHtml = order.items.map(i => `
    <div class="kds-item-row">
      <span class="kds-item-name">${i.name}</span>
      <span class="kds-item-qty">${i.quantity}x</span>
    </div>
  `).join('');

  let actionBtn = '';
  if (order.status === 'EM_PREPARO') {
    actionBtn = `
      <button class="kds-action-btn btn-ready" onclick="advanceOrderStatus(${order.id}, 'PRONTO')">
        ✅ Concluir Preparo (Marcar Pronto)
      </button>
    `;
  } else if (order.status === 'PRONTO') {
    actionBtn = `
      <button class="kds-action-btn btn-deliver" onclick="advanceOrderStatus(${order.id}, 'ENTREGUE')">
        📦 Entregar ao Cliente / Retirada
      </button>
    `;
  }

  card.innerHTML = `
    <div class="kds-card-header">
      <span class="kds-order-id">Pedido #${order.id}</span>
      <span class="channel-tag-badge tag-${order.channel}">Canal: ${order.channel}</span>
    </div>
    <div class="kds-order-meta">
      <span>🕒 ${order.createdAt}</span> | <span>Total: R$ ${order.total.toFixed(2).replace('.', ',')}</span>
    </div>
    <div class="kds-items-list">${itemsHtml}</div>
    ${order.obs ? `<div class="kds-order-obs"><strong>Obs:</strong> ${order.obs}</div>` : ''}
    ${actionBtn}
  `;

  return card;
}

window.advanceOrderStatus = async function(orderId, newStatus) {
  const order = appState.orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    renderKdsBoard();
    updateMonitorMetrics();
    showToast(`Pedido #${orderId} atualizado para: ${newStatus}!`, 'success');
  }

  try {
    if (appState.authToken) {
      const res = await fetch(`${API_BASE_URL}/pedidos/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${appState.authToken}`
        },
        body: JSON.stringify({ novoStatus: newStatus })
      });
      const data = await res.json();
      logApiTraffic('PATCH', `/pedidos/${orderId}/status`, res.status, { novoStatus: newStatus }, data);
    }
  } catch {}
};

// ==========================================================================
// 7. MONITOR MULTICANAL & DISPARADOR DE TESTES REST
// ==========================================================================
function updateMonitorMetrics() {
  const totemCount = appState.orders.filter(o => o.channel === 'TOTEM').length;
  const appCount = appState.orders.filter(o => o.channel === 'APP').length;
  const balcaoCount = appState.orders.filter(o => o.channel === 'BALCAO').length;
  const pickupCount = appState.orders.filter(o => o.channel === 'PICKUP').length;
  const webCount = appState.orders.filter(o => o.channel === 'WEB').length;

  const tEl = document.getElementById('metricCountTotem');
  const aEl = document.getElementById('metricCountApp');
  const bEl = document.getElementById('metricCountBalcao');
  const pEl = document.getElementById('metricCountPickup');
  const wEl = document.getElementById('metricCountWeb');

  if (tEl) tEl.textContent = totemCount;
  if (aEl) aEl.textContent = appCount;
  if (bEl) bEl.textContent = balcaoCount;
  if (pEl) pEl.textContent = pickupCount;
  if (wEl) wEl.textContent = webCount;
}

window.quickSimulateOrder = async function(channel) {
  const product = appState.products[Math.floor(Math.random() * appState.products.length)];
  const orderId = appState.orderCounter++;

  const payload = {
    unidadeId: appState.activeUnitId,
    canalPedido: channel,
    itens: [{ produtoId: product.id, quantidade: 1 }],
    observacoes: `Teste de Carga via Monitor (${channel})`
  };

  try {
    const res = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    logApiTraffic('POST', '/pedidos', res.status, payload, data);
  } catch {
    logApiTraffic('POST', '/pedidos (Fallback)', 201, payload, { pedidoId: orderId, canal: channel });
  }

  const newOrder = {
    id: orderId,
    unitId: appState.activeUnitId,
    channel,
    status: 'EM_PREPARO',
    total: product.preco,
    createdAt: 'Agora mesmo',
    items: [{ name: product.nome, quantity: 1, price: product.preco }],
    obs: `Carga Automatizada ${channel}`
  };

  appState.orders.unshift(newOrder);
  renderKdsBoard();
  updateMonitorMetrics();
  showToast(`Pedido teste criado no canal: ${channel}!`, 'success');
};

// ==========================================================================
// INTEGRAÇÃO COM A API RESTFUL
// ==========================================================================
async function loadUnitsFromApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/unidades`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        appState.units = data;
        if (!appState.units.some(u => u.id === appState.activeUnitId)) {
          appState.activeUnitId = data[0].id;
        }
        const select = document.getElementById('unitSelector');
        if (select) {
          select.innerHTML = appState.units.map(u => 
            `<option value="${u.id}" ${u.id === appState.activeUnitId ? 'selected' : ''}>${u.nome}</option>`
          ).join('');
        }
      }
    }
  } catch {}
}

async function loadMenuFromApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/unidades/${appState.activeUnitId}/produtos`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.cardapio) && data.cardapio.length > 0) {
        appState.products = data.cardapio;
        renderProducts();
        renderTotemProducts();
        renderAppProducts();
        renderBalcaoQuickKeys();
        renderPickupProducts();
        return;
      }
    }
  } catch {}

  appState.products = getFallbackProducts(appState.activeUnitId);
  renderProducts();
  renderTotemProducts();
  renderAppProducts();
  renderBalcaoQuickKeys();
  renderPickupProducts();
}

async function authenticateClient() {
  try {
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cliente@exemplo.com', senha: 'Senha@123' })
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      appState.authToken = data.accessToken;
      logApiTraffic('POST', '/auth/login', 200, { email: 'cliente@exemplo.com' }, { token: 'Bearer [JWT]', perfil: data.usuario?.perfil });
    }
  } catch {}
}

async function loadFidelityFromApi() {
  if (!appState.authToken) return;

  try {
    const res = await fetch(`${API_BASE_URL}/fidelidade/saldo`, {
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });

    if (res.ok) {
      const data = await res.json();
      logApiTraffic('GET', '/fidelidade/saldo', 200, null, data);
      const pointsEl = document.getElementById('appFidelityPointsDisplay');
      if (pointsEl && data.saldoPontos !== undefined) {
        pointsEl.textContent = `${data.saldoPontos} pts`;
      }
    }
  } catch {}
}

async function loadOrdersFromApi() {
  try {
    if (!appState.authToken) {
      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@raizesdonordeste.com.br', senha: 'Admin@123' })
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        appState.authToken = loginData.accessToken;
      }
    }

    if (appState.authToken) {
      const res = await fetch(`${API_BASE_URL}/pedidos?limit=50`, {
        headers: { 'Authorization': `Bearer ${appState.authToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          appState.orders = data.data.map(p => ({
            id: p.id,
            unitId: p.unidadeId,
            channel: p.canalPedido,
            status: p.status,
            total: p.valorTotal,
            createdAt: new Date(p.criadoEm).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: p.itens.map(i => ({
              name: i.produto ? i.produto.nome : `Item #${i.produtoId}`,
              quantity: i.quantidade,
              price: i.precoUnitario
            })),
            obs: p.observacoes || 'Sem observações'
          }));
          renderKdsBoard();
          updateMonitorMetrics();
        }
      }
    }
  } catch {}
}

// Toast Notificações
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}


// ==========================================================================
// GESTÃO DE AUTENTICAÇÃO JWT & PERFIS RBAC (CLIENTE, ATENDENTE, COZINHA, ADMIN)
// ==========================================================================
const quickUsers = {
  cliente: { email: 'cliente@exemplo.com', senha: 'Senha@123', nome: 'Lucas Gabriel', role: 'CLIENTE' },
  atendente: { email: 'atendente@raizesdonordeste.com.br', senha: 'Senha@123', nome: 'Maria Silva', role: 'ATENDENTE' },
  cozinha: { email: 'cozinha@raizesdonordeste.com.br', senha: 'Senha@123', nome: 'Severino José', role: 'COZINHA' },
  admin: { email: 'admin@raizesdonordeste.com.br', senha: 'Admin@123', nome: 'Administrador Franquia', role: 'ADMIN' }
};

window.openAuthModal = function() {
  document.getElementById('authModalOverlay')?.classList.add('open');
  updateAuthModalUI();
};

window.closeAuthModal = function() {
  document.getElementById('authModalOverlay')?.classList.remove('open');
};

window.switchAuthModalTab = function(tab) {
  const loginContent = document.getElementById('authModalLoginContent');
  const registerContent = document.getElementById('authModalRegisterContent');
  const loginBtn = document.getElementById('tabAuthLoginBtn');
  const regBtn = document.getElementById('tabAuthRegisterBtn');

  if (tab === 'login') {
    if (loginContent) loginContent.style.display = 'block';
    if (registerContent) registerContent.style.display = 'none';
    if (loginBtn) { loginBtn.style.background = 'var(--color-clay)'; loginBtn.style.color = '#fff'; }
    if (regBtn) { regBtn.style.background = 'var(--bg-subtle)'; regBtn.style.color = 'var(--text-secondary)'; }
  } else {
    if (loginContent) loginContent.style.display = 'none';
    if (registerContent) registerContent.style.display = 'block';
    if (regBtn) { regBtn.style.background = 'var(--color-clay)'; regBtn.style.color = '#fff'; }
    if (loginBtn) { loginBtn.style.background = 'var(--bg-subtle)'; loginBtn.style.color = 'var(--text-secondary)'; }
  }
};

window.selectQuickUser = function(key) {
  const user = quickUsers[key];
  if (!user) return;

  const emailInput = document.getElementById('authLoginEmail');
  const passInput = document.getElementById('authLoginPassword');

  if (emailInput) emailInput.value = user.email;
  if (passInput) passInput.value = user.senha;

  // Destaca o card selecionado
  document.querySelectorAll('.auth-quick-user-card').forEach(c => c.classList.remove('active'));
  event.currentTarget?.classList.add('active');

  showToast(`Usuário ${user.nome} (${user.role}) selecionado para login.`, 'info');
};

window.handleAuthLogin = async function() {
  const email = document.getElementById('authLoginEmail')?.value?.trim();
  const senha = document.getElementById('authLoginPassword')?.value;

  if (!email || !senha) {
    showToast('Informe e-mail e senha para autenticar!', 'error');
    return;
  }

  const btnSubmit = document.getElementById('btnSubmitLogin');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Autenticando via API...';
  }

  try {
    const payload = { email, senha };
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    logApiTraffic('POST', '/auth/login', res.status, payload, data);

    if (res.ok && data.accessToken) {
      appState.authToken = data.accessToken;
      appState.clientUser = {
        nome: data.usuario?.nome || email.split('@')[0],
        email: data.usuario?.email || email,
        perfil: data.usuario?.perfil || 'CLIENTE',
        consentimentoLGPD: data.usuario?.consentimentoLGPD || true
      };

      updateHeaderAuthBadge();
      updateAuthModalUI();
      showToast(`🎉 Autenticado com sucesso como ${appState.clientUser.nome} (${appState.clientUser.perfil})!`, 'success');

      // Se for cliente, atualiza fidelidade
      if (appState.clientUser.perfil === 'CLIENTE') {
        loadFidelityFromApi();
      }

      setTimeout(() => {
        closeAuthModal();
      }, 700);
    } else {
      showToast(`❌ Falha na autenticação: ${data.message || 'Credenciais inválidas'}`, 'error');
    }
  } catch (err) {
    // Fallback offline
    const matched = Object.values(quickUsers).find(u => u.email === email);
    if (matched && matched.senha === senha) {
      appState.authToken = `MOCK_JWT_${matched.role}_${Date.now()}`;
      appState.clientUser = { nome: matched.nome, email: matched.email, perfil: matched.role };
      updateHeaderAuthBadge();
      updateAuthModalUI();
      showToast(`🎉 Autenticado localmente como ${matched.nome} (${matched.role})!`, 'success');
      setTimeout(() => closeAuthModal(), 700);
    } else {
      showToast(`Erro na autenticação: ${err.message}`, 'error');
    }
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '⚡ Autenticar e Obter Token JWT (POST /auth/login)';
    }
  }
};

window.handleAuthLogout = function() {
  appState.authToken = null;
  appState.clientUser = {
    nome: 'Não Autenticado',
    email: '',
    perfil: 'GUEST'
  };

  updateHeaderAuthBadge();
  updateAuthModalUI();
  showToast('Sessão encerrada com sucesso.', 'info');
};

window.handleAuthRegister = async function() {
  const nome = document.getElementById('regNome')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const senha = document.getElementById('regSenha')?.value;
  const telefone = document.getElementById('regTelefone')?.value?.trim();
  const perfil = document.getElementById('regPerfil')?.value || 'CLIENTE';
  const consentimentoLGPD = document.getElementById('regConsentimentoLGPD')?.checked || false;

  if (!nome || !email || !senha) {
    showToast('Preencha os campos obrigatórios (Nome, E-mail e Senha)!', 'error');
    return;
  }

  if (senha.length < 6) {
    showToast('A senha deve possuir no mínimo 6 caracteres!', 'error');
    return;
  }

  if (!consentimentoLGPD) {
    showToast('O aceite dos termos da LGPD é mandatório para o cadastro!', 'error');
    return;
  }

  const payload = { nome, email, senha, telefone, perfil, consentimentoLGPD };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    logApiTraffic('POST', '/auth/register', res.status, { ...payload, senha: '***' }, data);

    if (res.ok || res.status === 201) {
      showToast(`✓ Usuário ${nome} registrado com sucesso!`, 'success');
      
      // Preenche tela de login
      const emailInput = document.getElementById('authLoginEmail');
      const passInput = document.getElementById('authLoginPassword');
      if (emailInput) emailInput.value = email;
      if (passInput) passInput.value = senha;

      switchAuthModalTab('login');
    } else {
      showToast(`Erro ao registrar: ${data.message || 'Dados inválidos'}`, 'error');
    }
  } catch (err) {
    showToast(`Erro na requisição: ${err.message}`, 'error');
  }
};

function updateHeaderAuthBadge() {
  const label = document.getElementById('authBadgeLabel');
  const roleBadge = document.getElementById('authBadgeRole');
  const triggerBtn = document.getElementById('btnOpenAuthModal');
  const appUser = document.getElementById('appUserName');

  const user = appState.clientUser;
  const isAuth = !!appState.authToken;

  if (label) label.textContent = isAuth ? user.nome.split(' ')[0] : 'Entrar / Perfis';
  if (roleBadge) {
    roleBadge.textContent = user.perfil || 'GUEST';
    roleBadge.className = `auth-role-tag ${user.perfil || 'CLIENTE'}`;
  }
  if (triggerBtn) {
    triggerBtn.classList.toggle('logged-in', isAuth);
  }
  if (appUser && user.nome) {
    appUser.textContent = user.nome;
  }
}

function updateAuthModalUI() {
  const nameEl = document.getElementById('authCurrentUserNameDisplay');
  const roleEl = document.getElementById('authCurrentUserRoleBadge');
  const tokenBox = document.getElementById('authTokenDisplayBox');

  const user = appState.clientUser;
  const isAuth = !!appState.authToken;

  if (nameEl) nameEl.textContent = isAuth ? `${user.nome} (${user.email})` : 'Nenhum usuário autenticado';
  if (roleEl) {
    roleEl.textContent = user.perfil || 'GUEST';
    roleEl.className = `auth-role-tag ${user.perfil || 'CLIENTE'}`;
  }
  if (tokenBox) {
    tokenBox.textContent = appState.authToken ? `Bearer ${appState.authToken}` : 'Token não emitido. Realize login para gerar token JWT.';
  }
}

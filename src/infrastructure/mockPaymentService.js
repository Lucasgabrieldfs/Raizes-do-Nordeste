import { v4 as uuidv4 } from 'uuid';

/**
 * Serviço de Gateway de Pagamento Desacoplado (Mock)
 * Atende às especificações do edital UNINTER (Fluxo A)
 */
export class MockPaymentService {
  static async processPayment({ pedidoId, valor, formaPagamento, statusSimulado = 'APROVADO' }) {
    const protocoloMock = `MOCK-TX-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Simulação do cenário de TIMEOUT / Falha de conectividade
    if (statusSimulado === 'TIMEOUT') {
      const error = new Error('Falha de comunicação com o adquirente bancário (Timeout 503)');
      error.statusCode = 503;
      error.code = 'ERRO_COMUNICACAO_GATEWAY';
      throw error;
    }

    // Simulação do cenário de RECUSADO (Sem limite / Cartão bloqueado)
    if (statusSimulado === 'RECUSADO') {
      return {
        sucesso: false,
        statusTransacao: 'RECUSADO',
        protocoloMock,
        motivo: 'Transação recusada pela instituição financeira emissora (Saldo/Limite insuficiente).',
        pedidoId,
        valor,
        dataHora: new Date().toISOString()
      };
    }

    // Simulação de SUCESSO / APROVADO
    return {
      sucesso: true,
      statusTransacao: 'APROVADO',
      protocoloMock,
      pedidoId,
      valor,
      formaPagamento,
      autorizacaoCartao: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      dataHora: new Date().toISOString()
    };
  }
}

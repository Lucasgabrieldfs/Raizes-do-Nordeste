import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware Centralizado de Tratamento de Erros
 * Segue rigorosamente o padrão RFC 7807 (Problem Details for HTTP APIs) exigido pela UNINTER
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.status || 500);
  const errorCode = err.code || err.error || (statusCode === 500 ? 'ERRO_INTERNO_SERVIDOR' : 'ERRO_REQUISICAO');
  const message = err.message || 'Ocorreu um erro inesperado ao processar a requisição.';
  const details = err.details || [];
  const requestId = req.headers['x-request-id'] || uuidv4();

  if (statusCode >= 500) {
    console.error(`[ERRO 500] RequestId: ${requestId} - Path: ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    error: errorCode,
    message,
    details,
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.url,
    requestId
  });
}

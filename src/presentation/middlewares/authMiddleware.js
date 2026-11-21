import jwt from 'jsonwebtoken';
import { config } from '../../config/environment.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const error = new Error('Token de autenticação não fornecido no cabeçalho Authorization.');
    error.statusCode = 401;
    error.code = 'TOKEN_NAO_FORNECIDO';
    return next(error);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    const error = new Error('Formato de token inválido. Utilize o padrão: Bearer <token>.');
    error.statusCode = 401;
    error.code = 'FORMATO_TOKEN_INVALIDO';
    return next(error);
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; // { id, email, perfil, nome }
    next();
  } catch (err) {
    const error = new Error(err.name === 'TokenExpiredError' ? 'Token expirado. Efetue login novamente.' : 'Token inválido ou corrompido.');
    error.statusCode = 401;
    error.code = 'TOKEN_INVALIDO';
    return next(error);
  }
}

export function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      req.user = jwt.verify(parts[1], config.jwtSecret);
    } catch {
      // Ignora erro se for opcional
    }
  }
  next();
}

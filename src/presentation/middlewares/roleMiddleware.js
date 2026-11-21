/**
 * Middleware de Autorização Baseada em Papéis (RBAC)
 * @param {Array<string>} allowedRoles Lista de perfis autorizados (ex: ['ADMIN', 'COZINHA'])
 */
export function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Usuário não autenticado.');
      error.statusCode = 401;
      error.code = 'NAO_AUTENTICADO';
      return next(error);
    }

    if (!allowedRoles.includes(req.user.perfil)) {
      const error = new Error(`Acesso negado. O perfil '${req.user.perfil}' não tem permissão para acessar este recurso.`);
      error.statusCode = 403;
      error.code = 'ACESSO_PROIBIDO';
      error.details = [{ field: 'perfil', issue: `Perfis autorizados: ${allowedRoles.join(', ')}` }];
      return next(error);
    }

    next();
  };
}

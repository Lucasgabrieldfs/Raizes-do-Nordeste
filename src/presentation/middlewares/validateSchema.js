/**
 * Middleware para validação rigorosa de schemas com Zod
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} source 
 */
export function validateSchema(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.errors.map(err => ({
        field: err.path.join('.'),
        issue: err.message
      }));

      const error = new Error('Falha na validação dos dados de entrada.');
      error.statusCode = 422; // Unprocessable Entity
      error.code = 'DADOS_INVALIDOS';
      error.details = details;
      return next(error);
    }

    req[source] = result.data;
    next();
  };
}

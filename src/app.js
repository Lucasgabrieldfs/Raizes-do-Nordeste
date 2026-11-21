import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

import { config } from './config/environment.js';
import apiRouter from './presentation/routes/index.js';
import { errorHandler } from './presentation/middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Carregar especificação Swagger OpenAPI 3.0
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'docs', 'swagger.json'), 'utf8')
);

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir Front-end Estático (Totem do Cliente & KDS da Cozinha)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.use('/public', express.static(publicDir));
app.use('/demo', express.static(publicDir));

// Rota de Documentação Swagger UI Interativa
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Raízes do Nordeste API | Documentação Swagger',
  customCss: '.swagger-ui .topbar { background-color: #08285C; }'
}));

// Rotas da API RESTful (v1)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Rota Raiz Informativa / Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    projeto: 'Rede Raízes do Nordeste - Trilha Back-End UNINTER',
    estudante: 'Lucas Gabriel',
    ru: '4840330',
    versao: '1.0.0',
    swagger: 'http://localhost:3000/api-docs',
    demo: 'http://localhost:3000/demo',
    timestamp: new Date().toISOString()
  });
});

// Tratamento de Rotas Inexistentes (404) no padrão RFC 7807
app.use((req, res, next) => {
  res.status(404).json({
    error: 'ROTA_NAO_ENCONTRADA',
    message: `A rota '${req.method} ${req.originalUrl}' não existe nesta API.`,
    details: [
      { issue: 'Consulte a documentação completa dos endpoints em /api-docs' }
    ],
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// Middleware Central de Erros (RFC 7807)
app.use(errorHandler);

// Iniciar Servidor
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 SERVIDOR DA REDE "RAÍZES DO NORDESTE" OPERANDO NA PORTA ${PORT}`);
  console.log(`📍 Swagger UI (OpenAPI 3.0): http://localhost:${PORT}/api-docs`);
  console.log(`🍔 Painel Visual (Totem & KDS): http://localhost:${PORT}/demo`);
  console.log(`🎓 Estudante: Lucas Gabriel | RU: 4840330 | Polo: Formosa-GO`);
  console.log(`================================================================`);
});

export default app;

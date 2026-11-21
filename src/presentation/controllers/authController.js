import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prismaClient.js';
import { config } from '../../config/environment.js';
import { logAudit } from '../../infrastructure/auditLogger.js';

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve conter no mínimo 2 caracteres'),
  email: z.string().email('Formato de e-mail inválido'),
  senha: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres'),
  telefone: z.string().optional(),
  perfil: z.enum(['CLIENTE', 'ATENDENTE', 'COZINHA', 'ADMIN']).optional().default('CLIENTE'),
  consentimentoLGPD: z.boolean().refine(val => val === true, {
    message: 'É obrigatório aceitar os termos de tratamento de dados conforme a LGPD'
  })
});

export const loginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido'),
  senha: z.string().min(1, 'A senha é obrigatória')
});

export class AuthController {
  static async register(req, res, next) {
    try {
      const { nome, email, senha, telefone, perfil, consentimentoLGPD } = req.body;

      const userExists = await prisma.usuario.findUnique({ where: { email } });
      if (userExists) {
        const error = new Error('Já existe um usuário cadastrado com este e-mail.');
        error.statusCode = 409;
        error.code = 'EMAIL_JA_CADASTRADO';
        return next(error);
      }

      // Hashing da senha com Bcrypt (salt rounds 10)
      const senhaHash = await bcrypt.hash(senha, 10);

      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          telefone,
          perfil,
          consentimentoLGPD,
          fidelidade: {
            create: {
              saldoPontos: 0,
              consentimentoLGPD
            }
          }
        },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          criadoEm: true
        }
      });

      const token = jwt.sign(
        { id: novoUsuario.id, email: novoUsuario.email, perfil: novoUsuario.perfil, nome: novoUsuario.nome },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      await logAudit({
        usuarioId: novoUsuario.id,
        acao: 'USUARIO_CADASTRADO',
        recurso: '/auth/register',
        enderecoIp: req.ip
      });

      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso.',
        accessToken: token,
        tokenType: 'Bearer',
        user: novoUsuario
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      const usuario = await prisma.usuario.findUnique({ where: { email } });
      if (!usuario) {
        const error = new Error('E-mail ou senha inválidos.');
        error.statusCode = 401;
        error.code = 'CREDENCIAIS_INVALIDAS';
        return next(error);
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        const error = new Error('E-mail ou senha inválidos.');
        error.statusCode = 401;
        error.code = 'CREDENCIAIS_INVALIDAS';
        return next(error);
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, perfil: usuario.perfil, nome: usuario.nome },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      await logAudit({
        usuarioId: usuario.id,
        acao: 'LOGIN_SUCESSO',
        recurso: '/auth/login',
        enderecoIp: req.ip
      });

      return res.status(200).json({
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: 28800,
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'raizes_do_nordeste_jwt_super_seguro_uninter_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h'
};

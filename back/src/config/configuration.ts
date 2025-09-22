// .env.local 파일에서 환경 변수 로드
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'comaday',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' || true,
    ssl: process.env.DATABASE_SSL === 'true' || false,
    logging: ['error', 'query', 'schema'],
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION,
  },
}); 
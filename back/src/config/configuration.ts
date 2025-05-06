export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'comaday',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' || true,
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
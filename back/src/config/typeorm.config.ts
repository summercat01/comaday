import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get('database.host'),
    port: configService.get('database.port'),
    username: configService.get('database.username'),
    password: configService.get('database.password'),
    database: configService.get('database.database'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get('database.synchronize'),
    logging: ['error', 'query', 'schema'],
    ssl: configService.get('database.ssl', false),
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  };

  console.log('Database Configuration:', {
    host: config.host,
    port: config.port,
    username: config.username,
    database: config.database,
    synchronize: config.synchronize,
    logging: config.logging,
  });

  return config;
}; 
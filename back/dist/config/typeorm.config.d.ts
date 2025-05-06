import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
export declare const getTypeOrmConfig: (configService: ConfigService) => TypeOrmModuleOptions;

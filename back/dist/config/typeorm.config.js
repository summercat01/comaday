"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeOrmConfig = void 0;
const getTypeOrmConfig = (configService) => {
    const config = {
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: ['error', 'query', 'schema'],
        ssl: false,
        extra: {
            authPlugins: {
                mysql_native_password: () => () => Buffer.from([0])
            }
        },
        driver: require('mysql2')
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
exports.getTypeOrmConfig = getTypeOrmConfig;
//# sourceMappingURL=typeorm.config.js.map
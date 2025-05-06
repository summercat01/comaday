declare const _default: () => {
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        synchronize: true;
        logging: string[];
    };
    frontend: {
        url: string;
    };
    redis: {
        host: string;
        port: number;
    };
    jwt: {
        secret: string;
        expiration: string;
    };
};
export default _default;

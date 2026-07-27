import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: () => {
    const url = process.env.DATABASE_URL;
    if (url) {
      return {
        type: 'postgres' as const,
        url,
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      };
    }
    return {
      type: 'postgres' as const,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    };
  },
};

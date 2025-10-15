import { DataSource } from 'typeorm';

export default new DataSource({
  migrationsTableName: 'migrations',
  type: 'sqlite',
  database: './data/google-keep-clone.sqlite',
  synchronize: false,
  migrationsRun: true,
  logging: ['query', 'error', 'log'],
  entities: [process.env.DB_TYPEORM_ENTITIES || 'src/modules/**/*.entity.ts'],
  migrations: [process.env.DB_TYPEORM_MIGRATIONS || 'src/migrations/**/*.ts'],
  subscribers: [],
});

import 'reflect-metadata';
import { DataSource } from 'typeorm';
// import { SnakeNamingStrategy } from './snake-naming.strategy';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'chat_app',
  synchronize: true,
  migrations: ['src/migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
  // namingStrategy: new SnakeNamingStrategy(),
});

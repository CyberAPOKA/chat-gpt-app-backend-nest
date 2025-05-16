import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'chat_app',
  entities: [User, Chat, Message],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

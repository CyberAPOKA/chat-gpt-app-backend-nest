import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Chat } from '../src/chats/entities/chat.entity';
import { Message } from '../src/chats/entities/message.entity';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'chat_app',
  synchronize: true,
  entities: [User, Chat, Message],
});

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const chatRepo = AppDataSource.getRepository(Chat);
  const messageRepo = AppDataSource.getRepository(Message);

  const passwordHash = await bcrypt.hash('123123123', 10);

  const user = await userRepo.save({
    name: 'Christian',
    email: 'oficialsteffens@hotmail.com',
    password: passwordHash,
  });

  for (let i = 1; i <= 200; i++) {
    const chat = await chatRepo.save({
      title: `Chat de teste #${i}`,
      user,
    });

    const messages: Partial<Message>[] = [];

    for (let j = 1; j <= 10000; j++) {
      const role = j % 2 === 0 ? 'assistant' : 'user';
      messages.push({
        chat,
        role,
        content: `Mensagem ${j} do ${role}`,
      });
    }

    await messageRepo.save(messages);
    console.log(`Chat ${i} com 100 mensagens criado.`);
  }

  console.log('Seed concluída com sucesso.');
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('Erro na seed:', e);
  AppDataSource.destroy();
});

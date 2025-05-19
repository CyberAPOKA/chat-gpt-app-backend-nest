import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message])],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}

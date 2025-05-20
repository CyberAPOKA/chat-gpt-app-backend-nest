import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

@Injectable()
export class ChatsService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async createChat(userId: number, prompt: string) {
    const title = prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt;

    const chat = await this.chatRepo.save({
      user: { id: userId },
      title,
      messages: [],
    });

    chat.updatedAt = new Date();

    await this.saveUserMessage(chat, prompt);
    await this.generateAssistantResponse(chat, prompt);

    await this.chatRepo.update(chat.id, { updatedAt: new Date() });

    return chat;
  }

  private async saveUserMessage(chat: Chat, content: string) {
    const userMsg = this.messageRepo.create({
      chat,
      role: 'user',
      content,
    });
    await this.messageRepo.save(userMsg);
  }

  private async generateAssistantResponse(chat: Chat, prompt: string) {
    // const useOpenAI = this.configService.get<boolean>('USE_OPENAI');
    const useOpenAI = true;
    if (!useOpenAI) {
      const assistantMsg = this.messageRepo.create({
        chat,
        role: 'assistant',
        content:
          'Olá! Esta é uma resposta simulada do ChatGPT para desenvolvimento.',
      });
      await this.messageRepo.save(assistantMsg);
      return;
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    });

    console.log('Resposta bruta:', response.choices[0].message.content);

    console.log('Tokens usados:', response.usage);

    const assistantMsg = this.messageRepo.create({
      chat,
      role: 'assistant',
      content: response.choices[0].message.content || '[Resposta vazia]',
    });
    await this.messageRepo.save(assistantMsg);
  }

  async addMessageToChat(chatId: string, userId: number, prompt: string) {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId, user: { id: userId } },
    });

    if (!chat) throw new NotFoundException('Chat não encontrado');

    chat.updatedAt = new Date();

    await this.saveUserMessage(chat, prompt);
    await this.generateAssistantResponse(chat, prompt);

    await this.chatRepo.update(chat.id, { updatedAt: new Date() });

    return { success: true };
  }

  async getChatsByUser(userId: number, limit = 20, search?: string) {
    const cacheKey = `user-chats:${userId}:${limit}:${search || ''}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const query = this.chatRepo
      .createQueryBuilder('chat')
      .where('chat.userId = :userId', { userId })
      .orderBy('chat.updatedAt', 'DESC');

    if (search) {
      query.andWhere('LOWER(chat.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    query.limit(limit);
    const result = await query.getMany();

    await this.cacheManager.set(cacheKey, result, 60);
    return result;
  }

  async getChatMessages(chatId: string, userId: number, limit = 100) {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId, user: { id: userId } },
    });

    if (!chat) return { messages: [], title: '' };

    const messages = await this.messageRepo
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    const sorted = messages.reverse();

    return {
      title: chat.title,
      messages: sorted,
    };
  }

  async updateTitle(chatId: string, userId: number, newTitle: string) {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId, user: { id: userId } },
    });

    if (!chat) throw new NotFoundException('Chat não encontrado');

    chat.title = newTitle;
    chat.updatedAt = new Date();

    await this.chatRepo.save(chat);

    await this.cacheManager.del(`user-chats:${userId}:5:`);
    await this.cacheManager.del(`user-chats:${userId}:10:`);

    return { success: true };
  }

  async deleteChat(chatId: string, userId: number) {
    await this.chatRepo.delete({ id: chatId, user: { id: userId } });

    await this.cacheManager.del(`user-chats:${userId}:5:`);
    await this.cacheManager.del(`user-chats:${userId}:10:`);
  }
}

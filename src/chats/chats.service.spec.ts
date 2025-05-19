import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

const mockChatRepo = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  })),
});

const mockMessageRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  })),
});

describe('ChatsService', () => {
  let service: ChatsService;
  let chatRepo: ReturnType<typeof mockChatRepo>;
  let messageRepo: ReturnType<typeof mockMessageRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        { provide: getRepositoryToken(Chat), useFactory: mockChatRepo },
        { provide: getRepositoryToken(Message), useFactory: mockMessageRepo },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(false) },
        },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
    chatRepo = module.get(getRepositoryToken(Chat));
    messageRepo = module.get(getRepositoryToken(Message));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChat', () => {
    it('should create a chat and messages', async () => {
      chatRepo.save.mockResolvedValue({
        id: 'chat-id',
        user: { id: 1 },
        messages: [],
      });
      messageRepo.create.mockImplementation((data) => data);
      messageRepo.save.mockResolvedValue({});

      const result = await service.createChat(1, 'Animais que dão leite');

      expect(chatRepo.save).toHaveBeenCalled();
      expect(messageRepo.create).toHaveBeenCalledTimes(2);
      expect(messageRepo.save).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('id', 'chat-id');
    });
  });
});

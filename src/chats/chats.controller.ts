import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  Patch,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.chatsService.getChatsByUser(user.userId, limit, search);
  }

  @Get(':id')
  findMessages(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    return this.chatsService.getChatMessages(id, user.userId, limit);
  }

  @Post()
  create(@Body() body: { prompt: string }, @CurrentUser() user: any) {
    return this.chatsService.createChat(user.userId, body.prompt);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') chatId: string,
    @Req() req,
    @Body('prompt') prompt: string,
  ) {
    const userId = req.user.userId;
    return this.chatsService.addMessageToChat(chatId, userId, prompt);
  }

  @Patch(':id')
  async updateChatTitle(
    @Param('id') chatId: string,
    @Body('title') title: string,
    @CurrentUser() user: any,
  ) {
    return this.chatsService.updateTitle(chatId, user.userId, title);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatsService.deleteChat(id, user.userId);
  }
}

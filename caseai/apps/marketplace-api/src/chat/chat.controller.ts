import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ChatService } from './chat.service';

class CreateThreadDto {
  @IsOptional()
  @IsString()
  listing_id?: string;

  @IsOptional()
  @IsString()
  match_id?: string;
}

class PostMessageDto {
  @IsString()
  @IsNotEmpty()
  ciphertext!: string;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/threads')
  createThread(@Req() req: { user: { userId: string } }, @Body() dto: CreateThreadDto) {
    return this.chatService.createThread(req.user.userId, dto.listing_id, dto.match_id);
  }

  @Post('/threads/:id/messages')
  postMessage(
    @Param('id') threadId: string,
    @Req() req: { user: { userId: string } },
    @Body() dto: PostMessageDto
  ) {
    return this.chatService.postMessage(threadId, req.user.userId, dto.ciphertext);
  }

  @Get('/threads/:id/messages')
  getMessages(@Param('id') threadId: string, @Req() req: { user: { userId: string } }) {
    return this.chatService.getMessages(threadId, req.user.userId);
  }
}

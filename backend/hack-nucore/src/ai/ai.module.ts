import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AIConversationEntity } from './entities/ai-conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AIConversationEntity]),
  ],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}

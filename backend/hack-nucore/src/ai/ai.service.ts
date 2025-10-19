import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIConversationEntity, AssistantRole, MessageType } from './entities/ai-conversation.entity';
import { SendMessageDto, VoiceMessageDto, AIResponseDto } from './dto/ai.dto';
import axios from 'axios';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly lightragUrl = process.env.LIGHTRAG_URL || 'http://localhost:9621';
  private readonly whisperUrl = process.env.WHISPER_URL || 'http://localhost:8000';
  private readonly openaiApiKey = 'sk-roG3OusRr0TLCHAADks6lw';
  private readonly openaiBaseUrl = 'https://openai-hub.neuraldeep.tech';

  constructor(
    @InjectRepository(AIConversationEntity)
    private conversationRepository: Repository<AIConversationEntity>,
  ) {}

  async processTextMessage(userId: string, sendMessageDto: SendMessageDto): Promise<AIResponseDto> {
    try {
      // Сохраняем сообщение пользователя
      const userMessage = this.conversationRepository.create({
        userId,
        message: sendMessageDto.message,
        messageType: sendMessageDto.messageType || MessageType.TEXT,
        role: AssistantRole.USER,
        metadata: sendMessageDto.metadata,
      });
      await this.conversationRepository.save(userMessage);

      // Отправляем запрос в LightRAG
      const lightragResponse = await this.queryLightRAG(sendMessageDto.message);
      
      // Сохраняем ответ ассистента
      const assistantMessage = this.conversationRepository.create({
        userId,
        message: lightragResponse,
        messageType: MessageType.TEXT,
        role: AssistantRole.ASSISTANT,
      });
      await this.conversationRepository.save(assistantMessage);

      return {
        message: lightragResponse,
        role: AssistantRole.ASSISTANT,
      };
    } catch (error) {
      this.logger.error('Ошибка обработки текстового сообщения:', error);
      throw error;
    }
  }

  async processVoiceMessage(userId: string, voiceMessageDto: VoiceMessageDto): Promise<AIResponseDto> {
    try {
      // Преобразуем аудио в текст через Whisper
      const transcription = await this.transcribeAudio(voiceMessageDto.audioUrl);
      
      // Обрабатываем как текстовое сообщение
      const textMessageDto: SendMessageDto = {
        message: transcription,
        messageType: MessageType.VOICE,
        metadata: voiceMessageDto.metadata,
      };

      return this.processTextMessage(userId, textMessageDto);
    } catch (error) {
      this.logger.error('Ошибка обработки голосового сообщения:', error);
      throw error;
    }
  }


  private async queryLightRAG(query: string): Promise<string> {
    try {
      this.logger.log(`Отправляем запрос в LightRAG: ${query}`);
      
      const response = await axios.post(`${this.lightragUrl}/query`, {
        query: query
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      this.logger.log(`Ответ от LightRAG: ${JSON.stringify(response.data)}`);

      if (response.data.response && response.data.response !== "No relevant context found for the query.") {
        return response.data.response;
      }

      // Если LightRAG не нашел релевантный контекст, возвращаем сообщение об этом
      return "Извините, я не нашел релевантную информацию в базе знаний для вашего вопроса. Попробуйте переформулировать вопрос или обратитесь к специалисту банка.";
    } catch (error) {
      this.logger.error('Ошибка запроса к LightRAG:', error);
      return 'Извините, временно недоступен. Попробуйте позже.';
    }
  }



  private async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      this.logger.log(`Отправляем аудио на транскрибацию: ${audioUrl}`);
      
      // Используем ваш Whisper API
      const response = await axios.post(`${this.openaiBaseUrl}/v1/audio/transcriptions`, {
        model: 'whisper-1',
        file: audioUrl, // В реальной реализации здесь будет файл
        language: 'ru'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        timeout: 30000,
      });

      this.logger.log(`Ответ от Whisper: ${JSON.stringify(response.data)}`);

      if (response.data.text) {
        return response.data.text;
      }

      return 'Не удалось распознать речь';
    } catch (error) {
      this.logger.error('Ошибка распознавания речи:', error);
      return 'Не удалось распознать речь';
    }
  }

  async getConversationHistory(userId: string, limit: number = 50): Promise<AIConversationEntity[]> {
    return this.conversationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async clearConversationHistory(userId: string): Promise<void> {
    await this.conversationRepository.delete({ userId });
  }
}

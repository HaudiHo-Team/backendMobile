import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity, ChatMessageEntity, ChatParticipantEntity, ChatType, MessageType } from './entities/chat.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateChatDto, SendMessageDto, JoinChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatEntity)
    private chatRepository: Repository<ChatEntity>,
    @InjectRepository(ChatMessageEntity)
    private messageRepository: Repository<ChatMessageEntity>,
    @InjectRepository(ChatParticipantEntity)
    private participantRepository: Repository<ChatParticipantEntity>,
  ) {}

  async createChat(createChatDto: CreateChatDto, userId: string) {
    const { type, title, description } = createChatDto;

    const chat = this.chatRepository.create({
      type,
      title: title || (type === ChatType.SUPPORT ? 'Поддержка' : 'Новый чат'),
      description,
    });

    const savedChat = await this.chatRepository.save(chat);

    // Добавляем создателя как участника
    await this.addParticipant(savedChat.id, userId, true);

    return savedChat;
  }

  async getUserChats(userId: string) {
    return this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('participants.userId = :userId', { userId })
      .andWhere('participants.isActive = :isActive', { isActive: true })
      .orderBy('chat.updatedAt', 'DESC')
      .getMany();
  }

  async getChatById(chatId: string, userId: string) {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('chat.id = :chatId', { chatId })
      .getOne();

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    // Проверяем, является ли пользователь участником чата
    const isParticipant = await this.participantRepository.findOne({
      where: { chatId, userId, isActive: true },
    });

    if (!isParticipant) {
      throw new ForbiddenException('У вас нет доступа к этому чату');
    }

    return chat;
  }

  async joinChat(joinChatDto: JoinChatDto, userId: string) {
    const { chatId } = joinChatDto;

    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    // Проверяем, не является ли пользователь уже участником
    const existingParticipant = await this.participantRepository.findOne({
      where: { chatId, userId },
    });

    if (existingParticipant) {
      if (existingParticipant.isActive) {
        throw new ForbiddenException('Вы уже являетесь участником этого чата');
      } else {
        // Активируем существующего участника
        existingParticipant.isActive = true;
        return this.participantRepository.save(existingParticipant);
      }
    }

    // Добавляем нового участника
    return this.addParticipant(chatId, userId, false);
  }

  async sendMessage(sendMessageDto: SendMessageDto, userId: string) {
    const { chatId, type, content, fileName, fileUrl, replyToId } = sendMessageDto;

    // Проверяем, является ли пользователь участником чата
    const participant = await this.participantRepository.findOne({
      where: { chatId, userId, isActive: true },
    });

    if (!participant) {
      throw new ForbiddenException('У вас нет доступа к этому чату');
    }

    const message = this.messageRepository.create({
      chatId,
      userId,
      type,
      content,
      fileName,
      fileUrl,
      replyToId,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Обновляем время последнего обновления чата
    await this.chatRepository.update(chatId, { updatedAt: new Date() });

    return savedMessage;
  }

  async getChatMessages(chatId: string, userId: string, limit: number = 50, offset: number = 0) {
    // Простая проверка доступа к чату
    const participant = await this.participantRepository.findOne({
      where: { chatId, userId, isActive: true },
    });

    if (!participant) {
      throw new ForbiddenException('У вас нет доступа к этому чату');
    }

    // Простой запрос без сложных join'ов
    const messages = await this.messageRepository.find({
      where: { chatId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return messages;
  }

  async markMessageAsRead(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['chat'],
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    // Проверяем доступ к чату
    await this.getChatById(message.chatId, userId);

    message.isRead = true;
    return this.messageRepository.save(message);
  }

  async getUnreadMessagesCount(userId: string) {
    return this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.chat', 'chat')
      .leftJoin('chat.participants', 'participants')
      .where('participants.userId = :userId', { userId })
      .andWhere('participants.isActive = :isActive', { isActive: true })
      .andWhere('message.userId != :userId', { userId })
      .andWhere('message.isRead = :isRead', { isRead: false })
      .getCount();
  }

  async createSupportChat(userId: string) {
    // Проверяем, есть ли уже активный чат поддержки у пользователя
    const existingChat = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoin('chat.participants', 'participants')
      .where('chat.type = :type', { type: ChatType.SUPPORT })
      .andWhere('participants.userId = :userId', { userId })
      .andWhere('participants.isActive = :isActive', { isActive: true })
      .getOne();

    if (existingChat) {
      return existingChat;
    }

    return this.createChat({ type: ChatType.SUPPORT }, userId);
  }

  private async addParticipant(chatId: string, userId: string, isAdmin: boolean = false) {
    const participant = this.participantRepository.create({
      chatId,
      userId,
      isAdmin,
      isActive: true,
    });

    return this.participantRepository.save(participant);
  }

  async getChatMessagesSimple(chatId: string, userId: string) {
    // Простая проверка доступа к чату
    const participant = await this.participantRepository.findOne({
      where: { chatId, userId, isActive: true },
    });

    if (!participant) {
      throw new ForbiddenException('У вас нет доступа к этому чату');
    }

    // Самый простой запрос
    return this.messageRepository.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });
  }
}

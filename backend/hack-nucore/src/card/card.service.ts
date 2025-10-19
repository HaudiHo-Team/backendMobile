import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity, CardType, CardStatus } from './entities/card.entity';
import { UserEntity } from '../user/entities/user.entity';

export interface CreateCardDto {
  type: CardType;
  holderName: string;
  expiryDate: string;
  bankName?: string;
  cardDesign?: string;
}

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
  ) {}

  async createCard(createCardDto: CreateCardDto, userId: string) {
    const { type, holderName, expiryDate, bankName, cardDesign } = createCardDto;

    // Генерируем номер карты
    const cardNumber = this.generateCardNumber();
    const maskedNumber = this.maskCardNumber(cardNumber);

    const card = this.cardRepository.create({
      cardNumber,
      maskedNumber,
      type,
      holderName,
      expiryDate,
      bankName: bankName || 'HackNU Bank',
      cardDesign,
      userId,
      status: CardStatus.PENDING,
    });

    return this.cardRepository.save(card);
  }

  async getUserCards(userId: string): Promise<CardEntity[]> {
    return this.cardRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCardById(cardId: string, userId: string): Promise<CardEntity> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Карта не найдена');
    }

    return card;
  }

  async activateCard(cardId: string, userId: string) {
    const card = await this.getCardById(cardId, userId);
    
    if (card.status !== CardStatus.PENDING) {
      throw new BadRequestException('Карта уже активирована или заблокирована');
    }

    card.status = CardStatus.ACTIVE;
    return this.cardRepository.save(card);
  }

  async blockCard(cardId: string, userId: string) {
    const card = await this.getCardById(cardId, userId);
    
    if (card.status === CardStatus.BLOCKED) {
      throw new BadRequestException('Карта уже заблокирована');
    }

    card.status = CardStatus.BLOCKED;
    return this.cardRepository.save(card);
  }

  async setDefaultCard(cardId: string, userId: string) {
    const card = await this.getCardById(cardId, userId);
    
    // Снимаем флаг "по умолчанию" с других карт пользователя
    await this.cardRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );

    // Устанавливаем текущую карту как карту по умолчанию
    card.isDefault = true;
    return this.cardRepository.save(card);
  }

  private generateCardNumber(): string {
    // Генерируем номер карты в формате 4 группы по 4 цифры
    const groups: string[] = [];
    for (let i = 0; i < 4; i++) {
      groups.push(Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
    }
    return groups.join(' ');
  }

  private maskCardNumber(cardNumber: string): string {
    // Маскируем номер карты, оставляя только последние 4 цифры
    const cleanNumber = cardNumber.replace(/\s/g, '');
    const lastFour = cleanNumber.slice(-4);
    return `**** **** **** ${lastFour}`;
  }
}

import { IsEnum, IsString, IsDateString, IsOptional } from 'class-validator';
import { CardType } from '../entities/card.entity';

export class CreateCardDto {
  @IsEnum(CardType)
  type: CardType;

  @IsString()
  holderName: string;

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  cardDesign?: string;
}

import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';

@Controller('cards')
@UseGuards(AuthGuard('jwt'))
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  async createCard(@Body() createCardDto: CreateCardDto, @Request() req) {
    return this.cardService.createCard(createCardDto, req.user.id);
  }

  @Get()
  async getUserCards(@Request() req) {
    return this.cardService.getUserCards(req.user.id);
  }

  @Get(':id')
  async getCardById(@Param('id') cardId: string, @Request() req) {
    return this.cardService.getCardById(cardId, req.user.id);
  }

  @Patch(':id/activate')
  async activateCard(@Param('id') cardId: string, @Request() req) {
    return this.cardService.activateCard(cardId, req.user.id);
  }

  @Patch(':id/block')
  async blockCard(@Param('id') cardId: string, @Request() req) {
    return this.cardService.blockCard(cardId, req.user.id);
  }

  @Patch(':id/default')
  async setDefaultCard(@Param('id') cardId: string, @Request() req) {
    return this.cardService.setDefaultCard(cardId, req.user.id);
  }
}

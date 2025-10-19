import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto, AddToGoalDto } from './dto/goal.dto';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  async createGoal(@Request() req, @Body() createGoalDto: CreateGoalDto) {
    return await this.goalsService.createGoal(req.user.id, createGoalDto);
  }

  @Get()
  async getGoals(@Request() req) {
    return await this.goalsService.getGoals(req.user.id);
  }

  @Get('progress')
  async getGoalProgress(@Request() req) {
    return await this.goalsService.getGoalProgress(req.user.id);
  }

  @Get(':id')
  async getGoalById(@Request() req, @Param('id') id: string) {
    return await this.goalsService.getGoalById(id, req.user.id);
  }

  @Put(':id')
  async updateGoal(
    @Request() req,
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return await this.goalsService.updateGoal(id, req.user.id, updateGoalDto);
  }

  @Post(':id/add')
  async addToGoal(
    @Request() req,
    @Param('id') id: string,
    @Body() addToGoalDto: AddToGoalDto,
  ) {
    console.log('🎯 GoalsController: Добавление денег к цели');
    console.log('📊 Goal ID:', id);
    console.log('👤 User ID:', req.user.id);
    console.log('💰 Amount:', addToGoalDto.amount, 'Type:', typeof addToGoalDto.amount);
    
    const result = await this.goalsService.addToGoal(id, req.user.id, addToGoalDto);
    
    console.log('✅ GoalsController: Результат:', {
      id: result.id,
      title: result.title,
      currentAmount: result.currentAmount,
      targetAmount: result.targetAmount,
      status: result.status
    });
    
    return result;
  }

  @Delete(':id')
  async deleteGoal(@Request() req, @Param('id') id: string) {
    await this.goalsService.deleteGoal(id, req.user.id);
    return { message: 'Цель успешно удалена' };
  }
}

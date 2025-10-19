import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoalEntity, GoalStatus } from './entities/goal.entity';
import { CreateGoalDto, UpdateGoalDto, AddToGoalDto } from './dto/goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(GoalEntity)
    private goalsRepository: Repository<GoalEntity>,
  ) {}

  async createGoal(userId: string, createGoalDto: CreateGoalDto): Promise<GoalEntity> {
    const goal = this.goalsRepository.create({
      ...createGoalDto,
      userId,
      targetDate: new Date(createGoalDto.targetDate),
      // Округляем целевую сумму до целого числа
      targetAmount: Math.round(createGoalDto.targetAmount),
      // currentAmount всегда начинается с 0 (как число)
      currentAmount: 0,
    });

    return await this.goalsRepository.save(goal);
  }

  async getGoals(userId: string): Promise<GoalEntity[]> {
    return await this.goalsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getGoalById(id: string, userId: string): Promise<GoalEntity> {
    const goal = await this.goalsRepository.findOne({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Цель не найдена');
    }

    return goal;
  }

  async updateGoal(id: string, userId: string, updateGoalDto: UpdateGoalDto): Promise<GoalEntity> {
    const goal = await this.getGoalById(id, userId);

    if (updateGoalDto.targetDate) {
      updateGoalDto.targetDate = new Date(updateGoalDto.targetDate) as any;
    }

    // Округляем суммы до целых чисел
    if (updateGoalDto.targetAmount !== undefined) {
      updateGoalDto.targetAmount = Math.round(updateGoalDto.targetAmount);
    }
    if (updateGoalDto.currentAmount !== undefined) {
      // Преобразуем в число, если это строка
      const currentAmountAsNumber = typeof updateGoalDto.currentAmount === 'string' 
        ? parseFloat(updateGoalDto.currentAmount) 
        : updateGoalDto.currentAmount;
      updateGoalDto.currentAmount = Math.round(currentAmountAsNumber);
    }

    Object.assign(goal, updateGoalDto);
    return await this.goalsRepository.save(goal);
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    const goal = await this.getGoalById(id, userId);
    await this.goalsRepository.remove(goal);
  }

  async addToGoal(id: string, userId: string, addToGoalDto: AddToGoalDto): Promise<GoalEntity> {
    console.log('🎯 GoalsService: Начинаем добавление денег к цели');
    console.log('📊 Goal ID:', id);
    console.log('👤 User ID:', userId);
    console.log('💰 Amount DTO:', addToGoalDto);
    
    const goal = await this.getGoalById(id, userId);
    console.log('📈 Найденная цель:', {
      id: goal.id,
      title: goal.title,
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
      status: goal.status
    });

    if (goal.status !== GoalStatus.ACTIVE) {
      throw new BadRequestException('Нельзя добавить средства к неактивной цели');
    }

    const oldAmount = goal.currentAmount;
    // Округляем до целых чисел для избежания проблем с плавающей точкой
    const roundedAmount = Math.round(addToGoalDto.amount);
    // Преобразуем currentAmount в число, если это строка
    const currentAmountAsNumber = typeof goal.currentAmount === 'string' 
      ? parseFloat(goal.currentAmount) 
      : goal.currentAmount;
    goal.currentAmount = Math.round(currentAmountAsNumber + roundedAmount);
    
    console.log('🔄 Обновление суммы:', {
      oldAmount: oldAmount,
      oldAmountType: typeof oldAmount,
      addedAmount: addToGoalDto.amount,
      roundedAmount: roundedAmount,
      currentAmountAsNumber: currentAmountAsNumber,
      newAmount: goal.currentAmount
    });

    // Проверяем, достигнута ли цель
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = GoalStatus.COMPLETED;
      console.log('🎉 Цель достигнута! Статус изменен на COMPLETED');
    }

    const savedGoal = await this.goalsRepository.save(goal);
    console.log('💾 Сохраненная цель:', {
      id: savedGoal.id,
      title: savedGoal.title,
      currentAmount: savedGoal.currentAmount,
      targetAmount: savedGoal.targetAmount,
      status: savedGoal.status
    });

    return savedGoal;
  }

  async getGoalProgress(userId: string): Promise<{
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    overallProgress: number;
  }> {
    const goals = await this.getGoals(userId);

    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
    const activeGoals = goals.filter(g => g.status === GoalStatus.ACTIVE).length;
    
    const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    return {
      totalGoals,
      completedGoals,
      activeGoals,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress,
    };
  }
}

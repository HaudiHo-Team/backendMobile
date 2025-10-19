import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccountEntity, AccountType } from '../account/entities/account.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, name, password, phone } = registerDto;

    // Проверяем, существует ли пользователь
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      phone,
    });

    const savedUser = await this.userRepository.save(user);

    // Создаем основной счет для пользователя
    await this.createMainAccount(savedUser.id);

    // Создаем сберегательный счет
    await this.createSavingsAccount(savedUser.id);

    // Генерируем токен
    const token = this.jwtService.sign({ 
      sub: savedUser.id, 
      email: savedUser.email 
    });

    return {
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        avatar: savedUser.avatar,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Находим пользователя
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Проверяем активность пользователя
    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Генерируем токен
    const token = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email 
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async validateUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Пользователь не найден или неактивен');
    }
    return user;
  }

  private async createMainAccount(userId: string) {
    const accountNumber = this.generateAccountNumber();
    
    const account = this.accountRepository.create({
      accountNumber,
      type: AccountType.MAIN,
      balance: 0,
      availableBalance: 0,
      currency: 'KZT',
      userId,
    });

    return this.accountRepository.save(account);
  }

  private async createSavingsAccount(userId: string) {
    const accountNumber = this.generateAccountNumber();
    
    const account = this.accountRepository.create({
      accountNumber,
      type: AccountType.SAVINGS,
      balance: 0,
      availableBalance: 0,
      currency: 'KZT',
      userId,
    });

    return this.accountRepository.save(account);
  }

  private generateAccountNumber(): string {
    // Генерируем номер счета в формате KZ + 20 цифр
    const randomDigits = Math.floor(Math.random() * 10000000000000000000).toString().padStart(20, '0');
    return `KZ${randomDigits}`;
  }
}

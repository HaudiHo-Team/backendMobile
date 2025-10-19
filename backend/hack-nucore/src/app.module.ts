import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { CardModule } from './card/card.module';
import { GoalsModule } from './goals/goals.module';
import { ChatModule } from './chat/chat.module';
import { AIModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    AccountModule,
    TransactionModule,
    CardModule,
    GoalsModule,
    ChatModule,
    AIModule,
  ],
})
export class AppModule {}

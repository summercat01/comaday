import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransactionLimitService } from './coins/services/transaction-limit.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe());
  
  // 기본 거래 제한 설정 생성
  const transactionLimitService = app.get(TransactionLimitService);
  await transactionLimitService.createDefaultLimits();
  
  await app.listen(process.env.PORT || 4000);
  console.log(`🚀 코마데이 서버가 포트 ${process.env.PORT || 4000}에서 실행 중입니다.`);
  console.log(`📊 연속 거래 제한 시스템이 활성화되었습니다.`);
}
bootstrap(); 
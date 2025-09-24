import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// TransactionLimitService 제거 (방 제한만 사용)
import { RoomsService } from './rooms/rooms.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { CustomValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:3000',           // 로컬 개발용
      'https://comaday.duckdns.org',     // 프로덕션 도메인
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // 글로벌 프리픽스 설정
  app.setGlobalPrefix('api');
  
  // 글로벌 예외 필터 등록
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // 커스텀 Validation Pipe 등록  
  app.useGlobalPipes(new CustomValidationPipe());
  
  // 글로벌 거래 제한 제거됨 (방 제한만 사용)
  
  // 오프라인 방에 대응하는 10개의 온라인 룸 미리 생성
  const roomsService = app.get(RoomsService);
  await roomsService.createDefaultRooms();
  
  await app.listen(process.env.PORT || 4000);
  console.log(`🚀 코마데이 서버가 포트 ${process.env.PORT || 4000}에서 실행 중입니다.`);
  console.log(`🏠 방 기반 거래 제한 시스템이 활성화되었습니다.`);
  console.log(`🏠 오프라인 11개 방에 대응하는 온라인 룸이 준비되었습니다.`);
}
bootstrap(); 
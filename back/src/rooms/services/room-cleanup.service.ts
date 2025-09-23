import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoomsService } from '../rooms.service';

@Injectable()
export class RoomCleanupService {
  private readonly logger = new Logger(RoomCleanupService.name);

  constructor(private readonly roomsService: RoomsService) {}

  /**
   * 매 30초마다 비활성 멤버들을 자동 퇴장시킴
   * 하트비트가 2분 이상 없는 멤버들을 제거
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleInactiveMemberCleanup() {
    try {
      const removedCount = await this.roomsService.removeInactiveMembers(2); // 2분 타임아웃
      
      if (removedCount > 0) {
        this.logger.log(`🧹 자동 정리: ${removedCount}명의 비활성 멤버를 퇴장시켰습니다.`);
      }
    } catch (error) {
      this.logger.error('비활성 멤버 정리 중 오류 발생:', error);
    }
  }

  /**
   * 매 1분마다 하트비트 상태 로깅 (디버깅용)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async logHeartbeatStatus() {
    // 선택적으로 활성화할 수 있는 로깅
    // this.logger.debug('💓 하트비트 상태 확인 중...');
  }
}

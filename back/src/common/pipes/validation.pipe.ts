import { 
  ValidationPipe as NestValidationPipe, 
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/error-messages';

/**
 * 커스텀 Validation Pipe
 * 한글 에러 메시지로 변환
 */
export class CustomValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성이 있으면 에러
      transform: true, // 자동 타입 변환
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[]) => {
        return new BadRequestException({
          statusCode: 400,
          message: this.formatValidationErrors(validationErrors),
          error: 'Validation Failed',
        });
      },
    });
  }

  private formatValidationErrors(errors: ValidationError[]): string {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        for (const constraint of Object.values(error.constraints)) {
          messages.push(this.translateConstraintMessage(error.property, constraint));
        }
      }

      // 중첩된 에러 처리
      if (error.children && error.children.length > 0) {
        messages.push(...this.formatValidationErrors(error.children).split(', '));
      }
    }

    return messages.length > 0 ? messages.join(', ') : ERROR_MESSAGES.COMMON.VALIDATION_FAILED;
  }

  private translateConstraintMessage(property: string, constraint: string): string {
    // 필드명 한글 매핑
    const fieldNameMap: { [key: string]: string } = {
      username: '사용자명',
      password: '비밀번호',
      email: '이메일',
      amount: '금액',
      senderId: '발송자 ID',
      receiverId: '수신자 ID',
      roomCode: '방 코드',
      roomName: '방 이름',
      name: '이름',
      description: '설명',
      maxMembers: '최대 인원',
      userId: '사용자 ID',
      hostUserId: '방장 ID',
      transfers: '거래 목록',
      page: '페이지',
      limit: '제한 수',
    };

    const fieldName = fieldNameMap[property] || property;

    // 제약 조건별 한글 메시지 매핑
    if (constraint.includes('must be a number')) {
      return `${fieldName}은(는) 숫자여야 합니다.`;
    }
    if (constraint.includes('must be a string')) {
      return `${fieldName}은(는) 문자열이어야 합니다.`;
    }
    if (constraint.includes('should not be empty')) {
      return `${fieldName}은(는) 필수 입력 항목입니다.`;
    }
    if (constraint.includes('must be defined')) {
      return `${fieldName}은(는) 필수 입력 항목입니다.`;
    }
    if (constraint.includes('must not be less than')) {
      const match = constraint.match(/must not be less than (\d+)/);
      const minValue = match ? match[1] : '0';
      return `${fieldName}은(는) ${minValue} 이상이어야 합니다.`;
    }
    if (constraint.includes('must not be greater than')) {
      const match = constraint.match(/must not be greater than (\d+)/);
      const maxValue = match ? match[1] : '최대값';
      return `${fieldName}은(는) ${maxValue} 이하여야 합니다.`;
    }
    if (constraint.includes('must be longer than or equal to')) {
      const match = constraint.match(/must be longer than or equal to (\d+)/);
      const minLength = match ? match[1] : '최소';
      return `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.`;
    }
    if (constraint.includes('must be shorter than or equal to')) {
      const match = constraint.match(/must be shorter than or equal to (\d+)/);
      const maxLength = match ? match[1] : '최대';
      return `${fieldName}은(는) 최대 ${maxLength}자 이하여야 합니다.`;
    }
    if (constraint.includes('must be an email')) {
      return `${fieldName}은(는) 올바른 이메일 형식이어야 합니다.`;
    }
    if (constraint.includes('must be an array')) {
      return `${fieldName}은(는) 배열 형태여야 합니다.`;
    }
    if (constraint.includes('must be a boolean')) {
      return `${fieldName}은(는) true 또는 false여야 합니다.`;
    }
    if (constraint.includes('must be a date')) {
      return `${fieldName}은(는) 유효한 날짜 형식이어야 합니다.`;
    }
    if (constraint.includes('must be a uuid')) {
      return `${fieldName}은(는) 유효한 UUID 형식이어야 합니다.`;
    }
    if (constraint.includes('must be a url')) {
      return `${fieldName}은(는) 유효한 URL 형식이어야 합니다.`;
    }
    if (constraint.includes('must match')) {
      return `${fieldName}은(는) 올바른 형식이 아닙니다.`;
    }
    if (constraint.includes('property') && constraint.includes('should not exist')) {
      return `${fieldName}은(는) 허용되지 않는 속성입니다.`;
    }

    // 기본 메시지
    return `${fieldName}: ${constraint}`;
  }
}

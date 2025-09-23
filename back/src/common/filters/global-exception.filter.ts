import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ERROR_CODE_MESSAGES, ERROR_MESSAGES } from '../constants/error-messages';
import { BaseCustomException } from '../exceptions/custom.exceptions';

export interface ErrorResponse {
  success: false;
  statusCode: number;
  errorCode: string;
  errorType: string;
  message: string;
  timestamp: string;
  path: string;
  method: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const errorResponse = this.buildErrorResponse(exception, request);
    
    // 에러 로깅
    this.logError(exception, request, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: any): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    // BaseCustomException (우리가 만든 커스텀 예외들)
    if (exception instanceof BaseCustomException) {
      return {
        success: false,
        statusCode: exception.getStatus(),
        errorCode: exception.errorCode,
        errorType: exception.errorType,
        message: exception.message,
        timestamp,
        path,
        method,
      };
    }

    // NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      let message: string;
      let details: any;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || ERROR_CODE_MESSAGES[status] || ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR;
        details = responseObj.details;
        
        // 배열 형태의 validation 에러 메시지 처리
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
        }
      } else {
        message = ERROR_CODE_MESSAGES[status] || ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR;
      }

      return {
        success: false,
        statusCode: status,
        errorCode: `HTTP_${status}`,
        errorType: this.getErrorTypeByStatus(status),
        message,
        timestamp,
        path,
        method,
        details,
      };
    }

    // TypeORM 에러 처리
    if (this.isTypeOrmError(exception)) {
      return this.handleTypeOrmError(exception, timestamp, path, method);
    }

    // 알 수 없는 에러
    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'UNKNOWN_ERROR',
      errorType: 'SYSTEM',
      message: ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      method,
    };
  }

  private getErrorTypeByStatus(status: number): string {
    switch (status) {
      case 400:
        return 'VALIDATION';
      case 401:
        return 'AUTHENTICATION';
      case 403:
        return 'AUTHORIZATION';
      case 404:
        return 'BUSINESS_LOGIC';
      case 409:
        return 'BUSINESS_LOGIC';
      case 422:
        return 'VALIDATION';
      case 500:
        return 'SYSTEM';
      default:
        return 'SYSTEM';
    }
  }

  private isTypeOrmError(exception: unknown): boolean {
    if (!exception || typeof exception !== 'object') return false;
    
    const error = exception as any;
    return (
      error.name === 'QueryFailedError' ||
      error.name === 'EntityNotFoundError' ||
      error.name === 'OptimisticLockVersionMismatchError' ||
      error.name === 'PessimisticLockTransactionRequiredError' ||
      error.name === 'LockNotSupportedOnGivenDriverError' ||
      error.code // PostgreSQL 에러 코드
    );
  }

  private handleTypeOrmError(exception: any, timestamp: string, path: string, method: string): ErrorResponse {
    let message: string = ERROR_MESSAGES.COMMON.DATABASE_ERROR;
    let errorCode = 'DB_UNKNOWN';

    // PostgreSQL 에러 코드별 처리
    switch (exception.code) {
      case '23505': // unique_violation
        message = '이미 존재하는 데이터입니다.';
        errorCode = 'DB_UNIQUE_VIOLATION';
        break;
      case '23502': // not_null_violation
        message = '필수 데이터가 누락되었습니다.';
        errorCode = 'DB_NOT_NULL_VIOLATION';
        break;
      case '23503': // foreign_key_violation
        message = '관련된 데이터가 존재하지 않습니다.';
        errorCode = 'DB_FOREIGN_KEY_VIOLATION';
        break;
      case '23514': // check_violation
        message = '데이터 제약 조건을 위반했습니다.';
        errorCode = 'DB_CHECK_VIOLATION';
        break;
      case '42P01': // undefined_table
        message = '테이블을 찾을 수 없습니다.';
        errorCode = 'DB_TABLE_NOT_FOUND';
        break;
      case '42703': // undefined_column
        message = '컬럼을 찾을 수 없습니다.';
        errorCode = 'DB_COLUMN_NOT_FOUND';
        break;
      default:
        if (exception.name === 'EntityNotFoundError') {
          message = '요청한 데이터를 찾을 수 없습니다.';
          errorCode = 'DB_ENTITY_NOT_FOUND';
        }
        break;
    }

    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode,
      errorType: 'DATABASE',
      message,
      timestamp,
      path,
      method,
    };
  }

  private logError(exception: unknown, request: any, errorResponse: ErrorResponse): void {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    
    const logContext = {
      timestamp: errorResponse.timestamp,
      method,
      url,
      ip,
      userAgent,
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.errorCode,
      errorType: errorResponse.errorType,
      message: errorResponse.message,
    };

    // 에러 레벨별 로깅
    if (errorResponse.statusCode >= 500) {
      // 서버 에러는 스택 트레이스와 함께 에러 레벨로
      this.logger.error(
        `서버 에러 발생: ${errorResponse.message}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
        JSON.stringify(logContext, null, 2),
      );
    } else if (errorResponse.statusCode >= 400) {
      // 클라이언트 에러는 경고 레벨로
      this.logger.warn(
        `클라이언트 에러: ${errorResponse.message}`,
        JSON.stringify(logContext, null, 2),
      );
    } else {
      // 기타 경우는 디버그 레벨로
      this.logger.debug(
        `에러 발생: ${errorResponse.message}`,
        JSON.stringify(logContext, null, 2),
      );
    }
  }
}

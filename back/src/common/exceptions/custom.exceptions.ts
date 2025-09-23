import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES, ERROR_TYPES } from '../constants/error-messages';

/**
 * 기본 커스텀 예외 클래스
 */
export class BaseCustomException extends HttpException {
  public readonly errorType: string;
  public readonly errorCode: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: HttpStatus,
    errorType: string = ERROR_TYPES.SYSTEM,
    errorCode?: string,
  ) {
    super(
      {
        statusCode,
        message,
        errorType,
        errorCode: errorCode || statusCode.toString(),
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
    
    this.errorType = errorType;
    this.errorCode = errorCode || statusCode.toString();
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 인증 관련 예외
 */
export class AuthenticationException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS) {
    super(message, HttpStatus.UNAUTHORIZED, ERROR_TYPES.AUTHENTICATION, 'AUTH_001');
  }
}

export class InvalidCredentialsException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS) {
    super(message, HttpStatus.UNAUTHORIZED, ERROR_TYPES.AUTHENTICATION, 'AUTH_002');
  }
}

export class TokenExpiredException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.AUTH.TOKEN_EXPIRED) {
    super(message, HttpStatus.UNAUTHORIZED, ERROR_TYPES.AUTHENTICATION, 'AUTH_003');
  }
}

/**
 * 사용자 관련 예외
 */
export class UserNotFoundException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.USER.NOT_FOUND) {
    super(message, HttpStatus.NOT_FOUND, ERROR_TYPES.BUSINESS_LOGIC, 'USER_001');
  }
}

export class UsernameAlreadyExistsException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.USER.USERNAME_ALREADY_EXISTS) {
    super(message, HttpStatus.CONFLICT, ERROR_TYPES.BUSINESS_LOGIC, 'USER_002');
  }
}

export class UserRegistrationFailedException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.USER.REGISTRATION_FAILED) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, ERROR_TYPES.SYSTEM, 'USER_003');
  }
}

export class InvalidUserDataException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.USER.USERNAME_AND_PASSWORD_REQUIRED) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.VALIDATION, 'USER_004');
  }
}

/**
 * 코인/거래 관련 예외
 */
export class InsufficientBalanceException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COIN.INSUFFICIENT_BALANCE) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'COIN_001');
  }
}

export class InvalidTransferAmountException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COIN.INVALID_AMOUNT) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.VALIDATION, 'COIN_002');
  }
}

export class TransactionLimitExceededException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COIN.TRANSACTION_LIMIT_EXCEEDED) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'COIN_003');
  }
}

export class ConsecutiveTransactionLimitException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COIN.CONSECUTIVE_TRANSACTION_LIMIT) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'COIN_004');
  }
}

export class RoomTransactionLimitException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COIN.ROOM_TRANSACTION_LIMIT) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'COIN_005');
  }
}

export class SameUserTransferException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COIN.SAME_USER_TRANSFER) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'COIN_006');
  }
}

export class BulkTransferFailedException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COIN.BULK_TRANSFER_FAILED) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'COIN_007');
  }
}

/**
 * 방 관련 예외
 */
export class RoomNotFoundException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.NOT_FOUND) {
    super(message, HttpStatus.NOT_FOUND, ERROR_TYPES.BUSINESS_LOGIC, 'ROOM_001');
  }
}

export class RoomFullException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.ROOM_FULL) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'ROOM_002');
  }
}

export class RoomClosedException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.ROOM_CLOSED) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'ROOM_003');
  }
}

export class RoomNotActiveException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.ROOM_NOT_ACTIVE) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'ROOM_004');
  }
}

export class AlreadyJoinedRoomException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.ALREADY_JOINED) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'ROOM_005');
  }
}

export class NotRoomMemberException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.NOT_MEMBER) {
    super(message, HttpStatus.FORBIDDEN, ERROR_TYPES.AUTHORIZATION, 'ROOM_006');
  }
}

export class RoomMemberNotFoundException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.MEMBER_NOT_FOUND) {
    super(message, HttpStatus.NOT_FOUND, ERROR_TYPES.BUSINESS_LOGIC, 'ROOM_007');
  }
}

export class HostOnlyException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.HOST_ONLY) {
    super(message, HttpStatus.FORBIDDEN, ERROR_TYPES.AUTHORIZATION, 'ROOM_008');
  }
}

export class MemberOnlyException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.MEMBER_ONLY) {
    super(message, HttpStatus.FORBIDDEN, ERROR_TYPES.AUTHORIZATION, 'ROOM_009');
  }
}

export class CannotCloseSystemRoomException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.CANNOT_CLOSE_SYSTEM_ROOM) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'ROOM_010');
  }
}

export class RoomDescriptionRequiredException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.DESCRIPTION_REQUIRED) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.VALIDATION, 'ROOM_011');
  }
}

export class ActiveRoomOnlyException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.ROOM.ACTIVE_ROOM_ONLY) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.BUSINESS_LOGIC, 'ROOM_012');
  }
}

/**
 * 거래 제한 관련 예외
 */
export class TransactionLimitNotFoundException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.TRANSACTION_LIMIT.NOT_FOUND) {
    super(message, HttpStatus.NOT_FOUND, ERROR_TYPES.BUSINESS_LOGIC, 'LIMIT_001');
  }
}

export class TransactionLimitUpdateFailedException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.TRANSACTION_LIMIT.UPDATE_FAILED) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, ERROR_TYPES.SYSTEM, 'LIMIT_002');
  }
}

/**
 * 랭킹 관련 예외
 */
export class RankingNotFoundException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.RANKING.NOT_FOUND) {
    super(message, HttpStatus.NOT_FOUND, ERROR_TYPES.BUSINESS_LOGIC, 'RANK_001');
  }
}

export class RankingUpdateFailedException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.RANKING.UPDATE_FAILED) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, ERROR_TYPES.SYSTEM, 'RANK_002');
  }
}

/**
 * 검증 관련 예외
 */
export class ValidationException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COMMON.VALIDATION_FAILED) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.VALIDATION, 'VALID_001');
  }
}

export class RequiredFieldException extends BaseCustomException {
  constructor(fieldName: string) {
    const message = `${fieldName}${ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD.replace('필수 입력 항목입니다', '은(는) 필수 입력 항목입니다')}`;
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.VALIDATION, 'VALID_002');
  }
}

export class InvalidDataFormatException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COMMON.INVALID_DATA_FORMAT) {
    super(message, HttpStatus.BAD_REQUEST, ERROR_TYPES.VALIDATION, 'VALID_003');
  }
}

/**
 * 시스템 관련 예외
 */
export class DatabaseException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COMMON.DATABASE_ERROR) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, ERROR_TYPES.DATABASE, 'DB_001');
  }
}

export class NetworkException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COMMON.NETWORK_ERROR) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, ERROR_TYPES.NETWORK, 'NET_001');
  }
}

export class OperationFailedException extends BaseCustomException {
  constructor(message: string = ERROR_MESSAGES.COMMON.OPERATION_FAILED) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, ERROR_TYPES.SYSTEM, 'OP_001');
  }
}

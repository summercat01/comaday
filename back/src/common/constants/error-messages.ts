/**
 * 에러 메시지 상수 정의
 * 모든 에러 메시지를 한곳에서 관리
 */

export const ERROR_MESSAGES = {
  // 인증 관련
  AUTH: {
    INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
    UNAUTHORIZED: '인증이 필요합니다.',
    TOKEN_EXPIRED: '토큰이 만료되었습니다.',
    INVALID_TOKEN: '유효하지 않은 토큰입니다.',
  },

  // 사용자 관련
  USER: {
    NOT_FOUND: '사용자를 찾을 수 없습니다.',
    USERNAME_REQUIRED: '사용자명은 필수 입력 항목입니다.',
    PASSWORD_REQUIRED: '비밀번호는 필수 입력 항목입니다.',
    USERNAME_AND_PASSWORD_REQUIRED: '사용자명과 비밀번호는 필수 입력 항목입니다.',
    USERNAME_ALREADY_EXISTS: '이미 사용 중인 사용자명입니다.',
    REGISTRATION_FAILED: '사용자 등록 중 오류가 발생했습니다.',
    LOGIN_FAILED: '로그인 중 오류가 발생했습니다.',
    USER_ID_REQUIRED: '사용자 ID가 필요합니다.',
    INVALID_USER_ID: '유효하지 않은 사용자 ID입니다.',
  },

  // 코인/거래 관련
  COIN: {
    INSUFFICIENT_BALANCE: '코인이 부족합니다.',
    INVALID_AMOUNT: '유효하지 않은 거래 금액입니다.',
    AMOUNT_REQUIRED: '거래 금액을 입력해주세요.',
    POSITIVE_AMOUNT_REQUIRED: '거래 금액은 0보다 커야 합니다.',
    SENDER_REQUIRED: '발송자 정보가 필요합니다.',
    RECEIVER_REQUIRED: '수신자 정보가 필요합니다.',
    SAME_USER_TRANSFER: '자신에게는 코인을 전송할 수 없습니다.',
    TRANSACTION_LIMIT_EXCEEDED: '거래 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.',
    CONSECUTIVE_TRANSACTION_LIMIT: '동일한 상대와 연속으로 거래할 수 없습니다.',
    ROOM_TRANSACTION_LIMIT: '이 방에서 더 이상 거래할 수 없습니다. (2회 제한)',
    GLOBAL_TRANSACTION_LIMIT: '전역 거래 제한에 도달했습니다.',
    TRANSFER_FAILED: '코인 전송에 실패했습니다.',
    BULK_TRANSFER_FAILED: '일괄 거래에 실패했습니다.',
    INVALID_TRANSFER_DATA: '거래 데이터가 유효하지 않습니다.',
    EMPTY_TRANSFER_LIST: '거래할 대상이 없습니다.',
  },

  // 방 관련
  ROOM: {
    NOT_FOUND: '방을 찾을 수 없습니다.',
    ROOM_CODE_REQUIRED: '방 코드가 필요합니다.',
    ROOM_NAME_REQUIRED: '방 이름은 필수 입력 항목입니다.',
    ROOM_FULL: '방이 가득 찼습니다.',
    ROOM_CLOSED: '방이 이미 닫혔습니다.',
    ALREADY_JOINED: '이미 참가 중인 방입니다.',
    NOT_MEMBER: '방 멤버가 아닙니다.',
    MEMBER_NOT_FOUND: '방 멤버를 찾을 수 없습니다.',
    HOST_ONLY: '방장만 이 작업을 수행할 수 있습니다.',
    MEMBER_ONLY: '방 멤버만 이 작업을 수행할 수 있습니다.',
    CANNOT_CLOSE_SYSTEM_ROOM: '시스템 룸은 닫을 수 없습니다.',
    ROOM_CREATION_FAILED: '방 생성에 실패했습니다.',
    JOIN_FAILED: '방 입장에 실패했습니다.',
    LEAVE_FAILED: '방 나가기에 실패했습니다.',
    DESCRIPTION_REQUIRED: '방 설명이 필요합니다.',
    DESCRIPTION_UPDATE_FAILED: '방 설명 변경에 실패했습니다.',
    MAX_MEMBERS_EXCEEDED: '최대 인원을 초과했습니다.',
  },

  // 거래 제한 관련
  TRANSACTION_LIMIT: {
    NOT_FOUND: '거래 제한 설정을 찾을 수 없습니다.',
    UPDATE_FAILED: '거래 제한 설정 업데이트에 실패했습니다.',
    INVALID_SCOPE: '유효하지 않은 제한 범위입니다.',
    INVALID_LIMIT_TYPE: '유효하지 않은 제한 유형입니다.',
    INVALID_MAX_COUNT: '최대 횟수는 1 이상이어야 합니다.',
    INVALID_TIME_WINDOW: '시간 윈도우는 0 이상이어야 합니다.',
  },

  // 랭킹 관련
  RANKING: {
    NOT_FOUND: '랭킹 정보를 찾을 수 없습니다.',
    UPDATE_FAILED: '랭킹 업데이트에 실패했습니다.',
  },

  // 일반적인 서버 에러
  COMMON: {
    INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
    BAD_REQUEST: '잘못된 요청입니다.',
    FORBIDDEN: '권한이 없습니다.',
    NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
    VALIDATION_FAILED: '입력 데이터 검증에 실패했습니다.',
    INVALID_DATA_FORMAT: '잘못된 데이터 형식입니다.',
    MISSING_REQUIRED_FIELD: '필수 입력 항목이 누락되었습니다.',
    OPERATION_FAILED: '작업 수행에 실패했습니다.',
    DATABASE_ERROR: '데이터베이스 오류가 발생했습니다.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  },

  // 검증 관련
  VALIDATION: {
    INVALID_EMAIL: '유효하지 않은 이메일 형식입니다.',
    INVALID_NUMBER: '숫자만 입력 가능합니다.',
    INVALID_STRING: '문자열 형태로 입력해주세요.',
    TOO_SHORT: '입력값이 너무 짧습니다.',
    TOO_LONG: '입력값이 너무 깁니다.',
    INVALID_FORMAT: '형식이 올바르지 않습니다.',
    REQUIRED_FIELD: '필수 입력 항목입니다.',
  },
} as const;

// 에러 코드별 메시지 매핑
export const ERROR_CODE_MESSAGES = {
  // HTTP 상태 코드별 기본 메시지
  400: ERROR_MESSAGES.COMMON.BAD_REQUEST,
  401: ERROR_MESSAGES.AUTH.UNAUTHORIZED,
  403: ERROR_MESSAGES.COMMON.FORBIDDEN,
  404: ERROR_MESSAGES.COMMON.NOT_FOUND,
  409: '데이터 충돌이 발생했습니다.',
  422: ERROR_MESSAGES.COMMON.VALIDATION_FAILED,
  500: ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
  502: '외부 서비스 연결에 실패했습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
} as const;

// 에러 타입별 분류
export const ERROR_TYPES = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  VALIDATION: 'VALIDATION',
  BUSINESS_LOGIC: 'BUSINESS_LOGIC',
  DATABASE: 'DATABASE',
  NETWORK: 'NETWORK',
  SYSTEM: 'SYSTEM',
} as const;

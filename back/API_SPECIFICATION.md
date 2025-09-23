# 코마데이 (Comaday) API 명세서

> 오프라인 보드게임 코인 관리 시스템 API 문서

## 📋 목차

1. [서버 정보](#서버-정보)
2. [인증 API](#인증-api)
3. [사용자 API](#사용자-api)
4. [코인 거래 API](#코인-거래-api)
5. [방 관리 API](#방-관리-api)
6. [랭킹 API](#랭킹-api)
7. [에러 응답](#에러-응답)
8. [데이터 모델](#데이터-모델)

---

## 서버 정보

- **Base URL**: `http://localhost:4000/api`
- **Content-Type**: `application/json`
- **인코딩**: UTF-8
- **글로벌 프리픽스**: `/api` (모든 엔드포인트에 자동 적용)
- **특징**: 오프라인 보드게임 코인 관리, 11개 사전 생성 방, 방 기반 거래 제한

---

## 인증 API

### 로그인

#### `POST /auth/login`

사용자 로그인 또는 자동 계정 생성

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "player1",
  "coinCount": 1000,
  "isAdmin": false,
  "createdAt": "2025-09-23T12:00:00.000Z",
  "updatedAt": "2025-09-23T12:00:00.000Z"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:4000/api/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "password": "1234"
  }'
```

**Errors:**
- `400`: 사용자명과 비밀번호가 필요합니다.
- `401`: 잘못된 비밀번호입니다.

---

## 사용자 API

### 사용자 등록

#### `POST /users/register`

새로운 사용자 계정 생성

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "newplayer",
  "coinCount": 1000,
  "isAdmin": false,
  "createdAt": "2025-09-23T12:00:00.000Z",
  "updatedAt": "2025-09-23T12:00:00.000Z"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:4000/api/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newplayer",
    "password": "1234"
  }'
```

**Errors:**
- `400`: 사용자명과 비밀번호가 필요합니다.
- `409`: 이미 존재하는 사용자명입니다.
- `500`: 사용자 등록 중 오류가 발생했습니다.

### 게스트 로그인

#### `POST /users/guest-login`

게스트 계정으로 로그인

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": 2,
  "username": "guest_user",
  "coinCount": 1000,
  "isAdmin": false,
  "createdAt": "2025-09-23T12:00:00.000Z",
  "updatedAt": "2025-09-23T12:00:00.000Z"
}
```

### 전체 사용자 조회

#### `GET /users`

모든 사용자 목록 조회

**Response:**
```json
[
  {
    "id": 1,
    "username": "player1",
    "coinCount": 1000,
    "isAdmin": false,
    "createdAt": "2025-09-23T12:00:00.000Z",
    "updatedAt": "2025-09-23T12:00:00.000Z"
  }
]
```

### 특정 사용자 조회

#### `GET /users/{id}`

특정 사용자 정보 조회

**Path Parameters:**
- `id` (number): 사용자 ID

**Response:**
```json
{
  "id": 1,
  "username": "player1",
  "coinCount": 1000,
  "isAdmin": false,
  "createdAt": "2025-09-23T12:00:00.000Z",
  "updatedAt": "2025-09-23T12:00:00.000Z"
}
```

### 사용자 코인 수정

#### `PUT /users/{id}/coins`

사용자의 코인 수량 직접 수정 (관리자용)

**Path Parameters:**
- `id` (number): 사용자 ID

**Request Body:**
```json
{
  "coinCount": 1500
}
```

**Response:**
```json
{
  "id": 1,
  "username": "player1",
  "coinCount": 1500,
  "isAdmin": false,
  "createdAt": "2025-09-23T12:00:00.000Z",
  "updatedAt": "2025-09-23T12:01:00.000Z"
}
```

### 수신 가능한 사용자 목록

#### `GET /users/receivers/{myId}`

코인을 전송할 수 있는 다른 사용자들의 목록

**Path Parameters:**
- `myId` (number): 내 사용자 ID

**Response:**
```json
[
  {
    "id": 2,
    "username": "player2",
    "coinCount": 800,
    "isAdmin": false
  }
]
```

---

## 코인 거래 API

### 코인 전송

#### `POST /coins/transfer`

사용자 간 코인 전송 (방 내/외 모두 가능)

**Request Body:**
```json
{
  "senderId": 1,
  "receiverId": 2,
  "amount": 100,
  "roomCode": "ROOM01"
}
```

**Note:** `roomCode`가 있으면 방 내 거래로 처리되며 방 기반 거래 제한이 적용됩니다.

**Response:**
```json
{
  "id": 1,
  "senderId": 1,
  "receiverId": 2,
  "amount": 100,
  "type": "TRANSFER",
  "description": "방 \"1번 방\"에서 player2님에게 포인트 전송",
  "groupId": null,
  "roomCode": "ROOM01",
  "createdAt": "2025-09-23T12:00:00.000Z"
}
```

**Errors:**
- `400`: 잘못된 요청 데이터입니다.
- `404`: 사용자를 찾을 수 없습니다.
- `400`: 포인트가 부족합니다.
- `403`: 이 방에서 더 이상 거래할 수 없습니다. (2회 제한)
- `403`: 방 멤버만 방 내에서 거래할 수 있습니다.

### 일괄 코인 전송

#### `POST /coins/bulk-transfer`

한 번에 여러 사용자에게 코인 전송

**Request Body:**
```json
{
  "senderId": 1,
  "roomCode": "ROOM01",
  "description": "게임 종료 보상",
  "transfers": [
    {
      "receiverId": 2,
      "amount": 100
    },
    {
      "receiverId": 3,
      "amount": 150
    }
  ]
}
```

**Response:**
```json
[
  {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "amount": 100,
    "type": "TRANSFER",
    "description": "게임 종료 보상",
    "groupId": "uuid-string",
    "roomCode": "ROOM01",
    "createdAt": "2025-09-23T12:00:00.000Z"
  }
]
```

### 코인 적립

#### `POST /coins/earn`

사용자에게 코인 지급

**Request Body:**
```json
{
  "userId": 1,
  "amount": 200,
  "description": "이벤트 보상"
}
```

**Response:**
```json
{
  "id": 2,
  "senderId": null,
  "receiverId": 1,
  "amount": 200,
  "type": "EARN",
  "description": "이벤트 보상",
  "groupId": null,
  "roomCode": null,
  "createdAt": "2025-09-23T12:00:00.000Z"
}
```

### 거래 내역 조회

#### `GET /coins/history/{userId}`

특정 사용자의 거래 내역 조회

**Path Parameters:**
- `userId` (number): 사용자 ID

**Response:**
```json
[
  {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "amount": 100,
    "type": "TRANSFER",
    "description": "player2님에게 코인 전송",
    "groupId": null,
    "roomCode": "ROOM01",
    "createdAt": "2025-09-23T12:00:00.000Z"
  }
]
```

### 전체 거래 조회

#### `GET /coins/transactions`

모든 거래 내역 조회

**Response:**
```json
[
  {
    "id": 1,
    "senderId": 1,
    "receiverId": 2,
    "amount": 100,
    "type": "TRANSFER",
    "description": "player2님에게 코인 전송",
    "groupId": null,
    "roomCode": "ROOM01",
    "createdAt": "2025-09-23T12:00:00.000Z"
  }
]
```

### 방별 거래 제한 체크

#### `GET /coins/room-limit/{userId}/{roomCode}`

특정 사용자의 방별 거래 제한 상태 확인

**Path Parameters:**
- `userId` (number): 사용자 ID
- `roomCode` (string): 방 코드

**Response:**
```json
{
  "canTransact": true,
  "message": "거래 가능"
}
```

**Note:** 사용자는 각 방에서 최대 2번의 거래(보내기/받기)만 가능합니다.

### 방별 거래 통계

#### `GET /coins/room-stats/{userId}/{roomCode}`

특정 사용자의 방별 거래 통계 조회

**Path Parameters:**
- `userId` (number): 사용자 ID
- `roomCode` (string): 방 코드

**Response:**
```json
{
  "userId": 1,
  "roomCode": "ROOM01",
  "sentCount": 1,
  "receivedCount": 0,
  "totalTransactions": 1,
  "sentTransactions": [
    {
      "groupId": "uuid-1",
      "amount": 100,
      "createdAt": "2025-09-23T12:00:00.000Z"
    }
  ],
  "receivedTransactions": []
}
```

### 대기방 거래 통계

#### `GET /coins/lobby-transaction-stats/{userId}`

사용자의 모든 방(ROOM01-ROOM11)에 대한 거래 통계

**Path Parameters:**
- `userId` (number): 사용자 ID

**Response:**
```json
{
  "userId": 1,
  "roomStats": [
    {
      "roomCode": "ROOM01",
      "sentCount": 1,
      "receivedCount": 0,
      "totalTransactions": 1
    },
    {
      "roomCode": "ROOM02",
      "sentCount": 0,
      "receivedCount": 0,
      "totalTransactions": 0
    }
  ]
}
```

---

## 방 관리 API

### 방 생성

#### `POST /rooms`

새로운 게임 방 생성

**Request Body:**
```json
{
  "name": "즐거운 게임방",
  "description": "친구들과 함께 보드게임을 즐겨요",
  "maxMembers": 6,
  "hostUserId": 1
}
```

**Response:**
```json
{
  "id": 12,
  "roomCode": "ROOM_USER_001",
  "name": "즐거운 게임방",
  "gameName": null,
  "description": "친구들과 함께 보드게임을 즐겨요",
  "originalDescription": "친구들과 함께 보드게임을 즐겨요",
  "hostUserId": 1,
  "maxMembers": 6,
  "status": "ACTIVE",
  "startedAt": "2025-09-23T12:00:00.000Z",
  "members": [],
  "createdAt": "2025-09-23T12:00:00.000Z",
  "updatedAt": "2025-09-23T12:00:00.000Z",
  "memberCount": 0,
  "isActive": true
}
```

### 방 목록 조회

#### `GET /rooms`

모든 방 목록 조회 (페이징 지원)

**Query Parameters:**
- `page` (number, optional): 페이지 번호 (기본값: 1)
- `limit` (number, optional): 페이지당 항목 수 (기본값: 10)

**Response:**
```json
{
  "rooms": [
    {
      "id": 1,
      "roomCode": "ROOM01",
      "name": "1번 방",
      "gameName": null,
      "description": "오프라인 1번 방에 대응하는 온라인 룸",
      "originalDescription": "오프라인 1번 방에 대응하는 온라인 룸",
      "hostUserId": 0,
      "maxMembers": 8,
      "status": "ACTIVE",
      "startedAt": "2025-09-23T11:32:42.433Z",
      "members": [],
      "createdAt": "2025-09-23T11:32:42.433Z",
      "updatedAt": "2025-09-23T11:32:42.433Z",
      "memberCount": 0,
      "isActive": true
    }
  ],
  "total": 11
}
```

### 대기방 상태 조회

#### `GET /rooms/lobby-status`

대기방 UI용 간소화된 방 정보 조회

**Response:**
```json
{
  "rooms": [
    {
      "roomCode": "ROOM01",
      "roomNumber": 1,
      "name": "1번 방",
      "memberCount": 0,
      "maxMembers": 8
    },
    {
      "roomCode": "ROOM02",
      "roomNumber": 2,
      "name": "2번 방",
      "memberCount": 2,
      "maxMembers": 8
    }
  ],
  "totalRooms": 11
}
```

### 방 상세 조회

#### `GET /rooms/{roomCode}`

특정 방의 상세 정보 조회

**Path Parameters:**
- `roomCode` (string): 방 코드

**Response:**
```json
{
  "id": 1,
  "roomCode": "ROOM01",
  "name": "1번 방",
  "gameName": "스플렌더",
  "description": "오프라인 1번 방에 대응하는 온라인 룸",
  "originalDescription": "오프라인 1번 방에 대응하는 온라인 룸",
  "hostUserId": 0,
  "maxMembers": 8,
  "status": "ACTIVE",
  "startedAt": "2025-09-23T11:32:42.433Z",
  "members": [
    {
      "id": 1,
      "roomId": 1,
      "userId": 1,
      "joinedAt": "2025-09-23T12:00:00.000Z",
      "lastHeartbeat": "2025-09-23T12:05:00.000Z",
      "user": {
        "id": 1,
        "username": "player1",
        "coinCount": 900
      },
      "createdAt": "2025-09-23T12:00:00.000Z",
      "updatedAt": "2025-09-23T12:05:00.000Z",
      "isHost": false
    }
  ],
  "createdAt": "2025-09-23T11:32:42.433Z",
  "updatedAt": "2025-09-23T11:32:42.433Z",
  "memberCount": 1,
  "isActive": true
}
```

### 방 입장

#### `POST /rooms/{roomCode}/join`

방에 입장

**Path Parameters:**
- `roomCode` (string): 방 코드

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "roomId": 1,
  "userId": 1,
  "joinedAt": "2025-09-23T12:00:00.000Z",
  "lastHeartbeat": "2025-09-23T12:00:00.000Z",
  "user": {
    "id": 1,
    "username": "player1",
    "coinCount": 1000
  },
  "createdAt": "2025-09-23T12:00:00.000Z",
  "updatedAt": "2025-09-23T12:00:00.000Z",
  "isHost": false
}
```

**Errors:**
- `400`: 사용자 ID가 필요합니다.
- `404`: 방을 찾을 수 없습니다.
- `400`: 이미 다른 방에 입장해 있습니다.
- `400`: 방이 가득 찼습니다.
- `400`: 비활성 방입니다.

### 방 나가기

#### `POST /rooms/{roomCode}/leave`

방에서 나가기

**Path Parameters:**
- `roomCode` (string): 방 코드

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "방에서 나갔습니다."
}
```

### 즉시 방 나가기

#### `POST /rooms/{roomCode}/leave-immediately`

페이지 이탈 시 사용하는 즉시 방 나가기 (에러 관대)

**Path Parameters:**
- `roomCode` (string): 방 코드

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "방에서 나갔습니다."
}
```

**특징:**
- 이미 나간 상태이거나 방이 없어도 성공으로 처리
- 페이지 벗어남 감지시 안전하게 사용 가능

### 멤버십 확인

#### `GET /rooms/{roomCode}/check-member/{userId}`

사용자가 특정 방의 멤버인지 확인

**Path Parameters:**
- `roomCode` (string): 방 코드
- `userId` (number): 사용자 ID

**Response:**
```json
{
  "isMember": true,
  "memberInfo": {
    "joinedAt": "2025-09-23T12:00:00.000Z",
    "lastHeartbeat": "2025-09-23T12:05:00.000Z",
    "isHost": false
  }
}
```

### 방 닫기

#### `POST /rooms/{roomCode}/close`

방을 닫기 (방장만 가능, 시스템 룸은 불가)

**Path Parameters:**
- `roomCode` (string): 방 코드

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "방이 닫혔습니다."
}
```

**Errors:**
- `403`: 방장만 방을 닫을 수 있습니다.
- `400`: 시스템 방은 닫을 수 없습니다.

### 방 설명 변경

#### `PUT /rooms/{roomCode}/description`

방 설명 변경 (방 멤버 누구나 가능)

**Path Parameters:**
- `roomCode` (string): 방 코드

**Request Body:**
```json
{
  "userId": 1,
  "description": "새로운 방 설명"
}
```

**Response:**
```json
{
  "id": 1,
  "roomCode": "ROOM01",
  "name": "1번 방",
  "gameName": null,
  "description": "새로운 방 설명",
  "originalDescription": "오프라인 1번 방에 대응하는 온라인 룸",
  "hostUserId": 0,
  "maxMembers": 8,
  "status": "ACTIVE",
  "startedAt": "2025-09-23T11:32:42.433Z",
  "members": [],
  "createdAt": "2025-09-23T11:32:42.433Z",
  "updatedAt": "2025-09-23T12:05:00.000Z",
  "memberCount": 0,
  "isActive": true
}
```

**Note:** 모든 멤버가 나가면 시스템 룸의 설명은 `originalDescription`으로 초기화됩니다.

### 방 제목 변경

#### `PUT /rooms/{roomCode}/name`

방 제목 변경 (방 멤버 누구나 가능)

**Path Parameters:**
- `roomCode` (string): 방 코드

**Request Body:**
```json
{
  "userId": 1,
  "name": "새로운 방 제목"
}
```

**Response:**
```json
{
  "id": 1,
  "roomCode": "ROOM01",
  "name": "새로운 방 제목",
  "gameName": null,
  "description": "오프라인 1번 방에 대응하는 온라인 룸",
  "originalDescription": "오프라인 1번 방에 대응하는 온라인 룸",
  "hostUserId": 0,
  "maxMembers": 8,
  "status": "ACTIVE",
  "startedAt": "2025-09-23T11:32:42.433Z",
  "members": [],
  "createdAt": "2025-09-23T11:32:42.433Z",
  "updatedAt": "2025-09-23T12:05:00.000Z",
  "memberCount": 0,
  "isActive": true
}
```

### 게임명 변경

#### `PUT /rooms/{roomCode}/game-name`

게임명 변경 (방 멤버 누구나 가능)

**Path Parameters:**
- `roomCode` (string): 방 코드

**Request Body:**
```json
{
  "userId": 1,
  "gameName": "모노폴리"
}
```

**Response:**
```json
{
  "id": 1,
  "roomCode": "ROOM01",
  "name": "1번 방",
  "gameName": "모노폴리",
  "description": "오프라인 1번 방에 대응하는 온라인 룸",
  "originalDescription": "오프라인 1번 방에 대응하는 온라인 룸",
  "hostUserId": 0,
  "maxMembers": 8,
  "status": "ACTIVE",
  "startedAt": "2025-09-23T11:32:42.433Z",
  "members": [],
  "createdAt": "2025-09-23T11:32:42.433Z",
  "updatedAt": "2025-09-23T12:05:00.000Z",
  "memberCount": 0,
  "isActive": true
}
```

### 하트비트 전송

#### `POST /rooms/{roomCode}/heartbeat`

활성 상태 갱신을 위한 하트비트 전송

**Path Parameters:**
- `roomCode` (string): 방 코드

**Request Body:**
```json
{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "하트비트가 갱신되었습니다.",
  "lastHeartbeat": "2025-09-23T12:05:00.000Z"
}
```

**Note:** 1분 30초 이상 하트비트가 없으면 자동으로 방에서 퇴장됩니다.

---

## 랭킹 API

### 전체 랭킹 조회

#### `GET /ranking`

코인 보유량 기준 전체 사용자 랭킹

**Response:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "username": "player1",
    "totalCoins": 1200,
    "createdAt": "2025-09-23T12:00:00.000Z"
  },
  {
    "id": 2,
    "userId": 2,
    "username": "player2",
    "totalCoins": 800,
    "createdAt": "2025-09-23T12:00:00.000Z"
  }
]
```

### 사용자별 랭킹 조회

#### `GET /ranking/user/{userId}`

특정 사용자의 랭킹 정보

**Path Parameters:**
- `userId` (number): 사용자 ID

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "username": "player1",
  "totalCoins": 1200,
  "createdAt": "2025-09-23T12:00:00.000Z"
}
```

---

## 에러 응답

모든 에러는 다음 형식으로 응답됩니다:

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "USER_001",
  "errorType": "VALIDATION",
  "message": "한국어 에러 메시지",
  "timestamp": "2025-09-23T12:00:00.000Z",
  "path": "/api/endpoint",
  "method": "POST"
}
```

### 에러 코드 목록

#### 사용자 관련 (USER_XXX)
- `USER_001`: 사용자를 찾을 수 없습니다.
- `USER_002`: 이미 존재하는 사용자명입니다.
- `USER_003`: 사용자 등록 중 오류가 발생했습니다.
- `USER_004`: 사용자명과 비밀번호가 필요합니다.
- `USER_005`: 유효하지 않은 사용자 데이터입니다.

#### 인증 관련 (AUTH_XXX)
- `AUTH_001`: 잘못된 비밀번호입니다.
- `AUTH_002`: 인증이 필요합니다.

#### 코인 관련 (COIN_XXX)
- `COIN_001`: 포인트가 부족합니다.
- `COIN_002`: 이 방에서 더 이상 거래할 수 없습니다. (2회 제한)
- `COIN_003`: 잘못된 거래 금액입니다.
- `COIN_004`: 일괄 거래 처리 중 오류가 발생했습니다.
- `COIN_005`: 자기 자신에게는 코인을 전송할 수 없습니다.

#### 방 관련 (ROOM_XXX)
- `ROOM_001`: 방을 찾을 수 없습니다.
- `ROOM_002`: 방 멤버만 접근할 수 있습니다.
- `ROOM_003`: 활성 상태의 방에서만 가능합니다.
- `ROOM_004`: 이미 다른 방에 입장해 있습니다.
- `ROOM_005`: 방이 가득 찼습니다.
- `ROOM_006`: 방장만 이 작업을 수행할 수 있습니다.
- `ROOM_007`: 시스템 방은 삭제할 수 없습니다.
- `ROOM_008`: 방 설명은 필수 입력 항목입니다.

#### 공통 (COMMON_XXX)
- `COMMON_001`: 필수 입력 항목이 누락되었습니다.
- `COMMON_002`: 잘못된 요청 형식입니다.

#### 데이터베이스 (DB_XXX)
- `DB_001`: 데이터베이스 연결 오류입니다.
- `DB_002`: 데이터 무결성 오류입니다.
- `DB_003`: 데이터베이스 처리 중 오류가 발생했습니다.

---

## 데이터 모델

### User (사용자)

```typescript
{
  id: number;              // 사용자 ID
  username: string;        // 사용자명 (유니크)
  password: string;        // 암호화된 비밀번호
  coinCount: number;       // 보유 코인 수
  isAdmin: boolean;        // 관리자 여부
  createdAt: Date;         // 생성 시간
  updatedAt: Date;         // 수정 시간
}
```

### Room (방)

```typescript
{
  id: number;                    // 방 ID
  roomCode: string;              // 방 코드 (유니크)
  name: string;                  // 방 이름
  gameName?: string;             // 게임 이름
  description: string;           // 방 설명 (현재)
  originalDescription: string;   // 원본 방 설명 (초기화용)
  hostUserId: number;            // 방장 ID (0: 시스템 룸)
  maxMembers: number;            // 최대 인원
  status: 'ACTIVE' | 'CLOSED';   // 방 상태
  startedAt: Date;               // 방 생성 시간
  members: RoomMember[];         // 방 멤버들
  createdAt: Date;               // 생성 시간
  updatedAt: Date;               // 수정 시간
  memberCount: number;           // 현재 멤버 수 (계산 프로퍼티)
  isActive: boolean;             // 활성 상태 여부 (계산 프로퍼티)
}
```

### RoomMember (방 멤버)

```typescript
{
  id: number;                    // 멤버 ID
  roomId: number;                // 방 ID
  userId: number;                // 사용자 ID
  joinedAt: Date;                // 입장 시간
  lastHeartbeat: Date;           // 마지막 하트비트
  user: User;                    // 사용자 정보
  createdAt: Date;               // 생성 시간
  updatedAt: Date;               // 수정 시간
  isHost: boolean;               // 방장 여부 (계산 프로퍼티)
}
```

**참고**: 레코드 존재 = 방 참여중, 레코드 삭제 = 방 나감

### CoinTransaction (코인 거래)

```typescript
{
  id: number;                         // 거래 ID
  senderId: number;                   // 발송자 ID (null: 시스템 지급)
  receiverId: number;                 // 수신자 ID (null: 시스템 차감)
  amount: number;                     // 거래 금액
  type: "EARN" | "SPEND" | "TRANSFER"; // 거래 유형
  description: string;                // 거래 설명
  groupId?: string;                   // 일괄거래 그룹 ID (UUID)
  roomCode?: string;                  // 거래가 발생한 방 코드
  createdAt: Date;                    // 거래 시간
}
```

### Ranking (랭킹)

```typescript
{
  id: number;              // 랭킹 ID
  userId: number;          // 사용자 ID
  username: string;        // 사용자명
  totalCoins: number;      // 총 코인 수
  createdAt: Date;         // 생성 시간
}
```

**참고**: 순위는 `totalCoins` 기준으로 내림차순 정렬하여 계산

---

## 시스템 특징

### 방 기반 거래 제한

- 각 사용자는 **방별로 최대 2번의 거래**만 가능 (보내기/받기 합쳐서)
- 방을 옮기면 거래 카운트가 리셋됨
- 시스템 룸 (ROOM01-ROOM11)에 적용

### 자동 방 관리

- **11개 시스템 룸** 자동 생성 (ROOM01-ROOM11)
- 오프라인 물리적 방과 1:1 대응
- 시스템 룸은 삭제 불가, 사용자가 추가 방 생성 가능

### 실시간 기능

- **하트비트 시스템**: 1분 30초마다 자동 체크
- **자동 퇴장**: 비활성 사용자는 자동으로 방에서 제거
- **폴링 기반**: 실시간 업데이트는 클라이언트 폴링으로 구현

### 에러 처리

- **글로벌 예외 필터**: 모든 에러를 한국어로 통일
- **커스텀 예외**: 도메인별 세분화된 에러 코드
- **검증 파이프**: 요청 데이터 자동 검증 및 에러 메시지 한글화

---

*마지막 업데이트: 2025-09-23*
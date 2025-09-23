# 하트비트 및 자동 퇴장 시스템 API

## 개요
브라우저 종료나 접속 끊김 시 자동으로 방에서 퇴장하는 시스템을 구현했습니다.

## 시스템 구조

### 1. 하트비트 메커니즘
- **원리**: 클라이언트가 주기적으로 서버에 "살아있음"을 알리는 신호를 보냄
- **주기**: 클라이언트는 30초마다 하트비트 전송 권장
- **타임아웃**: 서버는 2분 동안 하트비트가 없으면 자동 퇴장 처리

### 2. 자동 정리 시스템
- **크론 작업**: 매 30초마다 비활성 멤버 검사
- **정리 조건**: 마지막 하트비트가 2분 이상 된 ACTIVE 멤버들
- **정리 동작**: 
  - 멤버 상태를 `LEFT`로 변경
  - `leftAt` 시간 기록
  - 시스템 룸에서 마지막 멤버가 나간 경우 방 설명 초기화

## API 엔드포인트

### 하트비트 전송
```http
POST /rooms/{roomCode}/heartbeat
Content-Type: application/json

{
  "userId": 123
}
```

**응답:**
```json
{
  "success": true,
  "message": "하트비트 업데이트 성공"
}
```

**에러 응답:**
```json
{
  "success": false,
  "message": "방을 찾을 수 없습니다."
}
```

## 클라이언트 구현 가이드

### 1. 하트비트 전송 로직
```javascript
// 방에 입장한 후 하트비트 시작
function startHeartbeat(roomCode, userId) {
  const heartbeatInterval = setInterval(async () => {
    try {
      const response = await fetch(`/rooms/${roomCode}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const result = await response.json();
      if (!result.success) {
        console.warn('하트비트 실패:', result.message);
        // 선택적으로 재접속 로직 실행
      }
    } catch (error) {
      console.error('하트비트 전송 실패:', error);
    }
  }, 30000); // 30초마다

  return heartbeatInterval;
}

// 방에서 나갈 때 하트비트 중지
function stopHeartbeat(heartbeatInterval) {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
}
```

### 2. 페이지 언로드 시 정리
```javascript
// 브라우저 종료/새로고침 시 하트비트 중지
window.addEventListener('beforeunload', () => {
  stopHeartbeat(heartbeatInterval);
});

// React에서 useEffect 사용 예시
useEffect(() => {
  const interval = startHeartbeat(roomCode, userId);
  
  return () => {
    stopHeartbeat(interval);
  };
}, [roomCode, userId]);
```

### 3. 접속 상태 모니터링
```javascript
// 주기적으로 방 정보를 확인하여 자동 퇴장 감지
function checkRoomStatus(roomCode, userId) {
  setInterval(async () => {
    try {
      const room = await getRoomByCode(roomCode);
      const isStillInRoom = room.members.some(
        member => member.userId === userId && member.status === 'ACTIVE'
      );
      
      if (!isStillInRoom) {
        // 자동 퇴장되었음을 감지
        alert('접속이 끊어져 방에서 자동 퇴장되었습니다.');
        // 메인 페이지로 리다이렉트
        redirectToMainPage();
      }
    } catch (error) {
      console.error('방 상태 확인 실패:', error);
    }
  }, 60000); // 1분마다 확인
}
```

## 기존 코인 전송 API

### 방 내 간편 전송
기존 코인 전송 API를 그대로 사용하되, `roomCode`를 포함하여 전송:

```http
POST /coins/transfer
Content-Type: application/json

{
  "senderId": 123,
  "receiverId": 456,
  "amount": 100,
  "roomCode": "ROOM01"
}
```

이렇게 하면 방 내 전송으로 처리되며, 연속 거래 제한도 적용됩니다.

## 데이터베이스 변경사항

### RoomMember 엔티티 추가 필드
```sql
ALTER TABLE room_members 
ADD COLUMN lastHeartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### 주요 테이블 구조
```sql
-- room_members 테이블
CREATE TABLE room_members (
  id SERIAL PRIMARY KEY,
  roomId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  status VARCHAR(10) DEFAULT 'ACTIVE', -- ACTIVE, LEFT, KICKED
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  leftAt TIMESTAMP NULL,
  lastHeartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 새로 추가
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(roomId, userId)
);
```

## 모니터링 및 로그

### 서버 로그 예시
```
💤 비활성 멤버 자동 퇴장: 사용자 123, 방 ROOM01
🧹 자동 정리: 2명의 비활성 멤버를 퇴장시켰습니다.
```

### 설정 가능한 값들
- **하트비트 주기**: 30초 (클라이언트)
- **타임아웃 시간**: 2분 (서버)
- **정리 주기**: 30초 (서버 크론)

이 시스템을 통해 브라우저가 예기치 않게 종료되더라도 방에서 자동으로 퇴장되며, 다른 사용자들에게는 3초 내에 업데이트가 반영됩니다.

# 🚫 연속 거래 제한 시스템

## 📋 **개요**
코마데이에 연속 거래 제한 시스템이 추가되었습니다. 이 시스템은 같은 사용자 간의 연속된 포인트 거래를 제한하여 공정한 경쟁을 유도합니다.

## ⚙️ **핵심 기능**

### 🔄 **양방향 연속 거래 제한 (기본값)**
- **제한 대상**: 두 사용자 간 연속된 포인트 거래 (A↔B 패턴)
- **제한 횟수**: 3회 연속 (설정 가능)
- **해제 조건**: 다른 사용자와 거래 시 카운트 리셋

### 📝 **동작 예시**
```
✅ 허용되는 거래:
1. A → B (100 포인트)
2. A → B (50 포인트)  
3. B → A (75 포인트)  ← 3번째 A↔B 거래
4. C → A (30 포인트)  ← 다른 사용자와의 거래로 리셋
5. A → B (25 포인트)  ← 다시 허용됨

❌ 제한되는 거래:
1. A → B (100 포인트)
2. B → A (50 포인트)  
3. A → B (75 포인트)  ← 3번째 A↔B 거래
4. B → A (???)        ← 4번째 A↔B 거래, 제한됨!
```

## 🗄️ **데이터베이스 구조**

### TransactionLimit 엔티티
```sql
CREATE TABLE transaction_limits (
    id SERIAL PRIMARY KEY,
    scope VARCHAR(20) DEFAULT 'GLOBAL',
    scope_id VARCHAR(255),
    limit_type VARCHAR(30),
    max_count INTEGER DEFAULT 3,
    time_window_minutes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 **API 엔드포인트**

### 거래 제한 체크
```http
POST /coins/limits/check
Content-Type: application/json

{
    "senderId": 1,
    "receiverId": 2,
    "scope": "GLOBAL"
}
```

### 제한 설정 조회
```http
GET /coins/limits
```

### 제한 설정 수정
```http
PUT /coins/limits/:id
Content-Type: application/json

{
    "maxCount": 5,
    "isActive": false
}
```

## 🎛️ **설정 관리**

### 기본 설정
- **범위**: GLOBAL (전역)
- **유형**: CONSECUTIVE_PAIR (양방향 연속)
- **제한 횟수**: 3회
- **시간 윈도우**: 제한 없음
- **상태**: 활성화

### 설정 변경 방법
1. **API 직접 호출**: PUT `/coins/limits/:id`
2. **데이터베이스 직접 수정**: `transaction_limits` 테이블
3. **관리자 페이지**: 현재 상태 표시만 (설정 변경 UI는 향후 추가 예정)

## 🚀 **확장 가능성**

### 미래 기능
```typescript
// 게임 세션별 제한 (계획)
{
  scope: 'SESSION',
  scopeId: 'session_abc123',
  limitType: 'CONSECUTIVE_PAIR',
  maxCount: 2
}

// 방별 제한 (계획)
{
  scope: 'ROOM',
  scopeId: 'room_xyz789',
  limitType: 'CONSECUTIVE_SEND',
  maxCount: 5
}
```

### 추가 제한 유형
- **CONSECUTIVE_SEND**: 일방향 연속 발송 제한
- **CONSECUTIVE_RECEIVE**: 일방향 연속 수신 제한
- **TIME_BASED**: 시간 기반 제한

## 🔧 **운영 가이드**

### 서버 시작 시
```bash
cd back
npm run start:dev

# 로그 확인
🚀 코마데이 서버가 포트 4000에서 실행 중입니다.
📊 연속 거래 제한 시스템이 활성화되었습니다.
```

### 문제 해결
1. **제한이 작동하지 않는 경우**:
   - `transaction_limits` 테이블에 기본 설정이 있는지 확인
   - `isActive` 값이 `true`인지 확인

2. **제한을 임시 해제하려면**:
   ```sql
   UPDATE transaction_limits 
   SET is_active = false 
   WHERE scope = 'GLOBAL' AND limit_type = 'CONSECUTIVE_PAIR';
   ```

3. **제한 횟수 변경**:
   ```sql
   UPDATE transaction_limits 
   SET max_count = 5 
   WHERE scope = 'GLOBAL' AND limit_type = 'CONSECUTIVE_PAIR';
   ```

## 💡 **사용자 경험**

### 프론트엔드 에러 메시지
- ❌ "같은 사용자와 3회 연속 거래는 제한됩니다. 다른 사용자와 거래 후 다시 시도해주세요."

### 관리자 페이지
- 거래 제한 설정 현황 표시
- 제한 상태 시각적 표시 (활성화/비활성화)

이 시스템은 **게임의 공정성**을 유지하면서도 **미래 확장**에 대비한 유연한 구조로 설계되었습니다! 🎮

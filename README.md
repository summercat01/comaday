# 코마데이 (ComaDay)

실시간 코인 전송 및 랭킹 관리 시스템

## 프로젝트 소개

코마데이는 팀원들 간의 코인 전송과 랭킹을 실시간으로 관리하는 웹 애플리케이션입니다.

### 주요 기능

- 사용자 인증 (로그인)
- 실시간 코인 전송
- 실시간 랭킹 업데이트
- 사용자 정보 표시
- 거래 내역 관리

## 기술 스택

### 프론트엔드
- React
- TypeScript
- CSS Variables
- WebSocket (실시간 통신)

### 백엔드 (구현 예정)
- RESTful API
- WebSocket 서버
- 데이터베이스
- 트랜잭션 관리

## 시작하기

### 필수 요구사항
- Node.js 14.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 저장소 클론
```bash
git clone [repository-url]
cd comaday
```

2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

3. 개발 서버 실행
```bash
npm start
# 또는
yarn start
```

## 프로젝트 구조

```
comaday/
├── public/
│   └── index.html      # 메인 HTML 파일
├── src/
│   ├── App.tsx         # 메인 애플리케이션 컴포넌트
│   ├── App.css         # 전역 스타일
│   └── index.tsx       # 애플리케이션 진입점
└── README.md
```

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 사용자 로그인

### 사용자
- `GET /api/users` - 전체 사용자 목록 조회
- `GET /api/users/{id}` - 특정 사용자 정보 조회

### 거래
- `POST /api/transactions` - 코인 전송
- `GET /api/transactions` - 거래 내역 조회

### WebSocket
- `/ws/transactions` - 실시간 거래 업데이트

## 개발 가이드

### 환경 변수
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080
```

### 코드 컨벤션
- TypeScript strict 모드 사용
- 함수형 컴포넌트 사용
- CSS 변수 사용
- JSDoc 주석 작성

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 팀원

- 고재우, 나산하
- 김연지, 김채민
- 박지성, 이민재

# 코마데이 (comaDay)

React(TypeScript) 기반의 코인 랭킹/전송/로그인 데모 프로젝트입니다.

## 주요 기능
- 회원 로그인 (아이디/비밀번호)
- 실시간 랭킹 테이블(더미 데이터)
- 코인 전송 모달 (회원 번호로 전송)
- 컴포넌트/스타일 구조화, 백엔드 연동을 고려한 설계

## 실행 방법

### 1. NPM 사용
```bash
git clone https://github.com/jumokcom/comaday.git
cd comaday
npm install
npm start
```

### 2. Yarn 사용
```bash
git clone https://github.com/jumokcom/comaday.git
cd comaday
yarn install
yarn start
```

## 폴더 구조
```
comaday/
├─ public/
│  └─ index.html
├─ src/
│  ├─ App.tsx
│  ├─ App.css
│  ├─ index.tsx
│  └─ react-app-env.d.ts
├─ package.json
├─ tsconfig.json
└─ README.md
```

## 백엔드 연동 안내
- users, 로그인, 코인 전송, 랭킹 등은 실제 서버 API와 연동 시 주석 참고하여 수정하면 됩니다.
- 자세한 내용은 `src/App.tsx`의 `[백엔드 연동]` 주석 참고

---
문의: jumokcom (github)

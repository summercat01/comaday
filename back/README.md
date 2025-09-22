# 코마데이 백엔드

## PostgreSQL 설정

### 1. PostgreSQL 설치
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql

# Windows
# PostgreSQL 공식 사이트에서 인스톨러 다운로드
```

### 2. 데이터베이스 생성
```bash
# PostgreSQL 서비스 시작
sudo service postgresql start  # Linux
brew services start postgresql  # macOS

# PostgreSQL 콘솔 접속
sudo -u postgres psql

# 데이터베이스 생성
CREATE DATABASE comaday;
CREATE USER comaday_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE comaday TO comaday_user;
\q
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
# 서버 설정
PORT=4000

# PostgreSQL 데이터베이스 설정
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=comaday_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=comaday
DATABASE_SYNCHRONIZE=true
DATABASE_SSL=false

# Redis 설정 (Bull Queue용)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h

# 프론트엔드 URL
FRONTEND_URL=http://localhost:3000
```

### 4. 의존성 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## 주요 변경사항 (MySQL → PostgreSQL)

- `mysql2` → `pg` 및 `@types/pg` 패키지로 변경
- TypeORM 설정에서 `type: 'mysql'` → `type: 'postgres'`
- 기본 포트 3306 → 5432
- 기본 사용자명 'root' → 'postgres'
- PostgreSQL 최적화 connection pool 설정 추가

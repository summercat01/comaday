-- 코마데이 데이터베이스 초기화 스크립트

-- 데이터베이스가 존재하지 않으면 생성
CREATE DATABASE IF NOT EXISTS comaday;

-- 사용자 권한 설정
GRANT ALL PRIVILEGES ON DATABASE comaday TO comaday_user;

-- 연결 확인
\c comaday;

-- 기본 확장 프로그램 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 테이블은 TypeORM이 자동 생성하므로 여기서는 설정만

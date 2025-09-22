// PostgreSQL 연결 테스트 스크립트
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일에서 환경 변수 로드
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testConnection() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'comaday',
  });

  try {
    console.log('PostgreSQL 연결 테스트 시작...');
    await client.connect();
    console.log('✅ PostgreSQL 연결 성공!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL 버전:', result.rows[0].version);
    
    // 기본 테이블 존재 여부 확인
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    console.log('📋 현재 테이블 목록:');
    if (tables.rows.length === 0) {
      console.log('  - 테이블이 없습니다. 첫 실행 시 TypeORM이 자동으로 생성합니다.');
    } else {
      tables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ PostgreSQL 연결 실패:', error.message);
    console.log('\n📝 해결 방법:');
    console.log('1. PostgreSQL이 설치되어 있는지 확인');
    console.log('2. PostgreSQL 서비스가 실행 중인지 확인');
    console.log('3. .env 파일의 데이터베이스 설정 확인');
    console.log('4. 데이터베이스와 사용자가 생성되어 있는지 확인');
  } finally {
    await client.end();
  }
}

testConnection();

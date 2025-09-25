# 🚀 배포 시 방 배치도 이미지 문제 해결 체크리스트

## 📋 **문제 진단**

### 1. **캐시 문제 확인**
```bash
# 브라우저에서 강력 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)
# 또는 개발자 도구에서 "Disable cache" 체크 후 새로고침
```

### 2. **배포된 파일 확인**
```bash
# 실제 이미지 파일 존재 확인
curl -I https://your-domain.com/room-layout.png

# 파일 크기 및 수정 시간 확인
curl -v https://your-domain.com/room-layout.png
```

### 3. **빌드 과정 확인**
```bash
# 로컬에서 빌드 테스트
npm run build
ls -la .next/static/media/  # Next.js가 이미지를 어떻게 처리했는지 확인
ls -la public/              # public 폴더 파일들 확인
```

## 🔧 **해결 방안**

### **방안 1: 캐시 버스팅 (현재 적용됨)**
- 이미지 URL에 버전 쿼리 파라미터 추가
- 프로덕션: `?v=20240925`, 개발: `?v=현재시간`

### **방안 2: 파일명 변경**
```bash
# 기존 파일명을 고유하게 변경
mv public/room-layout.png public/room-layout-v2.png
```

### **방안 3: Next.js Image 컴포넌트 사용**
```typescript
import Image from 'next/image';

<Image
  src="/room-layout.png"
  alt="게임 방 배치도"
  width={800}
  height={600}
  style={{ maxHeight: '500px', objectFit: 'contain' }}
/>
```

### **방안 4: CDN/배포 서비스 캐시 무효화**
- Vercel: Deployment에서 "Redeploy" 선택
- Netlify: "Clear cache and deploy site" 선택
- AWS CloudFront: Invalidation 생성

## ⚠️ **주의사항**

1. **파일 경로**: `/public/room-layout.png` 정확한 위치 확인
2. **파일 권한**: 읽기 권한 확인
3. **파일 크기**: 너무 큰 이미지는 로딩 지연 발생
4. **브라우저 캐시**: 강력 새로고침으로 테스트

## 🔍 **디버깅**

### **개발자 도구에서 확인**
1. Network 탭에서 이미지 요청 상태 확인
2. Console에서 404 에러 또는 기타 오류 확인
3. Sources 탭에서 실제 로드된 이미지 확인

### **서버 로그 확인**
- 정적 파일 서빙 관련 로그
- 404 에러 로그
- 캐시 관련 헤더 확인

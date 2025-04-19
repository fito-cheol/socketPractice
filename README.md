# 실시간 채팅 & 그림판 애플리케이션

실시간으로 채팅하고 그림을 그릴 수 있는 웹 애플리케이션입니다. Socket.IO를 사용하여 실시간 통신을 구현했습니다.

## 주요 기능

- 실시간 채팅
- 실시간 그림 그리기
- 사용자 이름 설정
- 색상 및 선 두께 조절
- 캔버스 지우기

## 기술 스택

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Socket.IO Client

- Backend:
  - Node.js
  - Express
  - Socket.IO

## 설치 및 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/fito-cheol/socketPractice.git
cd socketPractice
```

2. 클라이언트 의존성 설치
```bash
npm install
```

3. 서버 의존성 설치
```bash
cd server
npm install
```

4. 서버 실행
```bash
npm run dev
```

5. 클라이언트 실행 (새로운 터미널에서)
```bash
cd ..
npm start
```

6. 브라우저에서 접속
```
http://localhost:3000
```

## 사용 방법

1. 사용자 이름 입력
2. 채팅 탭에서 메시지 전송
3. 그림판 탭에서 실시간 그림 그리기
   - 색상 선택
   - 선 두께 조절
   - 지우기 버튼으로 캔버스 초기화

## 라이센스

MIT 
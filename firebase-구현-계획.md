# Firebase 구현 계획

## 목적

이 문서는 `KCG 역량 진단` 프로젝트를 Firebase 기반으로 연결하기 위한 구현 계획서다.

목표는 다음과 같다.

- 사용자 설문 결과를 Firestore에 저장
- 관리자 페이지에서 Firestore 데이터를 읽어오기
- 추후 인증과 보안 규칙까지 확장 가능한 구조 만들기

## 구현 목표

1. 프론트엔드에 Firebase SDK 연결
2. 설문 제출 시 Firestore 저장
3. 관리자 페이지에서 저장된 결과 조회
4. 관리자 페이지에서 응답 삭제
5. 필요 시 관리자 인증 추가

## 작업 순서

### 1단계: Firebase 프로젝트 준비
해야 할 일:

- Firebase 프로젝트 생성
- Web App 등록
- Firebase config 발급
- Firestore Database 생성

결과물:
- Firebase 콘솔 프로젝트
- 웹앱용 config 객체

## 2단계: 프로젝트 파일 구조 정리
현재는 파일이 단순하다.
Firebase 도입 시 아래처럼 정리하는 걸 권장한다.

```text
동규/
  index.html
  admin.html
  style.css
  script.js
  firebase-config.js
  firebase-survey.js
  firebase-admin.js
  동규-프로젝트-분석.md
  firebase-데이터-설계.md
  firebase-구현-계획.md
```

### 파일 역할

- `firebase-config.js`
  - Firebase 초기화
  - app / db export

- `firebase-survey.js`
  - 설문 제출 저장 로직

- `firebase-admin.js`
  - 관리자 목록 조회 / 상세 조회 / 삭제 로직

초기에는 `script.js`에 합쳐도 되지만,
파일 분리가 유지보수에 더 좋다.

## 3단계: 설문 제출 로직 변경
현재 `submitResult()`는:
- payload 생성
- console.log 출력
- alert 표시

변경 목표:
- Firestore에 실제 저장

### 저장 흐름

1. 입력값 읽기
2. answers 확인
3. 카테고리별 점수 계산
4. 전체 평균 계산
5. payload 생성
6. `surveyResponses` 컬렉션에 `addDoc()`
7. 성공/실패 처리

### 저장 payload 구성

- `email`
- `name`
- `dept`
- `position`
- `answers`
- `results`
- `averageScore`
- `surveyVersion`
- `createdAt`
- `updatedAt`

## 4단계: 관리자 페이지 로직 변경
현재 `admin.html`은 localStorage 기반이다.

변경 목표:
- Firestore 기반으로 전환

### 필요한 기능

#### 목록 조회
- Firestore에서 응답 전체 조회
- 최신순 정렬
- 각 항목 표시

#### 상세 보기
- 문서 1건 데이터를 팝업 또는 모달로 표시

#### 삭제
- 문서 ID 기준 삭제

## 5단계: 인증 여부 결정
초기 MVP에서는 인증 없이 시작할 수도 있다.
하지만 운영을 생각하면 관리자 페이지는 인증이 필요하다.

### 선택지 A: 초기엔 인증 없이 개발
장점:
- 빠름
- 구현 단순

단점:
- 보안 취약

### 선택지 B: Firebase Authentication 적용
권장 방식:
- Google 로그인 또는 이메일 로그인
- 허용된 관리자 계정만 admin 접근 허용

현재 추천:
- **1차 구현은 인증 없이 로직 완성**
- **2차에서 관리자 인증 추가**

## 6단계: Firestore Security Rules 설계
최소 목표:

- 일반 공개 사용자는 설문 응답 생성만 가능
- 읽기/삭제는 관리자만 가능

초기 개발 단계에서는 테스트 모드로 시작할 수 있지만,
운영 전 반드시 보안 규칙 정리 필요.

예상 방향:

- `surveyResponses`:
  - create: 허용
  - read/delete: 관리자만 허용

## 프론트엔드 구현 세부 계획

### 설문 페이지 (`index.html`, `script.js`)

해야 할 변경:

- Firebase SDK import
- `submitResult()` 비동기 함수로 전환
- 제출 중 버튼 비활성화
- 중복 제출 방지
- 성공/실패 메시지 분기

추천 추가 기능:

- 제출 후 폼 초기화
- 완료 화면 분리
- 제출 중 로딩 표시

### 관리자 페이지 (`admin.html`)

해야 할 변경:

- localStorage 제거
- Firestore 조회 로직 적용
- 문서 ID 기반 삭제 구현
- createdAt 표시 형식 정리

추천 추가 기능:

- 검색 기능
- 이메일/부서 필터
- 평균 점수 기준 정렬

## 구현 시 주의사항

### 1. Firebase config 노출
웹 프로젝트 특성상 Firebase config는 프론트에 들어간다.
이는 일반적이지만,
보안은 **config 숨김이 아니라 Firestore Rules로 보장**해야 한다.

### 2. createdAt은 서버 시간 사용
반드시 가능하면 `serverTimestamp()` 사용.
그래야 클라이언트 시간 왜곡 영향을 줄일 수 있다.

### 3. 평균 점수는 저장해두는 편이 좋음
조회 때마다 다시 계산할 수도 있지만,
관리자 리스트와 통계에서 자주 쓰이므로 저장하는 것이 효율적이다.

### 4. answers 구조는 일관되게 유지
숫자 키 문자열(`"0"`, `"1"` 등) 또는 배열 중 하나로 통일해야 한다.
현재 구조를 최대한 덜 흔들려면 객체 형태를 유지해도 된다.

## 추천 1차 개발 범위

MVP 기준으로는 아래까지만 해도 충분하다.

### 사용자 페이지
- 설문 완료 후 Firestore 저장

### 관리자 페이지
- 목록 조회
- 상세 보기
- 삭제

### 문서화
- 분석 문서 업데이트
- 데이터 설계 문서 유지
- 구현 계획 문서 유지

## 완료 기준

다음이 되면 1차 완료로 본다.

- 사용자가 설문 제출 가능
- Firestore에 문서 생성됨
- 관리자 페이지에서 제출 데이터 조회 가능
- 관리자 페이지에서 개별 삭제 가능
- 관련 md 문서 최신 상태 유지

## 다음 단계 후보

1차 완료 후 가능한 확장:

1. 관리자 로그인
2. Firestore Rules 강화
3. 통계 대시보드 개선
4. CSV 다운로드
5. 설문 버전 관리
6. 응답 중간 저장
7. 모바일 최적화

## 현재 기준 실행 제안

다음 실제 작업은 아래 순서가 좋다.

1. Firebase config 파일 생성
2. `submitResult()`를 Firestore 저장으로 변경
3. `admin.html`을 Firestore 조회 방식으로 변경
4. 변경 내용을 `동규-프로젝트-분석.md`에 반영

## 결론

이 프로젝트는 구조가 단순해서 Firebase 연결이 어렵지 않다.
핵심은 아래 두 가지다.

- 설문 페이지: 저장
- 관리자 페이지: 조회/삭제

즉, 현재 가장 먼저 구현할 기능은 **localStorage 기반 가짜 데이터 흐름을 Firestore 기반 실제 데이터 흐름으로 바꾸는 것**이다.

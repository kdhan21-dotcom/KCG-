# Firebase 설정 가이드

## 목적

이 문서는 `KCG 역량 진단` 프로젝트를 다른 Firebase 계정 / 다른 Firebase 프로젝트로 옮길 때,
어떤 설정만 바꾸면 되는지 정리한 가이드다.

핵심은 다음과 같다.

- 프로젝트 문서는 그대로 재사용한다.
- 코드도 대부분 그대로 재사용한다.
- **Firebase 설정값만 교체**하면 된다.

즉, 다른 사람 Firebase 계정으로 넘길 때 문서를 새로 만드는 방식이 아니라,
설정 교체 방식으로 인수인계하는 게 목표다.

## 유지되는 파일

아래 문서들은 Firebase 계정이 바뀌어도 그대로 유지한다.

- `동규-프로젝트-분석.md`
- `firebase-데이터-설계.md`
- `firebase-구현-계획.md`
- `firebase-설정-가이드.md`

이유:
- 이 파일들은 **프로젝트 설계 문서**이기 때문
- 특정 계정 전용 문서가 아니라 프로젝트 공용 문서임

## 교체되는 파일

아래는 환경에 따라 교체되는 파일이다.

- `firebase-config.js`

즉, Firebase 프로젝트가 바뀌면 보통 이 파일만 새 값으로 바꾸면 된다.

## 사용 방식

### 현재 권장 구조

- `firebase-config.sample.js` → 템플릿 파일
- `firebase-config.js` → 실제 연결용 파일

의미:
- sample 파일은 예시/양식
- 실제 값은 `firebase-config.js`에만 입력

## 다른 사람 Firebase로 옮기는 순서

### 1. Firebase 프로젝트 생성
새 담당자가 자신의 Firebase 계정에서 프로젝트를 만든다.

예:
- Firebase Console 접속
- 새 프로젝트 생성

### 2. Web App 등록
프로젝트 안에서 웹앱을 등록한다.

필요 이유:
- 웹용 Firebase config를 받기 위해서

### 3. Firebase config 발급
콘솔에서 아래 항목이 포함된 config를 확인한다.

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

### 4. `firebase-config.js` 교체
`firebase-config.sample.js`를 참고해서 실제 `firebase-config.js`를 작성하거나 교체한다.

예:

```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "실제값",
  authDomain: "실제값",
  projectId: "실제값",
  storageBucket: "실제값",
  messagingSenderId: "실제값",
  appId: "실제값",
  measurementId: "실제값"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db, firebaseConfig };
```

### 5. Firestore Database 생성
Firestore Database를 생성한다.

현재 프로젝트는 설문 결과를 아래 컬렉션에 저장한다.

- `surveyResponses`

### 6. Firestore Security Rules 적용
운영 전에는 반드시 Rules를 점검한다.

최소 방향:
- 설문 제출은 허용
- 읽기/삭제는 관리자만 허용

초기 테스트 중이면 임시 완화 가능하지만,
운영 전 보안 규칙 정리 필요.

### 7. 브라우저 테스트
아래를 확인한다.

- `index.html`에서 설문 제출 되는지
- `admin.html`에서 목록 조회 되는지
- 삭제 동작 되는지

## 중요한 원칙

### 1. 문서는 새로 만들지 않는다
Firebase 계정이 바뀐다고 해서 아래를 새로 만들 필요는 없다.

- 분석 문서
- 데이터 설계 문서
- 구현 계획 문서

이 문서들은 프로젝트 기준으로 유지한다.

### 2. 설정만 교체한다
바뀌는 건 보통 아래뿐이다.

- Firebase 프로젝트
- config 값
- Firestore Rules
- 관리자 계정

즉, **계정이 바뀌면 문서를 복제하는 게 아니라 설정만 교체**한다.

### 3. Firebase config 노출 자체는 일반적이다
웹 프로젝트에서는 Firebase config가 프론트 코드에 들어가는 것이 일반적이다.

보안의 핵심은 아래다.

- Firestore Security Rules
- Authentication
- 관리자 권한 제어

즉, config를 숨기는 것보다 권한 설계가 더 중요하다.

## 추천 인수인계 방식

프로젝트를 다른 사람에게 넘길 때는 아래만 전달하면 충분하다.

1. 프로젝트 소스 전체
2. md 문서 전체
3. `firebase-config.sample.js` 템플릿
4. "본인 Firebase로 `firebase-config.js`만 교체해서 사용" 안내

## 결론

이 프로젝트는 Firebase 계정이 바뀌어도 문서를 새로 만들 필요가 없다.

핵심은 다음 한 줄로 정리된다.

> **프로젝트 문서는 유지하고, Firebase 설정 파일만 교체한다.**

이 구조로 가면:
- 개발 중에는 현재 Firebase로 빠르게 작업 가능
- 나중에는 다른 담당자 Firebase로 쉽게 이전 가능
- 유지보수와 인수인계가 훨씬 쉬워진다.

# Firestore Rules 가이드

## 목적

이 문서는 `KCG 역량 진단` 프로젝트에서 사용할 Firestore Security Rules 정리 문서다.

현재 프로젝트 요구사항은 아래와 같다.

- 설문 사용자는 로그인 없이 응답 제출 가능
- 관리자만 응답 목록 조회 가능
- 관리자만 응답 삭제 가능
- 제출된 응답은 수정 불가

## 현재 권장 방향

현재 루트에 `firestore.rules` 파일을 두었고,
기본 권장 규칙은 아래 정책을 따른다.

### 정책 요약

- `surveyResponses`
  - `create`: 허용
  - `read`: 관리자만 허용
  - `delete`: 관리자만 허용
  - `update`: 금지

- 그 외 문서:
  - 모두 거부

## 왜 이렇게 하는가

이 프로젝트는 일반 사용자가 설문을 제출해야 하므로,
응답 생성(create)은 열어둘 필요가 있다.

반면 관리자 페이지는 민감한 데이터를 다루므로,
조회(read)와 삭제(delete)는 관리자만 가능해야 한다.

또 설문 결과는 제출 후 수정하지 않는 성격이 자연스럽기 때문에,
update는 막는 것이 안전하다.

## 현재 rules 파일 설명

파일 위치:
- `/Users/kwakdonghyeun/Desktop/동규/firestore.rules`

핵심 함수:

```js
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
```

의미:
- Firebase Authentication 로그인 상태여야 함
- 사용자 토큰에 `admin == true` 커스텀 클레임이 있어야 함

즉, **운영 기준으로는 Firebase Authentication과 함께 써야 의미가 있다.**

## 중요한 현재 상태

지금 admin 페이지 로그인은
- `admin-auth-config.js` 기반의 프론트 임시 로그인
- Firebase Authentication 아님

그래서 현재 `firestore.rules`를 엄격하게 적용하면,
admin 페이지는 Firestore read/delete 권한이 없어질 수 있다.

## 지금 단계에서 가능한 선택지

### 1안. 개발/테스트용 Rules
빠르게 테스트하려면 임시로 아래처럼 열 수 있다.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

장점:
- 바로 테스트 가능

단점:
- 보안 거의 없음
- 운영 금지

### 2안. 현재 추천 운영 방향
- 사용자 설문 제출은 create 허용
- 관리자 기능은 Firebase Authentication 붙인 뒤 read/delete 허용

즉,
현재는 UI 작업과 테스트를 하고,
운영 전에는 반드시 Authentication + Rules를 함께 마무리하는 게 좋다.

## 추천 적용 순서

### 개발 중
1. Firestore Database 생성
2. 임시 완화 Rules 또는 테스트용 Rules 사용
3. 설문 제출/조회 동작 확인

### 운영 전
1. Firebase Authentication 적용
2. 관리자 계정 로그인 구조 변경
3. admin 계정에 custom claim(`admin: true`) 부여
4. `firestore.rules` 운영안 적용

## 배포 전 체크리스트

- Firestore Database 생성됨
- `surveyResponses` 컬렉션 생성 가능
- 설문 제출 성공 확인
- 관리자 조회 성공 확인
- 관리자 삭제 성공 확인
- 테스트용 Rules 제거
- 운영용 Rules 적용 완료

## 결론

현재 루트의 `firestore.rules`는 **운영 기준 권장안**에 가깝다.

즉:
- 지금 바로 무조건 그대로 적용하기보다는
- 현재 개발 상태를 보고 임시 Rules로 테스트한 뒤
- 최종적으로 Firebase Authentication과 함께 운영안으로 가는 게 맞다.

한 줄 요약:

> **지금은 테스트를 위해 완화 가능하지만, 최종 운영은 관리자 인증 + 제한된 Rules로 가야 한다.**

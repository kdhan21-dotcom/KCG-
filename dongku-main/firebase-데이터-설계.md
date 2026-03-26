# Firebase 데이터 설계

## 목적

`KCG 역량 진단` 프로젝트의 백엔드를 Firebase로 구성하기 위한 데이터 구조 설계 문서다.

이 문서는 다음 목적을 가진다.

- 설문 응답 데이터를 어떤 형태로 저장할지 정의
- 관리자 페이지에서 어떤 방식으로 조회할지 정리
- 프론트엔드에서 필요한 저장/조회 로직의 기준 문서 역할 수행

## Firebase 사용 방향

예정 구성:

- **Firebase Authentication**: 관리자 로그인용(선택 또는 추후 적용)
- **Cloud Firestore**: 설문 결과 저장 및 조회
- **Firebase Hosting**: 정적 웹 배포 가능

우선순위는 다음과 같다.

1. Firestore 연결
2. 설문 결과 저장
3. 관리자 조회
4. 관리자 인증
5. 통계 고도화

## 저장 대상 데이터

설문 제출 시 저장할 데이터는 크게 4종류다.

### 1. 사용자 기본 정보
- 이메일
- 이름
- 회사명
- 직급
- 부서

### 2. 원본 응답
- 24개 문항 각각의 1~5점 응답값

### 3. 계산된 결과
- 8개 카테고리별 평균 점수
- 전체 평균 점수
- 등급/상태값(선택)

### 4. 시스템 메타 정보
- 제출 시각
- 설문 버전
- 생성일/수정일

## 권장 컬렉션 구조

### 컬렉션: `surveyResponses`

가장 단순하고 관리하기 쉬운 1차 구조다.
응답 1건당 문서 1개를 저장한다.

예시:

```text
surveyResponses/
  {documentId}
```

## 문서 구조 예시

```json
{
  "email": "user@example.com",
  "name": "홍길동",
  "company": "KCG",
  "position": "대리",
  "dept": "개발팀",
  "answers": {
    "0": 4,
    "1": 5,
    "2": 3,
    "3": 4,
    "4": 4,
    "5": 3,
    "6": 5,
    "7": 4,
    "8": 4,
    "9": 3,
    "10": 4,
    "11": 5,
    "12": 4,
    "13": 4,
    "14": 5,
    "15": 4,
    "16": 4,
    "17": 5,
    "18": 3,
    "19": 4,
    "20": 4,
    "21": 5,
    "22": 4,
    "23": 5
  },
  "results": [
    {
      "category": "감정식별력",
      "score": 4.0
    },
    {
      "category": "패턴인식",
      "score": 3.67
    },
    {
      "category": "결과예측",
      "score": 4.33
    },
    {
      "category": "감정조절·활용",
      "score": 4.0
    },
    {
      "category": "내적동기",
      "score": 4.33
    },
    {
      "category": "낙관성",
      "score": 4.33
    },
    {
      "category": "공감",
      "score": 3.67
    },
    {
      "category": "목적지향",
      "score": 4.67
    }
  ],
  "averageScore": 4.13,
  "surveyVersion": "v1",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

## 필드 설명

### 기본 정보 필드

- `email`: 사용자 이메일, 필수
- `name`: 사용자 이름
- `company`: 회사명
- `position`: 직급
- `dept`: 부서

### 응답 필드

- `answers`: 문항 번호를 key로 가지는 객체
- 값은 1~5 정수

예:

```json
"answers": {
  "0": 5,
  "1": 4,
  "2": 3
}
```

### 결과 필드

- `results`: 카테고리별 점수 배열
- `averageScore`: 전체 평균

### 메타 필드

- `surveyVersion`: 문항 버전 관리용
- `createdAt`: 최초 생성 시간
- `updatedAt`: 수정 시간

## 왜 이런 구조를 쓰는가

이 구조의 장점:

- 한 응답에 필요한 정보가 한 문서에 다 들어 있음
- 관리자 리스트/상세 보기 구현이 쉬움
- 프론트엔드에서 바로 사용 가능
- 초기 MVP에 적합함

단점:

- 응답 수가 매우 많아지면 통계용 집계가 비효율적일 수 있음
- 이메일 기준 중복 응답 관리가 별도 필요함

하지만 현재 프로젝트 규모에서는 가장 실용적이다.

## 관리자 페이지에서 필요한 조회 로직

관리자 페이지는 최소한 아래 기능이 필요하다.

### 1. 전체 응답 목록 조회
필요 데이터:
- 이름
- 이메일
- 회사명
- 직급
- 부서
- 전체 평균 점수
- 제출 시각

정렬 기준:
- 최신순 (`createdAt desc`)

### 2. 개별 응답 상세 조회
필요 데이터:
- 사용자 기본 정보
- 24개 응답값
- 8개 카테고리 점수
- 전체 평균
- 제출 시각

### 3. 응답 삭제
문서 ID 기준 삭제

## 프론트엔드에서 필요한 CRUD 로직

### Create
설문 제출 시:
- 사용자 정보 수집
- answers 저장
- results 계산
- averageScore 계산
- Firestore `surveyResponses` 컬렉션에 문서 추가

### Read
관리자 페이지에서:
- 전체 목록 불러오기
- 상세 결과 보기

### Delete
관리자 페이지에서:
- 특정 응답 문서 삭제

### Update
초기 버전에서는 불필요

이 프로젝트는 설문 제출 후 수정하지 않는 구조가 자연스럽다.

## 추천 문서 ID 전략

기본 추천:
- Firestore 자동 생성 ID 사용

이유:
- 충돌 방지 쉬움
- 구현 단순함
- 관리자 삭제/조회에 충분함

필요하면 추가 필드로 아래를 보관:
- `email`
- `createdAt`

## 추후 확장 가능 구조

향후 아래 컬렉션을 추가할 수 있다.

### `admins`
관리자 계정 정보

예시:

```json
{
  "email": "admin@example.com",
  "role": "superadmin",
  "createdAt": "serverTimestamp"
}
```

### `surveys`
설문 버전 자체를 관리하고 싶을 때 사용

예시:

```json
{
  "surveyVersion": "v1",
  "title": "KCG 역량 진단",
  "questionCount": 24,
  "isActive": true,
  "createdAt": "serverTimestamp"
}
```

## 보안 고려사항

초기에는 빠른 개발을 위해 단순하게 시작할 수 있지만,
실제 운영 시 아래가 필요하다.

- 관리자 페이지 접근 제한
- Firestore Security Rules 설정
- 일반 사용자는 쓰기만 가능하거나, 공개 쓰기도 신중히 검토
- 관리자만 읽기/삭제 가능

## 최종 권장 방향

1. 응답 데이터는 `surveyResponses` 컬렉션에 저장
2. 문서 1개에 응답 1건 전체를 저장
3. 관리자 페이지는 최신순 목록 + 상세 조회 + 삭제 제공
4. 이후 Authentication과 Security Rules를 붙여 운영 안정성 강화

## 현재 기준 결론

현재 단계에서는 아래 구조가 가장 현실적이다.

- 컬렉션: `surveyResponses`
- 문서: 응답 1건 전체 저장
- 저장 내용: 사용자 정보 + answers + results + averageScore + createdAt

이 구조로 구현하면 지금 프론트엔드 구조와도 가장 자연스럽게 연결된다.

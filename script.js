import { db } from "./firebase-config.js";
import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const questions = [
  "나는 지금 느끼는 감정을 비교적 정확한 단어로 표현할 수 있다.",
  "기분이 좋지 않을 때, 그것이 불안·짜증·실망·혼란 중 무엇에 가까운지 구분할 수 있다.",
  "중요한 대화나 결정 전에 내 감정 상태를 점검하는 편이다.",
  "나는 스트레스를 받을 때 반복적으로 나타나는 나의 반응 패턴을 알고 있다.",
  "특정 사람이나 상황에서 내가 예민해지는 이유를 어느 정도 설명할 수 있다.",
  "후회했던 행동이 어떤 상황에서 반복되는지 인식하고 있다.",
  "말하거나 행동하기 전에 내 선택의 결과를 먼저 생각하는 편이다.",
  "감정이 강하게 올라와도 단기 영향과 장기 영향을 구분해 보려고 한다.",
  "내 결정이 나뿐 아니라 팀과 관계에 미칠 영향까지 고려한다.",
  "감정이 격해져도 즉각 반응하지 않고 한 템포 멈출 수 있다.",
  "긴장이나 압박을 느낄 때 그것을 준비와 집중의 에너지로 전환하려고 한다.",
  "감정 때문에 판단이 흐려질 때 스스로 균형을 회복하는 방법이 있다.",
  "외부 보상이 크지 않아도 일이 의미 있다고 느끼면 몰입할 수 있다.",
  "나는 목표를 추진할 때 스스로 납득할 만한 이유를 찾는 편이다.",
  "누가 시켜서보다 내가 중요하다고 느끼는 일에 더 지속적으로 힘을 낸다.",
  "문제가 생기면 불가능한 이유보다 가능한 대안을 먼저 찾으려 한다.",
  "실패나 실수를 겪어도 배울 점을 찾고 다시 시도하려는 편이다.",
  "불확실한 상황에서도 내가 통제할 수 있는 부분에 집중한다.",
  "상대의 말뿐 아니라 그 뒤에 있는 감정까지 이해하려고 노력한다.",
  "누군가 부정적으로 반응할 때도 그 사람 입장에서 이유를 생각해본다.",
  "피드백이나 조언을 할 때 상대의 감정 상태를 고려하는 편이다.",
  "나는 일상의 업무를 개인적 가치나 더 큰 목적과 연결해 생각하려 한다.",
  "중요한 선택에서는 ‘무엇이 유리한가’뿐 아니라 ‘무엇이 의미 있는가’도 본다.",
  "단기 성과보다 장기적으로 옳고 가치 있는 방향을 중시하는 편이다."
];

const answers = {};
const categories = [
  "감정식별력", "패턴인식", "결과예측", "감정조절·활용",
  "내적동기", "낙관성", "공감", "목적지향"
];

const detailMap = [
  {
    title: "감정식별력",
    desc: [
      "감정을 정확하게 인식하고 구분하는 능력",
      "불안·짜증·실망 등 감정의 종류를 명확히 파악",
      "의사결정 전 감정 상태 점검"
    ]
  },
  {
    title: "패턴인식",
    desc: [
      "스트레스 상황에서 반복되는 반응 이해",
      "특정 상황에서 예민해지는 이유 파악",
      "반복되는 행동 패턴 인식"
    ]
  },
  {
    title: "결과예측",
    desc: [
      "행동 전 결과를 미리 고려",
      "단기 vs 장기 영향 구분",
      "팀과 관계까지 영향 고려"
    ]
  },
  {
    title: "감정조절·활용",
    desc: [
      "즉각 반응 대신 멈춤",
      "압박을 에너지로 전환",
      "감정 균형 회복 능력"
    ]
  },
  {
    title: "내적동기",
    desc: [
      "외부 보상 없이도 몰입",
      "스스로 납득하는 이유 찾기",
      "내가 중요하다고 느끼는 일에 집중"
    ]
  },
  {
    title: "낙관성",
    desc: [
      "가능한 대안 탐색",
      "실패에서 학습",
      "통제 가능한 것에 집중"
    ]
  },
  {
    title: "공감",
    desc: [
      "상대 감정까지 이해",
      "타인의 입장에서 사고",
      "피드백 시 감정 고려"
    ]
  },
  {
    title: "목적지향",
    desc: [
      "일을 가치와 연결",
      "의미 중심 의사결정",
      "장기적 방향 중시"
    ]
  }
];

let isSubmitting = false;

function startSurvey() {
  const email = document.getElementById("email").value.trim();
  if (!email) {
    alert("이메일은 필수 입력 항목입니다.");
    return;
  }

  document.getElementById("loginCard").style.display = "none";
  document.getElementById("survey").style.display = "block";

  render();
}

function render() {
  const survey = document.getElementById("survey");

  survey.innerHTML = `
    <div class="card">
      <div class="section-title">Know Yourself</div>
      <div class="section-main">감정식별력</div>
      <div class="section-desc">
        현재 느끼는 감정을 정확하게 식별하고 표현하는 능력
      </div>
    </div>
  `;

  questions.forEach((q, i) => {
    const labels = [
      ["1점", "전혀 그렇지 않다"],
      ["2점", "그렇지 않은 편이다"],
      ["3점", "보통이다"],
      ["4점", "그런 편이다"],
      ["5점", "매우 그렇다"]
    ];

    let scale = "";

    labels.forEach((l, s) => {
      scale += `
      <input type="radio" name="q${i}" id="q${i}_${s}" onclick="save(${i},${s + 1})">
      <label for="q${i}_${s}">
        <strong>${l[0]}</strong>
        ${l[1]}
      </label>
      `;
    });

    survey.innerHTML += `
    <div class="question">
      <div class="q-head">
        <div class="q-num">${i + 1}</div>
        <div class="q-text">${q}</div>
      </div>
      <div class="scale">${scale}</div>
    </div>
    `;
  });

  survey.innerHTML += `
    <div style="margin-top:20px;">
      <button onclick="showResult()">결과 보기</button>
    </div>
  `;
}

function save(i, v) {
  answers[i] = v;
  updateProgress();
}

function updateProgress() {
  const done = Object.keys(answers).length;
  const total = questions.length;
  const percent = (done / total) * 100;

  const bar = document.getElementById("bar");
  const progressText = document.getElementById("progressText");
  const percentNode = document.getElementById("progressPercent");
  const desktopBar = document.getElementById("barDesktop");
  const desktopText = document.getElementById("progressTextDesktop");
  const desktopPercent = document.getElementById("progressPercentDesktop");

  if (bar) bar.style.width = percent + "%";
  if (progressText) progressText.innerText = `${done} / ${total} 문항 완료`;
  if (percentNode) percentNode.innerText = `${Math.round(percent)}%`;

  if (desktopBar) desktopBar.style.width = percent + "%";
  if (desktopText) desktopText.innerText = `${done} / ${total} 문항 완료`;
  if (desktopPercent) desktopPercent.innerText = `${Math.round(percent)}%`;
}

function calculateResults() {
  const results = [];

  categories.forEach((cat, idx) => {
    const start = idx * 3;
    const avg = (
      answers[start] +
      answers[start + 1] +
      answers[start + 2]
    ) / 3;

    results.push({
      category: cat,
      score: Number(avg.toFixed(2))
    });
  });

  return results;
}

function calculateAverageScore(results) {
  if (!results.length) return 0;
  const total = results.reduce((sum, item) => sum + item.score, 0);
  return Number((total / results.length).toFixed(2));
}

function getLevel(avg) {
  if (avg >= 4.2) return { label: "탁월한 강점", color: "green" };
  if (avg >= 3.6) return { label: "안정적 역량", color: "blue" };
  if (avg >= 3.0) return { label: "개발 필요", color: "yellow" };
  return { label: "우선 개발 과제", color: "red" };
}

function showResult() {
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const company = document.getElementById("company").value;
  const position = document.getElementById("position").value;
  const dept = document.getElementById("dept").value;

  if (Object.keys(answers).length < questions.length) {
    alert("모든 문항에 응답해주세요.");
    return;
  }

  const results = calculateResults();

  let html = `
    <div class="card" style="margin-bottom:16px;">
      <h3>📊 진단 결과</h3>

      <div class="user-card">
        <div class="user-avatar">
          ${(name || "U").charAt(0)}
        </div>

        <div class="user-info-box">
          <div class="user-name">
            ${name || "이름 미입력"}
            <span style="font-weight:400;color:#64748b;">
              (${position || "-"})
            </span>
          </div>

          <div class="user-sub">
            ${company || "회사명 미입력"}
          </div>

          <div class="user-sub">
            ${dept || "부서 미입력"}
          </div>

          <div class="user-meta">
            ${email}
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top:20px;">
      <button id="submitButton" onclick="submitResult()">제출하기</button>
    </div>

    <div class="card">
      <div class="result-grid">
  `;

  detailMap.forEach((cat, idx) => {
    const avg = results[idx].score;
    const level = getLevel(avg);

    html += `
      <div class="result-card">
        <div class="result-title">${cat.title}</div>
        <div class="result-score">
          ${avg.toFixed(2)}점
          <span class="badge ${level.color}">${level.label}</span>
        </div>
        <div class="result-desc">
          ${cat.desc[0]}<br>
          ${cat.desc[1]}<br>
          ${cat.desc[2]}
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  document.getElementById("survey").innerHTML = html;
}

async function submitResult() {
  if (isSubmitting) return;

  const email = document.getElementById("email").value.trim();
  const name = document.getElementById("name").value.trim();
  const company = document.getElementById("company").value.trim();
  const position = document.getElementById("position").value.trim();
  const dept = document.getElementById("dept").value.trim();

  const results = calculateResults();
  const averageScore = calculateAverageScore(results);
  const submitButton = document.getElementById("submitButton");

  const payload = {
    email,
    name,
    company,
    position,
    dept,
    answers: { ...answers },
    results,
    averageScore,
    surveyVersion: "v1",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    isSubmitting = true;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerText = "제출 중...";
    }

    await addDoc(collection(db, "surveyResponses"), payload);

    alert("제출이 완료되었습니다.");

    if (submitButton) {
      submitButton.innerText = "제출 완료";
    }
  } catch (error) {
    console.error("제출 실패:", error);
    alert("제출 중 오류가 발생했습니다. Firebase 설정과 Firestore 권한을 확인해주세요.");

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerText = "제출하기";
    }
  } finally {
    isSubmitting = false;
  }
}

function syncViewportMode() {
  if (window.innerWidth > 1024) {
    document.body.classList.add("has-desktop-progress");
  } else {
    document.body.classList.remove("has-desktop-progress");
  }
}

window.addEventListener("resize", syncViewportMode);
syncViewportMode();

window.startSurvey = startSurvey;
window.save = save;
window.showResult = showResult;
window.submitResult = submitResult;

import { db } from "./firebase-config.js";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const questionGroups = [
  {
    axis: "Know Yourself",
    title: "감정식별력",
    sectionDesc: "현재 느끼는 감정을 정확하게 식별하고 표현하는 능력",
    desc: [
      "감정을 정확하게 인식하고 구분하는 능력",
      "불안·짜증·실망 등 감정의 종류를 명확히 파악",
      "의사결정 전 감정 상태 점검"
    ],
    items: [
      "나는 지금 느끼는 감정을 비교적 정확한 단어로 표현할 수 있다.",
      "기분이 좋지 않을 때, 그것이 불안·짜증·실망·혼란 중 무엇에 가까운지 구분할 수 있다.",
      "중요한 대화나 결정 전에 내 감정 상태를 점검하는 편이다."
    ]
  },
  {
    axis: "Know Yourself",
    title: "패턴인식",
    sectionDesc: "반복되는 감정·행동 반응 패턴을 인식하는 능력",
    desc: [
      "스트레스 상황에서 반복되는 반응 이해",
      "특정 상황에서 예민해지는 이유 파악",
      "반복되는 행동 패턴 인식"
    ],
    items: [
      "나는 스트레스를 받을 때 반복적으로 나타나는 나의 반응 패턴을 알고 있다.",
      "특정 사람이나 상황에서 내가 예민해지는 이유를 어느 정도 설명할 수 있다.",
      "후회했던 행동이 어떤 상황에서 반복되는지 인식하고 있다."
    ]
  },
  {
    axis: "Choose Yourself",
    title: "결과예측",
    sectionDesc: "선택의 단기·장기 영향을 따져보는 능력",
    desc: [
      "행동 전 결과를 미리 고려",
      "단기 vs 장기 영향 구분",
      "팀과 관계까지 영향 고려"
    ],
    items: [
      "말하거나 행동하기 전에 내 선택의 결과를 먼저 생각하는 편이다.",
      "감정이 강하게 올라와도 단기 영향과 장기 영향을 구분해 보려고 한다.",
      "내 결정이 나뿐 아니라 팀과 관계에 미칠 영향까지 고려한다."
    ]
  },
  {
    axis: "Choose Yourself",
    title: "감정조절·활용",
    sectionDesc: "감정을 억누르기보다 적절히 다루고 활용하는 능력",
    desc: [
      "즉각 반응 대신 멈춤",
      "압박을 에너지로 전환",
      "감정 균형 회복 능력"
    ],
    items: [
      "감정이 격해져도 즉각 반응하지 않고 한 템포 멈출 수 있다.",
      "긴장이나 압박을 느낄 때 그것을 준비와 집중의 에너지로 전환하려고 한다.",
      "감정 때문에 판단이 흐려질 때 스스로 균형을 회복하는 방법이 있다."
    ]
  },
  {
    axis: "Choose Yourself",
    title: "내적동기",
    sectionDesc: "외부 보상보다 내적 의미와 가치로 움직이는 능력",
    desc: [
      "외부 보상 없이도 몰입",
      "스스로 납득하는 이유 찾기",
      "내가 중요하다고 느끼는 일에 집중"
    ],
    items: [
      "외부 보상이 크지 않아도 일이 의미 있다고 느끼면 몰입할 수 있다.",
      "나는 목표를 추진할 때 스스로 납득할 만한 이유를 찾는 편이다.",
      "누가 시켜서보다 내가 중요하다고 느끼는 일에 더 지속적으로 힘을 낸다."
    ]
  },
  {
    axis: "Choose Yourself",
    title: "낙관성",
    sectionDesc: "어려움 속에서도 가능성과 통제 가능한 영역을 보는 능력",
    desc: [
      "가능한 대안 탐색",
      "실패에서 학습",
      "통제 가능한 것에 집중"
    ],
    items: [
      "문제가 생기면 불가능한 이유보다 가능한 대안을 먼저 찾으려 한다.",
      "실패나 실수를 겪어도 배울 점을 찾고 다시 시도하려는 편이다.",
      "불확실한 상황에서도 내가 통제할 수 있는 부분에 집중한다."
    ]
  },
  {
    axis: "Give Yourself",
    title: "공감",
    sectionDesc: "타인의 감정과 관점을 이해하고 적절히 반응하는 능력",
    desc: [
      "상대 감정까지 이해",
      "타인의 입장에서 사고",
      "피드백 시 감정 고려"
    ],
    items: [
      "상대의 말뿐 아니라 그 뒤에 있는 감정까지 이해하려고 노력한다.",
      "누군가 부정적으로 반응할 때도 그 사람 입장에서 이유를 생각해본다.",
      "피드백이나 조언을 할 때 상대의 감정 상태를 고려하는 편이다."
    ]
  },
  {
    axis: "Give Yourself",
    title: "목적지향",
    sectionDesc: "일상의 선택을 더 큰 가치와 의미에 연결하는 능력",
    desc: [
      "일을 가치와 연결",
      "의미 중심 의사결정",
      "장기적 방향 중시"
    ],
    items: [
      "나는 일상의 업무를 개인적 가치나 더 큰 목적과 연결해 생각하려 한다.",
      "중요한 선택에서는 ‘무엇이 유리한가’뿐 아니라 ‘무엇이 의미 있는가’도 본다.",
      "단기 성과보다 장기적으로 옳고 가치 있는 방향을 중시하는 편이다."
    ]
  }
];

const questions = questionGroups.flatMap((group) => group.items);
const answers = {};
const categories = questionGroups.map((group) => group.title);
const detailMap = questionGroups.map((group) => ({
  title: group.title,
  desc: group.desc
}));

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

  survey.innerHTML = "";

  const labels = [
    ["1점", "전혀 그렇지 않다"],
    ["2점", "그렇지 않은 편이다"],
    ["3점", "보통이다"],
    ["4점", "그런 편이다"],
    ["5점", "매우 그렇다"]
  ];

  let questionIndex = 0;

  questionGroups.forEach((group) => {
    survey.innerHTML += `
      <div class="card">
        <div class="section-title">${group.axis}</div>
        <div class="section-main">${group.title}</div>
        <div class="section-desc">
          ${group.sectionDesc}
        </div>
      </div>
    `;

    group.items.forEach((q) => {
      let scale = "";

      labels.forEach((l, s) => {
        scale += `
          <input type="radio" name="q${questionIndex}" id="q${questionIndex}_${s}" onclick="save(${questionIndex},${s + 1})">
          <label for="q${questionIndex}_${s}">
            <strong>${l[0]}</strong>
            ${l[1]}
          </label>
        `;
      });

      survey.innerHTML += `
        <div class="question">
          <div class="q-head">
            <div class="q-num">${questionIndex + 1}</div>
            <div class="q-text">${q}</div>
          </div>
          <div class="scale">${scale}</div>
        </div>
      `;

      questionIndex += 1;
    });
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

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatScore(value) {
  return `${toNumber(value).toFixed(2)}점`;
}

function formatDiff(value) {
  const num = toNumber(value);
  return `${num > 0 ? "+" : ""}${num.toFixed(2)}점`;
}

function getDiffColor(diff) {
  if (diff > 0) return "#16a34a";
  if (diff < 0) return "#dc2626";
  return "#64748b";
}

async function getBenchmarkStats(myResults) {
  try {
    const snapshot = await getDocs(collection(db, "surveyResponses"));

    const rows = snapshot.docs
      .map((doc) => doc.data())
      .filter(
        (item) =>
          Array.isArray(item.results) &&
          item.results.length === categories.length
      );

    if (!rows.length) {
      return {
        hasBenchmark: false,
        sourceCount: 0,
        totalAverage: calculateAverageScore(myResults),
        categoryAverages: myResults.map((item) => ({ ...item }))
      };
    }

    const categoryTotals = Array(categories.length).fill(0);
    let overallTotal = 0;

    rows.forEach((row) => {
      const rowResults = row.results.map((item) => ({
        category: item.category,
        score: toNumber(item.score)
      }));

      const rowAverage = Number.isFinite(Number(row.averageScore))
        ? toNumber(row.averageScore)
        : calculateAverageScore(rowResults);

      overallTotal += rowAverage;

      rowResults.forEach((item, idx) => {
        categoryTotals[idx] += item.score;
      });
    });

    return {
      hasBenchmark: true,
      sourceCount: rows.length,
      totalAverage: Number((overallTotal / rows.length).toFixed(2)),
      categoryAverages: categories.map((category, idx) => ({
        category,
        score: Number((categoryTotals[idx] / rows.length).toFixed(2))
      }))
    };
  } catch (error) {
    console.error("전체 평균 조회 실패:", error);

    return {
      hasBenchmark: false,
      sourceCount: 0,
      totalAverage: calculateAverageScore(myResults),
      categoryAverages: myResults.map((item) => ({ ...item }))
    };
  }
}

function getLevel(avg) {
  if (avg >= 4.2) return { label: "탁월한 강점", color: "green" };
  if (avg >= 3.6) return { label: "안정적 역량", color: "blue" };
  if (avg >= 3.0) return { label: "개발 필요", color: "yellow" };
  return { label: "우선 개발 과제", color: "red" };
}

async function showResult() {
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const company = document.getElementById("company").value;
  const position = document.getElementById("position").value;
  const dept = document.getElementById("dept").value;
  const survey = document.getElementById("survey");

  if (Object.keys(answers).length < questions.length) {
    alert("모든 문항에 응답해주세요.");
    return;
  }

  survey.innerHTML = `
    <div class="card">
      <h3>📊 진단 결과를 분석하는 중입니다...</h3>
      <p style="color:#64748b;margin-top:8px;">
        전체 평균과 비교 데이터를 불러오고 있습니다.
      </p>
    </div>
  `;

  const myResults = calculateResults();
  const myAverage = calculateAverageScore(myResults);
  const benchmark = await getBenchmarkStats(myResults);
  const overallDiff = Number((myAverage - benchmark.totalAverage).toFixed(2));

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

    <div class="card" style="margin-bottom:16px;">
      <h3>전체 비교 요약</h3>

      <div style="
        display:grid;
        grid-template-columns:repeat(3, minmax(0, 1fr));
        gap:12px;
        margin-top:16px;
      ">
        <div style="padding:14px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;">
          <div style="font-size:12px;color:#64748b;margin-bottom:6px;">전체평균</div>
          <div style="font-size:22px;font-weight:700;">${formatScore(benchmark.totalAverage)}</div>
        </div>

        <div style="padding:14px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;">
          <div style="font-size:12px;color:#64748b;margin-bottom:6px;">내평균</div>
          <div style="font-size:22px;font-weight:700;">${formatScore(myAverage)}</div>
        </div>

        <div style="padding:14px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;">
          <div style="font-size:12px;color:#64748b;margin-bottom:6px;">편차</div>
          <div style="font-size:22px;font-weight:700;color:${getDiffColor(overallDiff)};">
            ${formatDiff(overallDiff)}
          </div>
        </div>
      </div>

      <div style="margin-top:12px;font-size:13px;color:#64748b;">
        ${
          benchmark.hasBenchmark
            ? `비교 기준: 누적 응답 ${benchmark.sourceCount}건`
            : "비교 가능한 기존 응답이 없어 현재는 내 점수를 기준으로 표시합니다."
        }
      </div>
    </div>

    <div style="margin-top:20px;">
      <button id="submitButton" onclick="submitResult()">제출하기</button>
    </div>

    <div class="card">
      <div class="result-grid">
  `;

  detailMap.forEach((cat, idx) => {
    const myScore = myResults[idx].score;
    const totalScore = benchmark.categoryAverages[idx]?.score ?? myScore;
    const diff = Number((myScore - totalScore).toFixed(2));
    const level = getLevel(myScore);

    html += `
      <div class="result-card">
        <div class="result-title">${cat.title}</div>

        <div class="result-score">
          ${formatScore(myScore)}
          <span class="badge ${level.color}">${level.label}</span>
        </div>

        <div style="
          display:grid;
          grid-template-columns:repeat(3, minmax(0, 1fr));
          gap:8px;
          margin-top:12px;
          margin-bottom:12px;
        ">
          <div style="padding:10px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
            <div style="font-size:12px;color:#64748b;">전체평균</div>
            <div style="font-weight:700;margin-top:4px;">${formatScore(totalScore)}</div>
          </div>

          <div style="padding:10px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
            <div style="font-size:12px;color:#64748b;">내평균</div>
            <div style="font-weight:700;margin-top:4px;">${formatScore(myScore)}</div>
          </div>

          <div style="padding:10px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
            <div style="font-size:12px;color:#64748b;">편차</div>
            <div style="font-weight:700;margin-top:4px;color:${getDiffColor(diff)};">
              ${formatDiff(diff)}
            </div>
          </div>
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

  survey.innerHTML = html;
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
// =====================================================
// 자전거 대여량 선형회귀 프로그램
// X = 기온(℃)
// Y = 자전거 대여량(대)
//
// 중요:
// 아래 DATA 부분을 본인의 엑셀 데이터로 교체하면 됩니다.
// 첫 번째 값 = 기온
// 두 번째 값 = 자전거 대여량
// =====================================================

// -----------------------------------------------------
// 예제 데이터
// -----------------------------------------------------
const DATA = [
  [0, 120], [2, 180], [4, 240], [6, 310], [8, 390],
  [10, 480], [12, 570], [14, 670], [16, 780], [18, 900],
  [20, 1030], [22, 1150], [24, 1260], [26, 1370], [28, 1480],
  [30, 1560], [32, 1630], [34, 1680]
];

// -----------------------------------------------------
// 선형회귀 계산
// y = b0 + b1*x
// -----------------------------------------------------
function linearRegression(data) {
  const n = data.length;

  const xMean = data.reduce((sum, point) => sum + point[0], 0) / n;
  const yMean = data.reduce((sum, point) => sum + point[1], 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (const [x, y] of data) {
    numerator += (x - xMean) * (y - yMean);
    denominator += (x - xMean) ** 2;
  }

  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  // 결정계수 R²
  const ssTotal = data.reduce(
    (sum, [, y]) => sum + (y - yMean) ** 2,
    0
  );

  const ssResidual = data.reduce(
    (sum, [x, y]) => sum + (y - (intercept + slope * x)) ** 2,
    0
  );

  const r2 = 1 - ssResidual / ssTotal;

  return {
    slope,
    intercept,
    r2
  };
}

const model = linearRegression(DATA);

// -----------------------------------------------------
// 화면에 회귀식 표시
// -----------------------------------------------------
const equationElement = document.getElementById("equation");
const modelInfoElement = document.getElementById("modelInfo");

const sign = model.intercept >= 0 ? "+" : "-";
const interceptAbs = Math.abs(model.intercept);

equationElement.textContent =
  `y = ${model.slope.toFixed(2)}x ${sign} ${interceptAbs.toFixed(2)}`;

modelInfoElement.textContent =
  `결정계수 R² = ${model.r2.toFixed(4)}`;

// -----------------------------------------------------
// 예측 함수
// -----------------------------------------------------
function predictRental(temperature) {
  return model.intercept + model.slope * temperature;
}

document.getElementById("predictBtn").addEventListener("click", predict);

document.getElementById("temperature").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    predict();
  }
});

function predict() {
  const input = document.getElementById("temperature");
  const result = document.getElementById("prediction");

  const temperature = Number(input.value);

  if (!Number.isFinite(temperature)) {
    result.textContent = "기온을 입력하세요.";
    return;
  }

  const predicted = predictRental(temperature);

  result.textContent = Math.max(0, Math.round(predicted)).toLocaleString();
}

// -----------------------------------------------------
// 그래프
// -----------------------------------------------------
const minX = Math.min(...DATA.map(point => point[0]));
const maxX = Math.max(...DATA.map(point => point[0]));

const lineData = [
  {
    x: minX,
    y: predictRental(minX)
  },
  {
    x: maxX,
    y: predictRental(maxX)
  }
];

const ctx = document.getElementById("regressionChart");

new Chart(ctx, {
  type: "scatter",
  data: {
    datasets: [
      {
        label: "실제 데이터",
        data: DATA.map(point => ({
          x: point[0],
          y: point[1]
        })),
        pointRadius: 4
      },
      {
        label: "선형회귀 직선",
        data: lineData,
        type: "line",
        borderWidth: 3,
        pointRadius: 0,
        tension: 0
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `기온: ${context.parsed.x}℃ / 대여량: ${Math.round(context.parsed.y)}대`;
          }
        }
      }
    },
    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "기온 (℃)"
        }
      },
      y: {
        title: {
          display: true,
          text: "자전거 대여량 (대)"
        },
        beginAtZero: true
      }
    }
  }
});

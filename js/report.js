/***************************************
 * SODA REPORT – STORE & RENDER
 ***************************************/
document.addEventListener("DOMContentLoaded", initSodaReport);

let reportsCache = [];
let latestReport = null;

const agePracticeMap = {
  2: ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಎ", "ಏ", "ಒ", "ಓ", "ಅಂ"],

  5: [
    "ಕ",
    "ಕಾ",
    "ಕಿ",
    "ಕೀ",
    "ಕು",
    "ಕೂ",
    "ಕೆ",
    "ಕೇ",
    "ಕ್",
    "ಕೈ",
    "ಕೊ",
    "ಕೋ",
    "ಕೌ",
    "ಕಂ",
    "ಕಃ",
    "ಗ",
    "ಗಾ",
    "ಗಿ",
    "ಗೀ",
    "ಗು",
    "ಗೂ",
    "ಗೃ",
    "ಗೆ",
    "ಗೇ",
    "ಗೈ",
    "ಗೊ",
    "ಗೋ",
    "ಗೌ",
    "ಗಂ",
    "ಗಃ",
    "ತ",
    "ತಾ",
    "ತಿ",
    "ತೀ",
    "ತು",
    "ತೂ",
    "ತೃ",
    "ತೆ",
    "ತೇ",
    "ತೈ",
    "ತೊ",
    "ತೋ",
    "ತೌ",
    "ತಂ",
    "ತಃ",
    "ದ",
    "ದಾ",
    "ದಿ",
    "ದೀ",
    "ದು",
    "ದೂ",
    "ದೃ",
    "ದೆ",
    "ದೇ",
    "ದೈ",
    "ದೊ",
    "ದೋ",
    "ದೌ",
    "ದಂ",
    "ದಃ",
    "ನ",
    "ನಾ",
    "ನಿ",
    "ನೀ",
    "ನು",
    "ನೂ",
    "ನೃ",
    "ನೆ",
    "ನೇ",
    "ನೈ",
    "ನೊ",
    "ನೋ",
    "ನೌ",
    "ನಂ",
    "ನಃ",
    "ಬ",
    "ಬಾ",
    "ಬಿ",
    "ಬೀ",
    "ಬು",
    "ಬೂ",
    "ಬೃ",
    "ಬೆ",
    "ಬೇ",
    "ಬೈ",
    "ಬೊ",
    "ಬೋ",
    "ಬೌ",
    "ಬಂ",
    "ಬಃ",
    "ಪ",
    "ಪಾ",
    "ಪಿ",
    "ಪೀ",
    "ಪು",
    "ಪೂ",
    "ಪೃ",
    "ಪೆ",
    "ಪೇ",
    "ಪೈ",
    "ಪೊ",
    "ಪೋ",
    "ಪೌ",
    "ಪಂ",
    "ಪಃ",
    "ಟ",
    "ಟಾ",
    "ಟಿ",
    "ಟೀ",
    "ಟು",
    "ಟೂ",
    "ಟೃ",
    "ಟೆ",
    "ಟೇ",
    "ಟೈ",
    "ಟೊ",
    "ಟೋ",
    "ಟೌ",
    "ಟಂ",
    "ಟಃ",
    "ಲ",
    "ಲಾ",
    "ಲಿ",
    "ಲೀ",
    "ಲು",
    "ಲೂ",
    "ಲೃ",
    "ಲೆ",
    "ಲೇ",
    "ಲೈ",
    "ಲೊ",
    "ಲೋ",
    "ಲೌ",
    "ಲಂ",
    "ಲಃ",
    "ಚ",
    "ಚಾ",
    "ಚಿ",
    "ಚೀ",
    "ಚು",
    "ಚೂ",
    "ಚೃ",
    "ಚೆ",
    "ಚೇ",
    "ಚೈ",
    "ಚೊ",
    "ಚೋ",
    "ಚೌ",
    "ಚಂ",
    "ಚಃ",
    "ಜ",
    "ಜಾ",
    "ಜಿ",
    "ಜೀ",
    "ಜು",
    "ಜೂ",
    "ಜೃ",
    "ಜೆ",
    "ಜೇ",
    "ಜೈ",
    "ಜೊ",
    "ಜೋ",
    "ಜೌ",
    "ಜಂ",
    "ಜಃ",
    "ವ",
    "ವಾ",
    "ವಿ",
    "ವೀ",
    "ವು",
    "ವೂ",
    "ವೃ",
    "ವೆ",
    "ವೇ",
    "ವೈ",
    "ವೊ",
    "ವೋ",
    "ವೌ",
    "ವಂ",
    "ವಃ",
  ],

  7: [
    "ರ",
    "ರಾ",
    "ರಿ",
    "ರೀ",
    "ರು",
    "ರೂ",
    "ರೃ",
    "ರೆ",
    "ರೇ",
    "ರೈ",
    "ರೊ",
    "ರೋ",
    "ರೌ",
    "ರಂ",
    "ರಃ",
    "ಣ",
    "ಣಾ",
    "ಣಿ",
    "ಣೀ",
    "ಣು",
    "ಣೂ",
    "ಣೃ",
    "ಣೆ",
    "ಣೇ",
    "ಣೈ",
    "ಣೊ",
    "ಣೋ",
    "ಣೌ",
    "ಣಂ",
    "ಣಃ",
    "ಸ",
    "ಸಾ",
    "ಸಿ",
    "ಸೀ",
    "ಸು",
    "ಸೂ",
    "ಸೃ",
    "ಸೆ",
    "ಸೇ",
    "ಸೈ",
    "ಸೊ",
    "ಸೋ",
    "ಸೌ",
    "ಸಂ",
    "ಸಃ",
    "ರ",
    "ರಾ",
    "ರಿ",
    "ರೀ",
    "ರು",
    "ರೂ",
    "ರೃ",
    "ರೆ",
    "ರೇ",
    "ರೈ",
    "ರೊ",
    "ರೋ",
    "ರೌ",
    "ರಂ",
    "ರಃ",
    "ಳ",
    "ಳಾ",
    "ಳಿ",
    "ಳೀ",
    "ಳು",
    "ಳೂ",
    "ಳೃ",
    "ಳೆ",
    "ಳೇ",
    "ಳೈ",
    "ಳೊ",
    "ಳೋ",
    "ಳೌ",
    "ಳಂ",
    "ಳಃ",
    "ಶ",
    "ಶಾ",
    "ಶಿ",
    "ಶೀ",
    "ಶು",
    "ಶೂ",
    "ಶೃ",
    "ಶೆ",
    "ಶೇ",
    "ಶೈ",
    "ಶೊ",
    "ಶೋ",
    "ಶೌ",
    "ಶಂ",
    "ಶಃ",
  ],
};

function getPracticeArrayByAge() {
  const age = localStorage.getItem("selectedAge");

  // fallback: age 2 if missing
  return agePracticeMap[age] || agePracticeMap[2];
}

async function initSodaReport() {
  const user = JSON.parse(localStorage.getItem("userDetails"));
  const sodaResults = JSON.parse(localStorage.getItem("sodaResults")) || [];
  const sodaFresh = localStorage.getItem("sodaResultsFresh") === "true";

  if (!user || !user.id) {
    console.error("❌ User ID not found");
    return;
  }

  // Only store when results are marked fresh or signature changed
  if (Array.isArray(sodaResults) && sodaResults.length) {
    const signature = JSON.stringify(sodaResults);
    const sigKey = `sodaSig_${user.id}`;
    const lastSig = localStorage.getItem(sigKey);

    if (sodaFresh || signature !== lastSig) {
      const summary = summarizeSODA(sodaResults);
      try {
        await fetch(`${API_BASE_URL}/api/children/${user.id}/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date().toISOString(),
            sodaResults,
            summary,
          }),
        });
        console.log("✅ SODA report stored");
        localStorage.setItem(sigKey, signature);
        // Clear once persisted to avoid duplicate posts
        localStorage.removeItem("sodaResults");
        localStorage.removeItem("sodaResultsFresh");
      } catch (err) {
        console.error("❌ Failed to store SODA report", err);
      }
    } else {
      console.log("SODA results unchanged; skipping store");
    }
  }

  await loadReportHistory(user.id);
}

/***************************************
 * Helpers
 ***************************************/
function summarizeSODA(results = []) {
  const summary = {
    Correct: 0,
    Substitution: 0,
    Omission: 0,
    Addition: 0,
    Distortion: 0,
  };
  results.forEach((item) => {
    if (item?.error_type === "Distortion") summary.Distortion++;
    else if (item?.error_type === "Substitution") summary.Substitution++;
    else if (item?.error_type === "Omission") summary.Omission++;
    else if (item?.error_type === "Addition") summary.Addition++;
    else summary.Correct++;
  });
  return summary;
}

function overallFromSummary(summary = {}) {
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  const correct = summary.Correct || 0;
  return total ? Math.round((correct / total) * 100) : 0;
}

/***************************************
 * History + Rendering
 ***************************************/
async function loadReportHistory(childId) {
  const res = await fetch(`${API_BASE_URL}/api/children/${childId}/reports`);
  if (!res.ok) return;
  const reports = await res.json();
  if (!Array.isArray(reports) || !reports.length) return;

  const progressLabels = reports.map((r) =>
    new Date(r.date).toLocaleDateString(),
  );
  const progressData = reports.map((r) =>
    overallFromSummary(r.summary || summarizeSODA(r.sodaResults || [])),
  );

  reportsCache = reports;
  latestReport = reports[reports.length - 1];

  const ctx = document.getElementById("progressChart")?.getContext("2d");
  if (ctx) {
    if (window.progressChartInstance) window.progressChartInstance.destroy();
    window.progressChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: progressLabels,
        datasets: [
          {
            label: "ಒಟ್ಟು ಸರಿಯಾದ ಉಚ್ಚಾರಣೆ (%)",
            data: progressData,
            fill: true,
          },
        ],
      },
      options: { scales: { y: { beginAtZero: true, max: 100 } } },
    });
  }

  const historyDiv = document.getElementById("report-history");
  if (historyDiv) {
    historyDiv.innerHTML =
      "<h4>ಹಳೆಯ ವರದಿಗಳು</h4>" +
      reports
        .map(
          (r, i) =>
            `<button class="history-btn" data-idx="${i}">${progressLabels[i]}</button>`,
        )
        .join(" ");
    document.querySelectorAll(".history-btn").forEach((btn) => {
      btn.onclick = () => showReport(reports[btn.dataset.idx]);
    });
  }

  showReport(reports[reports.length - 1]);
}

function buildReportDetails(report) {
  const sodaResults = report.sodaResults || [];

  const correctResults = sodaResults.filter((r) => r.error_type === "");
  const errorResults = sodaResults.filter(
    (r) => r.error_type || (r.distortion_score ?? 0) > 0,
  );

  // ---------- Correct list ----------
  const correctList = [
    ...new Set(correctResults.map((r) => r.target_word).filter(Boolean)),
  ];

  // ---------- Wrong list ----------
  const wrongList = [
    ...new Set(errorResults.map((r) => r.target_word).filter(Boolean)),
  ];

  // ---------- Practice syllables ----------
  const practiceWords = errorResults
    .flatMap((r) => {
      if (Array.isArray(r.error_syllables)) {
        return r.error_syllables.map((syl) => {
          if (typeof syl === "string") return syl;
          if (typeof syl === "object" && syl.target) return syl.target;
          return null;
        });
      }
      return [];
    })
    .filter(Boolean);

  const uniquePractice = [...new Set(practiceWords)];

  const ageArray = getPracticeArrayByAge();
  const filteredPractice = uniquePractice.filter((w) => ageArray.includes(w));

  // ---------- Suggestion logic ----------
  let suggestionText = "";

  if (filteredPractice.length === 0 && uniquePractice.length > 0) {
    suggestionText =
      "ಸಣ್ಣ ಧ್ವನಿತ ದೋಷಗಳು ಮಾತ್ರ ಕಂಡುಬಂದಿವೆ ಆದರೆ ಮಗುವಿನ ವಯಸ್ಸಿಗೆ ಅನುಗುಣವಾಗಿ ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ಧ್ವನಿಗಳ ಉಚ್ಚಾರಣೆ ಸರಿಯಾಗಿ ಬರುತ್ತಿದೆ. ಚಿಂತಿಸಬೇಕಾದ ಅಗತ್ಯವಿಲ್ಲ. ಮಗು ಸಾಮಾನ್ಯವಾಗಿದೆ. ಆದರೂ ನಿರಂತರವಾಗಿ ಅಭ್ಯಾಸ ಮಾಡಿಸುತ್ತಿರಲಿ.";
  } else if (filteredPractice.length > 0 && filteredPractice.length <= 2) {
    suggestionText =
      "ಕೆಲವು ಧ್ವನಿಗಳಲ್ಲಿ ಮಾತ್ರ ಸ್ವಲ್ಪ ಕಷ್ಟ ಕಂಡುಬಂದಿದೆ. ನಿಯಮಿತ ಅಭ್ಯಾಸದಿಂದ ಮಗು ಸುಲಭವಾಗಿ ಸುಧಾರಿಸಬಹುದು. ದಿನನಿತ್ಯ ಅಭ್ಯಾಸ ಮಾಡಿಸಲು ಸಲಹೆ ನೀಡಲಾಗುತ್ತದೆ.";
  } else if (filteredPractice.length > 2) {
    suggestionText =
      "ಅನೇಕ ಧ್ವನಿಗಳ ಉಚ್ಚಾರಣೆಯಲ್ಲಿ ತೊಂದರೆ ಕಂಡುಬಂದಿದೆ. ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಸ್ಪೀಚ್ ಥೆರಪಿಸ್ಟ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸುವುದು ಉತ್ತಮ.";
  } else {
    suggestionText =
      "ಯಾವುದೇ ಉಚ್ಚಾರಣಾ ದೋಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಮಗು ಉತ್ತಮವಾಗಿ ಮಾತನಾಡುತ್ತಿದೆ.";
  }

  return {
    correctList,
    wrongList,
    uniquePractice,
    practiceList: filteredPractice,
    suggestionText,
  };
}

function showReport(report) {
  const user = JSON.parse(localStorage.getItem("userDetails")) || {};
  const summary = report.summary || summarizeSODA(report.sodaResults || []);

  // Debug: Log the report data
  console.log("📊 Report data:", report);
  console.log("📊 SODA Results:", report.sodaResults);

  const correctResults = (report.sodaResults || []).filter(
    (r) => r.error_type == "",
  );

  // Extract error WORDS from error results (fallback to words, as requested)
  const errorResults = (report.sodaResults || []).filter(
    (r) => r.error_type || (r.distortion_score ?? 0) > 0,
  );

  console.log("🔍 Error results found:", errorResults.length);
  console.log("🔍 Error results:", errorResults);

  const reportDiv = document.getElementById("report");
  if (reportDiv) {
    reportDiv.innerHTML = `
      <p><strong>ಹೆಸರು:</strong> ${user["ಹೆಸರು"] || user.name || ""}</p>
      <p><strong>ವಯಸ್ಸು:</strong> ${user["ವಯಸ್ಸು"] || user.age || ""}</p>
      <p><strong>ಲಿಂಗ:</strong> ${user["ಲಿಂಗ"] || user.gender || ""}</p>
      <p><strong>ದಿನಾಂಕ:</strong> ${new Date(report.date).toLocaleString()}</p>
    `;
  }

  drawSODAPieChart(summary);

  const details = buildReportDetails(report);

  document.getElementById("correct-list").textContent = details.correctList
    .length
    ? details.correctList.join(", ")
    : "ಯಾವು ಕಂಡುಬಂದಿಲ್ಲ";

  document.getElementById("wrong-list").textContent = details.wrongList.length
    ? details.wrongList.join(", ")
    : "ಯಾವುದೇ ದೋಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ";

  // document.getElementById('wrong-letter-list').textContent =
  //   details.uniquePractice.length ? details.uniquePractice.join(', ') : '';

  document.getElementById("practice-list").textContent = details.practiceList
    .length
    ? details.practiceList.join(", ")
    : "";

  document.getElementById("suggestion").textContent = details.suggestionText;

  // const correctList = document.getElementById('correct-list');
  // if (correctList) {
  //   const correctWords = correctResults
  //     .map(r => r.target_word)
  //     .filter(w => w && String(w).trim().length > 0);
  //   const uniqueWords = [...new Set(correctWords)];
  //   correctList.textContent = uniqueWords.length ? uniqueWords.join(', ') : 'ಯಾವು ಕಂಡುಬಂದಿಲ್ಲ';
  // } else {
  //   console.error('❌ correct-list element not found!');
  // }

  // const wrongList = document.getElementById('wrong-list');
  // if (wrongList) {
  //   const wrongWords = errorResults
  //     .map(r => r.target_word)
  //     .filter(w => w && String(w).trim().length > 0);
  //   const uniqueWords = [...new Set(wrongWords)];
  //   wrongList.textContent = uniqueWords.length ? uniqueWords.join(', ') : 'ಯಾವುದೇ ದೋಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ';
  // } else {
  //   console.error('❌ wrong-list element not found!');
  // }

  // const practiceEl = document.getElementById('practice-list');
  // const suggestions = document.getElementById('suggestion');

  // if (practiceEl) {

  //   const practiceWords = errorResults.flatMap(r => {

  //     if (Array.isArray(r.error_syllables) && r.error_syllables.length > 0) {
  //       return r.error_syllables.map(syl => {
  //         if (typeof syl === 'string') return syl;
  //         if (typeof syl === 'object' && syl.target) return syl.target;
  //         return null;
  //       });
  //     }

  //     return [];
  //   }).filter(Boolean);

  //   const uniqueWords = [...new Set(practiceWords)];

  //   const filteredPractice = uniqueWords.filter(
  //     w => array_2.includes(w)
  //   );

  //   /* ---------------- PRACTICE LIST ---------------- */

  // if (filteredPractice.length === 0 && uniqueWords.length > 0) {
  //   practiceEl.textContent = '';
  // }
  // else if (filteredPractice.length > 0) {
  //   practiceEl.textContent = filteredPractice.join(', ');
  // }
  // else {
  //   practiceEl.textContent = 'ಯಾವುದೇ ದೋಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ';
  // }

  //   /* ---------------- SUGGESTIONS (KANNADA) ---------------- */

  //   if (suggestions) {

  //     // 🟢 Case 1: No practice-needed letters
  //     if (filteredPractice.length === 0 && uniqueWords.length > 0) {
  //       suggestions.textContent =
  //         'ಸಣ್ಣ ಧ್ವನಿತ ದೋಷಗಳು ಮಾತ್ರ ಕಂಡುಬಂದಿವೆ ಆದರೆ ಮಗುವಿನ ವಯಸ್ಸಿಗೆ ಅನುಗುಣವಾಗಿ ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ಧ್ವನಿಗಳ ಉಚ್ಚಾರಣೆ ಸರಿಯಾಗಿ ಬರುತ್ತಿದೆ. ಚಿಂತಿಸಬೇಕಾದ ಅಗತ್ಯವಿಲ್ಲ. ಮಗು ಸಾಮಾನ್ಯವಾಗಿದೆ. ಆದರೂ ನಿರಂತರವಾಗಿ ಅಭ್ಯಾಸ ಮಾಡಿಸುತ್ತಿರಲಿ.';
  //     }

  //     // 🟡 Case 2: Very few errors (1 or 2)
  //     else if (filteredPractice.length > 0 && filteredPractice.length <= 2) {
  //       suggestions.textContent =
  //         'ಕೆಲವು ಧ್ವನಿಗಳಲ್ಲಿ ಮಾತ್ರ ಸ್ವಲ್ಪ ಕಷ್ಟ ಕಂಡುಬಂದಿದೆ. ನಿಯಮಿತ ಅಭ್ಯಾಸದಿಂದ ಮಗು ಸುಲಭವಾಗಿ ಸುಧಾರಿಸಬಹುದು. ದಿನನಿತ್ಯ ಪದಗಳು ಮತ್ತು ಧ್ವನಿಗಳ ಅಭ್ಯಾಸ ಮಾಡಿಸಲು ಸಲಹೆ ನೀಡಲಾಗುತ್ತದೆ.';
  //     }

  //     // 🔴 Case 3: Multiple errors (needs professional help)
  //     else if (filteredPractice.length > 2) {
  //       suggestions.textContent =
  //         'ಅನೇಕ ಧ್ವನಿಗಳ ಉಚ್ಚಾರಣೆಯಲ್ಲಿ ತೊಂದರೆ ಕಂಡುಬಂದಿದೆ. ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಭಾಷಾ ತಜ್ಞರು ಅಥವಾ ಸ್ಪೀಚ್ ಥೆರಪಿಸ್ಟ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸುವುದು ಉತ್ತಮ. ತಡವಾದರೆ ಮಗುವಿನ ಭಾಷಾ ಅಭಿವೃದ್ಧಿಯಲ್ಲಿ ಹಿನ್ನಡೆ ಆಗಬಹುದು.';
  //     }

  //     // ⚪ Case 4: No errors at all
  //     else {
  //       suggestions.textContent =
  //         'ಯಾವುದೇ ಉಚ್ಚಾರಣಾ ದೋಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಮಗು ಉತ್ತಮವಾಗಿ ಮಾತನಾಡುತ್ತಿದೆ. ಹೀಗೆ ಮುಂದುವರಿಸಿ.';
  //     }
  //   }
  // }
}

/***************************************
 * Download PDF
 ***************************************/
document
  .getElementById("downloadReportBtn")
  ?.addEventListener("click", downloadReport);

async function downloadReport() {
  const user = JSON.parse(localStorage.getItem("userDetails")) || {};
  if (!latestReport) {
    alert("ವರದಿ ಲಭ್ಯವಿಲ್ಲ");
    return;
  }

  // Extract error WORDS from error results (same as UI)
  const errorResults = (latestReport.sodaResults || []).filter(
    (r) => r.error_type || (r.distortion_score ?? 0) > 0,
  );
  const practiceWords = errorResults
    .map((r) => r.target_word)
    .filter((w) => w && String(w).trim().length > 0);

  const details = buildReportDetails(latestReport);

  const payload = {
    childDetails: user,
    report: latestReport,
    correctList: details.correctList,
    wrongList: details.wrongList,
    practiceList: details.practiceList,
    suggestion: details.suggestionText,
  };

  // const payload = {
  //   childDetails: user,
  //   report: latestReport,
  //   suggestions: [...new Set(practiceWords)]
  // };

  try {
    const res = await fetch(`${API_BASE_URL}/api/generate-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Generate report failed:", res.status, errText);
      alert("ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user["ಹೆಸರು"] || user.name || "child"}_report.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error("Download error:", err);
    alert("ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ");
  }
}

/***************************************
 * Pie Chart
 ***************************************/
function drawSODAPieChart(summary) {
  const canvas = document.getElementById("sodaPieChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (window.sodaChart) window.sodaChart.destroy();

  window.sodaChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Correct", "Substitution", "Omission", "Addition", "Distortion"],
      datasets: [
        {
          data: [
            summary.Correct || 0,
            summary.Substitution || 0,
            summary.Omission || 0,
            summary.Addition || 0,
            summary.Distortion || 0,
          ],
          backgroundColor: [
            "#66bb6a",
            "#ffa726",
            "#ef5350",
            "#42a5f5",
            "#ab47bc",
          ],
          borderWidth: 5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { font: { size: 14 } } },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed || 0}` },
        },
      },
    },
  });
}

// let currentIndex = 0;
// const age = localStorage.getItem('selectedAge');
// let missedLetters = [];
// let allAksharas = []; // <-- Move this here, at the top level

// fetch('assets/data/words.json')
//   .then(res => res.json())
//   .then(data => {
//     const words = data[age];
//     showWord(words[currentIndex]);

//     window.nextWord = () => {
     
//       currentIndex++;
//       if (currentIndex < words.length) {
//         showWord(words[currentIndex]);
//       } else {
//         // When done (before redirecting to report.html):
//         localStorage.setItem('allAksharas', JSON.stringify(allAksharas));
//         localStorage.setItem('missedLetters', JSON.stringify(missedLetters));
//         // --- New: Save report to backend ---
//         const user = JSON.parse(localStorage.getItem('userDetails'));
//         const childId = user && user.id;
//         if (childId) {
//           // Calculate per-letter stats
//           const ageLetterMap = {
//             2: ['ಅ','ಆ','ಇ','ಈ','ಎ','ಒ','ಓ','ಉ','ಊ'],
//             5: ['ಕ','ತ','ಗ','ದ','ನ','ಪ','ಟ','ಲ','ಚ','ಜ','ವ'],
//             7: ['ಸ','ಬ','ಶ','ರ','ಣ','ಡ']
//           };
//           let rawAge = localStorage.getItem('selectedAge');
//           let userAge = parseInt(rawAge, 10);
//           let mappedAge = 2;
//           if (userAge >= 6) mappedAge = 7;
//           else if (userAge >= 3) mappedAge = 5;
//           const validLetters = ageLetterMap[mappedAge] || [];
//           const totalCount = {};
//           const missedCount = {};
//           validLetters.forEach(l => {
//             totalCount[l] = allAksharas.filter(a => a === l).length;
//             missedCount[l] = missedLetters.filter(a => a === l).length;
//           });
//           const percentData = validLetters.map(l => {
//             const total = totalCount[l];
//             const missedNum = missedCount[l];
//             if (total === 0) return 0;
//             return Math.round(((total - missedNum) / total) * 100);
//           });
//           const report = {
//             date: new Date().toISOString(),
//             validLetters,
//             percentData,
//             totalCount,
//             missedCount
//           };
//           fetch(`http://localhost:3000/api/children/${childId}/report`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(report)
//           });
//         }
//         // --- End new ---
//         window.location.href = 'report.html';
//       }
//     };


//     async function analyzeWord(targetWord, audioBlob) {
//       const formData = new FormData();
//       formData.append("target_word", targetWord);
//       formData.append("audio", audioBlob, "recording.wav");
    
//       try {
//         const response = await fetch("http://127.0.0.1:5000/analyze_soda", {
//           method: "POST",
//           body: formData
//         });
    
//         const result = await response.json();
//         if (response.ok) {
//           console.log("✅ SODA Analysis Result:", result);
//           alert("Analysis complete!");
//         } else {
//           console.error("❌ Backend Error:", result.error);
//           alert("Error: " + result.error);
//         }
//       } catch (err) {
//         console.error("⚠️ Connection failed:", err);
//         alert("Failed to connect to backend");
//       }
//     }
    
    
//   function playSpeech(word) {
//   const url = `http://localhost:3000/tts?text=${encodeURIComponent(word)}&lang=kn`;
//   const audio = document.getElementById("audio");

//   audio.src = url;
//   audio.style.display = "block";
// }


//   function showWord(wordObj) {
//   document.getElementById('word').textContent = wordObj.word;
//   document.getElementById('image').src = `assets/images/${wordObj.image}`;
  
  
//   // Generate and play the TTS audio
//   playSpeech(wordObj.word);

//   const letterButtons = document.getElementById('letter-buttons');
//   letterButtons.innerHTML = '';

//   const aksharas = splitIntoAksharas(wordObj.word);
//   // Always accumulate aksharas for the current word
//   allAksharas.push(...aksharas);
//   aksharas.forEach(akshara => {
//     allAksharas.push(akshara); // Track every akshara shown
//     const btn = document.createElement('button');
//     btn.textContent = akshara;
//     btn.classList.add('letter-btn');
//     btn.dataset.akshara = akshara;

//     btn.onclick = () => {
//       if (btn.classList.contains('missed')) {
//         btn.classList.remove('missed');
//         const idx = missedLetters.indexOf(akshara);
//         if (idx !== -1) missedLetters.splice(idx, 1);
//       } else {
//         btn.classList.add('missed');
//         missedLetters.push(akshara);
//       }
//     };

//     letterButtons.appendChild(btn);
//   });
  

// }


// function splitIntoAksharas(word) {
//   const aksharas = [];
//   let i = 0;

//   while (i < word.length) {
//     let akshara = '';
//     akshara += word[i]; // First letter
//     i++;

//     // Build consonant clusters like ಭ್ + ಯ
//     while (i + 1 < word.length && word[i] === '್' && isKannadaConsonant(word[i + 1])) {
//       akshara += word[i];     // Add halant
//       akshara += word[i + 1]; // Add next consonant
//       i += 2;
//     }

//     // Add vowel sign if present
//     if (i < word.length && isKannadaVowelSign(word[i])) {
//       akshara += word[i];
//       i++;
//     }

//     aksharas.push(akshara);
//   }

//   return aksharas;
// }

// function isKannadaConsonant(ch) {
//   return ch >= '\u0C95' && ch <= '\u0CB9'; // ಕ to ಹ
// }

// function isKannadaVowelSign(ch) {
//   return /[\u0CBE-\u0CCC\u0CD5\u0CD6]/.test(ch); // ಾ to ೌ, etc.
// }

// function launchConfetti() {
//   const confetti = document.createElement('div');
//   confetti.className = 'confetti';
//   document.body.appendChild(confetti);
//   setTimeout(() => confetti.remove(), 2000);
// }



//   });



let currentIndex = 0;
let mediaRecorder;
let audioChunks = [];
let currentAudioBlob = null;

let sodaResults = [];   // ✅ STORE ALL WORD RESULTS


fetch("assets/data/words.json")
  .then(res => res.json())
  .then(data => {
    const age = localStorage.getItem("selectedAge");
    const words = data[age];
    showWord(words[currentIndex]);

    window.nextWord = () => {
      currentIndex++;
      if (currentIndex < words.length) {
        showWord(words[currentIndex]);
      } else {
        // ✅ SAVE EVERYTHING
        localStorage.setItem("sodaResults", JSON.stringify(sodaResults));
        
        window.location.href = "report.html";
      }
    };
  });

/* ---------------- WORD DISPLAY ---------------- */

function showWord(wordObj) {
  document.getElementById("word").textContent = wordObj.word;
  document.getElementById("image").src = `assets/images/${wordObj.image}`;
  playSpeech(wordObj.word);

  // document.getElementById("resultBox").textContent = "";
  document.getElementById("status").textContent = "";

  document.getElementById("analyzeBtn").disabled = true;
}

/* ---------------- TTS ---------------- */

function playSpeech(word) {
  const audio = document.getElementById("audio");
  audio.src = `http://localhost:3000/tts?text=${encodeURIComponent(word)}&lang=kn`;
}

/* ---------------- RECORDING ---------------- */

const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const recording_status = document.getElementById("status");
// const resultBox = document.getElementById("resultBox");
// const age_selected = localStorage.getItem("selectedAge");
// if(age_selected == '2')


recordBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.onstop = () => {
    currentAudioBlob = new Blob(audioChunks, { type: "audio/wav" });
    analyzeBtn.disabled = false;
  };

  mediaRecorder.start();
  recordBtn.disabled = true;
  stopBtn.disabled = false;
  recording_status.textContent = "🎙️ ದಯವಿಟ್ಟು ಮಾತನಾಡಿ";
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
  recording_status.textContent = "⏹️ ಧ್ವನಿ ದಾಖಲಿಸುವುದು ಪೂರ್ಣಗೊಂಡಿದೆ";
};

/* ---------------- CALL FLASK ---------------- */

analyzeBtn.onclick = async () => {
  const word = document.getElementById("word").textContent;

  const formData = new FormData();
  formData.append("target_word", word);
  formData.append("audio", currentAudioBlob, "recording.wav");

  recording_status.textContent = "🧠 ಉಚ್ಚಾರಣೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...";
  analyzeBtn.disabled = true;

  try {
    const res = await fetch("http://127.0.0.1:5000/analyze_soda", {
      method: "POST",
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(data.error);

    // ✅ STORE RESULT PER WORD
    sodaResults.push({
      target_word: result.target_word,
      spoken_phonemes: result.spoken_phonemes || [],
      error_type: result.error_type || "",
      distortion_score: result.distortion_score || 0,
      error_syllables: result.error_syllables || []
    });

    // if (result.err)
    // resultBox.textContent = JSON.stringify(result, null, 2);
    recording_status.textContent = "✅ ವಿಶ್ಲೇಷಣೆ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ";

  } catch (err) {
    console.error(err);
    recording_status.textContent = "❌ ಸ್ವಲ್ಪ ದೋಷ ಸಂಭವಿಸಿದೆ, ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ";
  }
};

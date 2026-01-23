// assets/js/auto-record.js

let mediaRecorder,
  audioChunks = [];
let audioBlob;

// HTML elements
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const recording_status = document.getElementById("status");
const resultBox = document.getElementById("resultBox");
const wordDisplay = document.getElementById("word"); // Word shown on screen

recordBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      console.log("🎤 Audio blob ready:", audioBlob);
      recording_status.textContent =
        "✅ Recording completed! Ready for analysis.";
      analyzeBtn.disabled = false;
    };

    mediaRecorder.start();
    recording_status.textContent = "🎙️ Recording... Speak clearly in Kannada!";
    recordBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (err) {
    alert("Microphone access denied or unavailable.");
    console.error("🎙️ Microphone error:", err);
  }
};

stopBtn.onclick = () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
  }
};

analyzeBtn.onclick = async () => {
  const targetWord = wordDisplay.textContent.trim();
  console.log("🎯 Target word:", targetWord);

  if (!targetWord) {
    alert("No target word displayed!");
    return;
  }

  if (!audioBlob) {
    alert("No audio recorded yet!");
    return;
  }

  const formData = new FormData();
  formData.append("target_word", targetWord);
  formData.append("audio", audioBlob, "recording.wav");

  recording_status.textContent = "⏳ Analyzing speech using SODA framework...";

  try {
    console.log("📡 Sending request to Flask backend...");
    const response = await fetch(`${PYTHON_API_URL}/analyze_soda`, {
      method: "POST",
      body: formData,
    });

    let result;
    try {
      const text = await response.text();
      result = text ? JSON.parse(text) : {};
    } catch (err) {
      console.error("⚠️ Invalid JSON response", err);
      recording_status.textContent = "⚠️ Invalid JSON from server.";
      return;
    }

    if (result.error) {
      recording_status.textContent = "❌ Error: " + result.error;
      resultBox.textContent = "";
    } else {
      recording_status.textContent = "✅ SODA analysis completed!";
      resultBox.textContent = JSON.stringify(result, null, 2);
    }

    // const result = await response.json();
    // console.log("📬 Response:", result);

    // if (response.ok && !result.error) {
    //   status.textContent = "✅ SODA analysis completed!";
    //   resultBox.textContent = JSON.stringify(result, null, 2);
    // } else {
    //   status.textContent = "❌ Error: " + result.error;
    //   resultBox.textContent = "";
    // }
  } catch (err) {
    console.error("⚠️ Connection failed:", err);
    recording_status.textContent = "⚠️ Failed to connect to backend.";
  }
};

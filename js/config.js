// API Configuration - automatically detects environment
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : window.location.origin;

// Python backend URL (Flask server)
const PYTHON_API_URL =
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : window.location.origin;

console.log("API Base URL:", API_BASE_URL);
console.log("Python API URL:", PYTHON_API_URL);

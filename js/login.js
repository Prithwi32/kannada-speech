document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const childId = parseInt(document.getElementById("childId").value, 10);
    const errorDiv = document.getElementById("loginError");
    errorDiv.textContent = "";

    try {
      const res = await fetch(`${API_BASE_URL}/api/children/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: childId }),
      });
      if (!res.ok) {
        const err = await res.json();
        errorDiv.textContent = err.error || "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ.";
        return;
      }
      const child = await res.json();
      localStorage.setItem("userDetails", JSON.stringify(child));
      window.location.href = "dashboard.html";
    } catch (e) {
      errorDiv.textContent = "ಸರ್ವರ್ ದೋಷ: ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.";
    }
  });

document
  .getElementById("adminLoginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");
    const loginBtn = document.querySelector(".login-btn");

    // Show loading state
    loginBtn.textContent = "ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...";
    loginBtn.classList.add("loading");
    errorMessage.style.display = "none";

    try {
      console.log("Attempting admin login with:", { username, password }); // Debug log

      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log("Response status:", response.status); // Debug log
      const data = await response.json();
      console.log("Response data:", data); // Debug log

      if (response.ok) {
        // Store admin session
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminUsername", username);

        // Redirect to admin dashboard
        window.location.href = "admin-dashboard.html";
      } else {
        // Show error message
        errorMessage.textContent =
          data.message || "ತಪ್ಪಾದ ಬಳಕೆದಾರ ಹೆಸರು ಅಥವಾ ಗುಪ್ತಪದ";
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Login error:", error);
      errorMessage.textContent = "ಸರ್ವರ್ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.";
      errorMessage.style.display = "block";
    } finally {
      // Reset button state
      loginBtn.textContent = "ಲಾಗಿನ್ ಮಾಡಿ";
      loginBtn.classList.remove("loading");
    }
  });

let originalData = null;
let isEditMode = false;

// Check if user is logged in
function checkUserAuth() {
  const userDetails = localStorage.getItem("userDetails");
  if (!userDetails) {
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(userDetails);
  if (!user || !user.id) {
    window.location.href = "login.html";
    return;
  }

  return user;
}

// Load profile data
async function loadProfile() {
  const user = checkUserAuth();
  if (!user) return;

  try {
    // Fetch latest data from server
    const response = await fetch(`${API_BASE_URL}/api/children`);
    const children = await response.json();
    const child = children.find((c) => c.id === user.id);

    if (!child) {
      showError("ಮಗುವಿನ ವಿವರಗಳು ಕಂಡುಬಂದಿಲ್ಲ");
      return;
    }

    // Store original data for comparison
    originalData = { ...child };

    // Display data
    displayProfile(child);
  } catch (error) {
    console.error("Error loading profile:", error);
    showError("ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ");
  }
}

// Display profile data
function displayProfile(child) {
  // Set values for display
  document.getElementById("nameValue").textContent = child.ಹೆಸರು || "";
  document.getElementById("ageValue").textContent = child.ವಯಸ್ಸು || "";
  document.getElementById("genderValue").textContent = getGenderDisplay(
    child.ಲಿಂಗ,
  );
  document.getElementById("parentValue").textContent = child.ಪೋಷಕರು || "";
  document.getElementById("cityValue").textContent = child.ನಗರ || "";
  document.getElementById("emailValue").textContent = child.ಇಮೇಲ್ || "";
  document.getElementById("addressValue").textContent = child.ವಿಳಾಸ || "";
  document.getElementById("phoneValue").textContent = child.ದೂರವಾಣಿ || "";

  // Set values for inputs
  document.getElementById("nameInput").value = child.ಹೆಸರು || "";
  document.getElementById("ageInput").value = child.ವಯಸ್ಸು || "";
  document.getElementById("genderInput").value = child.ಲಿಂಗ || "";
  document.getElementById("parentInput").value = child.ಪೋಷಕರು || "";
  document.getElementById("cityInput").value = child.ನಗರ || "";
  document.getElementById("emailInput").value = child.ಇಮೇಲ್ || "";
  document.getElementById("addressInput").value = child.ವಿಳಾಸ || "";
  document.getElementById("phoneInput").value = child.ದೂರವಾಣಿ || "";
}

// Get gender display text
function getGenderDisplay(gender) {
  switch (gender) {
    case "Male":
      return "ಪುರುಷ";
    case "Female":
      return "ಹೆಣ್ಣು";
    case "Other":
      return "ಇತರ";
    default:
      return gender || "";
  }
}

// Toggle edit mode
function toggleEdit() {
  isEditMode = true;
  const profileCard = document.getElementById("profileCard");
  profileCard.classList.remove("view-mode");
  profileCard.classList.add("edit-mode");

  document.getElementById("editBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "inline-block";
}

// Cancel edit mode
function cancelEdit() {
  isEditMode = false;
  const profileCard = document.getElementById("profileCard");
  profileCard.classList.remove("edit-mode");
  profileCard.classList.add("view-mode");

  // Restore original values
  if (originalData) {
    displayProfile(originalData);
  }

  document.getElementById("editBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "none";

  hideMessages();
}

// Save profile changes
async function saveProfile() {
  const user = checkUserAuth();
  if (!user || !originalData) return;

  try {
    // Collect updated data
    const updatedData = {
      ...originalData,
      ಹೆಸರು: document.getElementById("nameInput").value,
      ವಯಸ್ಸು: document.getElementById("ageInput").value,
      ಲಿಂಗ: document.getElementById("genderInput").value,
      ಪೋಷಕರು: document.getElementById("parentInput").value,
      ನಗರ: document.getElementById("cityInput").value,
      ಇಮೇಲ್: document.getElementById("emailInput").value,
      ವಿಳಾಸ: document.getElementById("addressInput").value,
      ದೂರವಾಣಿ: document.getElementById("phoneInput").value,
    };

    // Validate required fields
    if (
      !updatedData.ಹೆಸರು ||
      !updatedData.ವಯಸ್ಸು ||
      !updatedData.ಲಿಂಗ ||
      !updatedData.ಪೋಷಕರು ||
      !updatedData.ನಗರ ||
      !updatedData.ಇಮೇಲ್
    ) {
      showError("ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ");
      return;
    }

    // Update in database
    const response = await fetch(`${API_BASE_URL}/api/children/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      // Update localStorage
      localStorage.setItem("userDetails", JSON.stringify(updatedData));

      // Update original data
      originalData = { ...updatedData };

      // Switch back to view mode
      cancelEdit();

      // Update display
      displayProfile(updatedData);

      showSuccess("ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ");
    } else {
      showError("ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸುವಲ್ಲಿ ದೋಷ");
    }
  } catch (error) {
    console.error("Error saving profile:", error);
    showError("ಪ್ರೊಫೈಲ್ ಉಳಿಸುವಲ್ಲಿ ದೋಷ");
  }
}

// Show success message
function showSuccess(message) {
  const successElement = document.getElementById("successMessage");
  successElement.textContent = message;
  successElement.style.display = "block";

  setTimeout(() => {
    successElement.style.display = "none";
  }, 3000);
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById("errorMessage");
  errorElement.textContent = message;
  errorElement.style.display = "block";

  setTimeout(() => {
    errorElement.style.display = "none";
  }, 3000);
}

// Hide all messages
function hideMessages() {
  document.getElementById("successMessage").style.display = "none";
  document.getElementById("errorMessage").style.display = "none";
}

// Go back to dashboard
function goBack() {
  window.location.href = "dashboard.html";
}

// Initialize profile page
document.addEventListener("DOMContentLoaded", function () {
  loadProfile();
});

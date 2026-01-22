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
  document.getElementById("nameValue").textContent = child.name || "";
  document.getElementById("ageValue").textContent = child.age || "";
  document.getElementById("genderValue").textContent = getGenderDisplay(
    child.gender,
  );
  document.getElementById("parentValue").textContent = child.parent || "";
  document.getElementById("cityValue").textContent = child.city || "";
  document.getElementById("emailValue").textContent = child.email || "";
  document.getElementById("addressValue").textContent = child.address || "";
  document.getElementById("phoneValue").textContent = child.phone || "";

  // Set values for inputs
  document.getElementById("nameInput").value = child.name || "";
  document.getElementById("ageInput").value = child.age || "";
  document.getElementById("genderInput").value = child.gender || "";
  document.getElementById("parentInput").value = child.parent || "";
  document.getElementById("cityInput").value = child.city || "";
  document.getElementById("emailInput").value = child.email || "";
  document.getElementById("addressInput").value = child.address || "";
  document.getElementById("phoneInput").value = child.phone || "";
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
      name: document.getElementById("nameInput").value,
      age: document.getElementById("ageInput").value,
      gender: document.getElementById("genderInput").value,
      parent: document.getElementById("parentInput").value,
      city: document.getElementById("cityInput").value,
      email: document.getElementById("emailInput").value,
      address: document.getElementById("addressInput").value,
      phone: document.getElementById("phoneInput").value,
    };

    // Validate required fields
    if (
      !updatedData.name ||
      !updatedData.age ||
      !updatedData.gender ||
      !updatedData.parent ||
      !updatedData.city ||
      !updatedData.email
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

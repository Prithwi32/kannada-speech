// Check if user is logged in
function checkUserAuth() {
  const userDetails = localStorage.getItem('userDetails');
  if (!userDetails) {
    window.location.href = 'login.html';
    return;
  }
  
  const user = JSON.parse(userDetails);
  if (!user || !user.id) {
    window.location.href = 'login.html';
    return;
  }
  
  // Display user name
  const userNameElement = document.getElementById('userName');
  if (userNameElement) {
    userNameElement.textContent = user.name || 'ಬಳಕೆದಾರ';
  }
}

// Navigation functions
function navigateToTest() {
  window.location.href = 'age-selection.html';
}

function navigateToProfile() {
  window.location.href = 'profile.html';
}

function navigateToReport() {
  window.location.href = 'report.html';
}

// Logout function
function logout() {
  localStorage.removeItem('sodaResults');
  window.location.href = 'index.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  checkUserAuth();
}); 
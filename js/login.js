document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const childId = parseInt(document.getElementById('childId').value, 10);
  const errorDiv = document.getElementById('loginError');
  errorDiv.textContent = '';
  // Validate
  const res = await fetch('http://localhost:3000/api/children');
  const children = await res.json();
  const child = children.find(child => child.id === childId);
  if (child) {
    localStorage.setItem('userDetails', JSON.stringify(child));
    window.location.href = 'dashboard.html';
  } else {
    errorDiv.textContent = 'ಮಕ್ಕಳ ಸಂಖ್ಯೆ ತಪ್ಪಾಗಿದೆ.';
  }
}); 
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const details = {
    ಹೆಸರು: document.getElementById('name').value,
    ವಯಸ್ಸು: document.getElementById('age').value,
    ಲಿಂಗ: document.getElementById('gender').value,
    ಪೋಷಕರು: document.getElementById('parent').value,
    ನಗರ: document.getElementById('city').value,
    ಇಮೇಲ್: document.getElementById('email').value,
    ವಿಳಾಸ: document.getElementById('address').value,
  };
  
  // Fetch all children to check for duplicates
  const res = await fetch('http://localhost:3000/api/children');
  const children = await res.json();
  
  // Check if child with same details already exists
  const existingChild = children.find(child => 
    child.ಹೆಸರು === details.ಹೆಸರು &&
    child.ವಯಸ್ಸು === details.ವಯಸ್ಸು &&
    child.ಲಿಂಗ === details.ಲಿಂಗ &&
    child.ಪೋಷಕರು === details.ಪೋಷಕರು &&
    child.ಇಮೇಲ್ === details.ಇಮೇಲ್
  );
  
  if (existingChild) {
    // Child already exists, show existing ID and redirect to login
    alert(`ಈಗಾಗಲೇ ನೋಂದಣಿ ಮಾಡಲಾಗಿದೆ!\nನಿಮ್ಮ ಮಕ್ಕಳ ಸಂಖ್ಯೆ (Child ID): ${existingChild.id}\nದಯವಿಟ್ಟು ಲಾಗಿನ್ ಪುಟಕ್ಕೆ ಹೋಗಿ.`);
    setTimeout(() => {
      window.location.replace('login.html');
    }, 100);
    return;
  }
  
  // Generate unique ID (increment last or use Date.now())
  const newId = children.length ? (Math.max(...children.map(c => c.id || 0)) + 1) : 1;
  details.id = newId;
  
  // Register new child
  await fetch('http://localhost:3000/api/children', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details)
  });
  
  // Show the ID to the user
  alert(`ನಿಮ್ಮ ಮಕ್ಕಳ ಸಂಖ್ಯೆ (Child ID): ${newId}\nದಯವಿಟ್ಟು ಇದನ್ನು ಉಳಿಸಿ. ಮುಂದಿನ ಬಾರಿ ಇದನ್ನು ಬಳಸಿ ಲಾಗಿನ್ ಆಗಿ.`);
  // Navigate to login page after alert is dismissed
  setTimeout(() => {
    window.location.replace('login.html');
  }, 100);
}); 
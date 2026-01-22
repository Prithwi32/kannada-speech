document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const details = {
      name: document.getElementById("name").value,
      age: document.getElementById("age").value,
      gender: document.getElementById("gender").value,
      parent: document.getElementById("parent").value,
      city: document.getElementById("city").value,
      email: document.getElementById("email").value,
      address: document.getElementById("address").value,
      phone: document.getElementById("phone").value,
    };

    // Fetch all children to check for duplicates
    const res = await fetch(`${API_BASE_URL}/api/children`);
    const children = await res.json();

    // Check if child with same details already exists
    const existingChild = children.find(
      (child) =>
        child.name === details.name &&
        child.age === details.age &&
        child.gender === details.gender &&
        child.parent === details.parent &&
        child.email === details.email,
    );

    if (existingChild) {
      // Child already exists, show existing ID and redirect to login
      alert(
        `ಈಗಾಗಲೇ ನೋಂದಣಿ ಮಾಡಲಾಗಿದೆ!\nನಿಮ್ಮ ಮಕ್ಕಳ ಸಂಖ್ಯೆ (Child ID): ${existingChild.id}\nದಯವಿಟ್ಟು ಲಾಗಿನ್ ಪುಟಕ್ಕೆ ಹೋಗಿ.`,
      );
      setTimeout(() => {
        window.location.replace("login.html");
      }, 100);
      return;
    }

    // Register new child (let server assign id)
    const regRes = await fetch(`${API_BASE_URL}/api/children`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    const regChild = await regRes.json();

    // Show the ID to the user
    alert(
      `ನಿಮ್ಮ ಮಕ್ಕಳ ಸಂಖ್ಯೆ (Child ID): ${regChild.id}\nದಯವಿಟ್ಟು ಇದನ್ನು ಉಳಿಸಿ. ಮುಂದಿನ ಬಾರಿ ಇದನ್ನು ಬಳಸಿ ಲಾಗಿನ್ ಆಗಿ.`,
    );
    // Navigate to login page after alert is dismissed
    setTimeout(() => {
      window.location.replace("login.html");
    }, 100);
  });

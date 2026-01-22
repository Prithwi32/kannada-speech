// Check if admin is logged in
function checkAdminAuth() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn");
  if (!isLoggedIn) {
    window.location.href = "admin-login.html";
  }
}

// Logout function
function logout() {
  localStorage.removeItem("adminLoggedIn");
  localStorage.removeItem("adminUsername");
  window.location.href = "index.html";
}

// Load children data
async function loadChildrenData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/children`);
    const children = await response.json();

    updateStats(children);
    displayChildrenTable(children);

    // Set up search and filter functionality
    setupSearchAndFilter(children);
  } catch (error) {
    console.error("Error loading children data:", error);
  }
}

// Update statistics
function updateStats(children) {
  const totalChildren = children.length;
  const maleChildren = children.filter((child) => 
    child.gender && child.gender.toLowerCase() === "male"
  ).length;
  const femaleChildren = children.filter(
    (child) => child.gender && child.gender.toLowerCase() === "female",
  ).length;

  const totalAge = children.reduce(
    (sum, child) => sum + parseInt(child.age || 0),
    0,
  );
  const avgAge = totalChildren > 0 ? Math.round(totalAge / totalChildren) : 0;

  document.getElementById("totalChildren").textContent = totalChildren;
  document.getElementById("maleChildren").textContent = maleChildren;
  document.getElementById("femaleChildren").textContent = femaleChildren;
  document.getElementById("avgAge").textContent = avgAge;
}

// Display children table
function displayChildrenTable(children) {
  const tbody = document.getElementById("childrenTableBody");

  if (children.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="no-data">ಯಾವುದೇ ಮಕ್ಕಳ ವಿವರಗಳು ಕಂಡುಬಂದಿಲ್ಲ</td></tr>';
    return;
  }

  tbody.innerHTML = children
    .map(
      (child) => `
    <tr>
      <td>${child.id || ""}</td>
      <td>${child.name || ""}</td>
      <td>${child.age || ""}</td>
      <td>${child.gender || ""}</td>
      <td>${child.parent || ""}</td>
      <td>${child.city || ""}</td>
      <td>${child.email || ""}</td>
      <td>${child.address || ""}</td>
      <td>${child.phone || ""}</td>
    </tr>
  `,
    )
    .join("");
}

// Setup search and filter functionality
function setupSearchAndFilter(allChildren) {
  const searchInput = document.getElementById("searchInput");
  const ageFilter = document.getElementById("ageFilter");
  const genderFilter = document.getElementById("genderFilter");

  function filterChildren() {
    let filteredChildren = [...allChildren];

    // Search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      filteredChildren = filteredChildren.filter(
        (child) =>
          (child.name && child.name.toLowerCase().includes(searchTerm)) ||
          (child.parent && child.parent.toLowerCase().includes(searchTerm)) ||
          (child.city && child.city.toLowerCase().includes(searchTerm)) ||
          (child.email && child.email.toLowerCase().includes(searchTerm)),
      );
    }

    // Age filter
    const selectedAge = ageFilter.value;
    if (selectedAge) {
      filteredChildren = filteredChildren.filter(
        (child) => String(child.age).trim() === selectedAge,
      );
    }

    // Gender filter
    const selectedGender = genderFilter.value;
    if (selectedGender) {
      filteredChildren = filteredChildren.filter(
        (child) => child.gender && child.gender.toLowerCase() === selectedGender.toLowerCase(),
      );
    }

    displayChildrenTable(filteredChildren);
    updateStats(filteredChildren);
  }

  // Add event listeners
  searchInput.addEventListener("input", filterChildren);
  ageFilter.addEventListener("change", filterChildren);
  genderFilter.addEventListener("change", filterChildren);
}

// Initialize admin dashboard
document.addEventListener("DOMContentLoaded", function () {
  checkAdminAuth();
  loadChildrenData();
});

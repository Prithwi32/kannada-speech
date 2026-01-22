function handleDemographics(e) {
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
  fetch(`${API_BASE_URL}/api/children`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
    .then((res) => res.json())
    .then(() => {
      localStorage.setItem("userDetails", JSON.stringify(details));
      window.location.href = "age-selection.html";
    });
}

function selectAge(age) {
  localStorage.setItem("selectedAge", age);
  window.location.href = "screening.html";
}

// Fetch and display child details
function fetchChildDetails() {
  const age = document.getElementById("ageFilter").value;
  const search = document.getElementById("searchBar").value;
  let url = `${API_BASE_URL}/api/children?`;
  if (age) url += `age=${age}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => renderChildDetailsTable(data));
}

function renderChildDetailsTable(children) {
  const container = document.getElementById("childDetailsResults");
  if (!children.length) {
    container.innerHTML =
      '<div style="color:#b71c1c;">ಯಾವುದೇ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ</div>';
    return;
  }
  let html =
    '<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;">';
  html +=
    '<tr style="background:#ede7f6;"><th style="padding:8px;">ಹೆಸರು</th><th style="padding:8px;">ವಯಸ್ಸು</th><th style="padding:8px;">ಪೋಷಕರು</th><th style="padding:8px;">ನಗರ</th></tr>';
  for (const c of children) {
    const name = c["ಹೆಸರು"] || c.name || "";
    const age = c["ವಯಸ್ಸು"] || c.age || "";
    const parent = c["ಪೋಷಕರು"] || c.parent || "";
    const city = c["ನಗರ"] || c.city || "";
    html += `<tr><td style='padding:8px;border-bottom:1px solid #eee;'>${name}</td><td style='padding:8px;border-bottom:1px solid #eee;'>${age}</td><td style='padding:8px;border-bottom:1px solid #eee;'>${parent}</td><td style='padding:8px;border-bottom:1px solid #eee;'>${city}</td></tr>`;
  }
  html += "</table>";
  container.innerHTML = html;
}

// Fetch on page load
window.addEventListener("DOMContentLoaded", fetchChildDetails);
// Optional: fetch on filter change
if (document.getElementById("ageFilter")) {
  document
    .getElementById("ageFilter")
    .addEventListener("change", fetchChildDetails);
}
if (document.getElementById("searchBar")) {
  document.getElementById("searchBar").addEventListener("keyup", function (e) {
    if (e.key === "Enter") fetchChildDetails();
  });
}

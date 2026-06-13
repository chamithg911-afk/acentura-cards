const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

console.log("JS loaded");

const container = document.getElementById("employee-container");

async function fetchEmployees() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/employees?select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const data = await res.json();
    renderCards(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function renderCards(employees) {
  if (!container) return;

  container.innerHTML = "";

  if (!employees || employees.length === 0) {
    container.innerHTML = "<p>No employees found</p>";
    return;
  }

  employees.forEach((emp) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${emp.photo_url || ''}" />
      <div class="name">${emp.full_name}</div>
      <div class="role">${emp.role}</div>
    `;

    container.appendChild(card);
  });
}

fetchEmployees();
console.log("JS loaded");

const orbit = document.getElementById("orbit");

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
    console.log("Employees:", data);

    renderCards(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

function renderCards(employees) {
  if (!orbit) return;

  orbit.innerHTML = "";

  if (!employees || employees.length === 0) {
    orbit.innerHTML = "<p>No employees found</p>";
    return;
  }

  employees.forEach((emp, i) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${emp.photo_url || ''}" />
      <div class="name">${emp.full_name}</div>
      <div class="role">${emp.role}</div>
    `;

    orbit.appendChild(card);
  });
}

fetchEmployees();
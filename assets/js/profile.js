console.log("JS loaded");

const orbit = document.getElementById("orbit");

if (orbit) {
  orbit.innerHTML = `
    <div class="card" style="position:absolute; left:50%; top:50%; transform:translate(-50%, -50%);">
      <img src="https://via.placeholder.com/80" />
      <div class="name">Test User</div>
      <div class="role">Developer</div>
    </div>
  `;
}

console.log("Test card rendered");
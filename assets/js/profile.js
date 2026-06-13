alert("JS is working");

console.log("profile.js loaded");

window.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  console.log("DOM ready");

  const orbit = document.getElementById("orbit");
  const profile = document.getElementById("profile");

  if (!orbit) {
    console.error("Orbit div not found!");
    return;
  }

  fetchEmployees();
}
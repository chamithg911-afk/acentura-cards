console.log("JS loaded");

const orbit = document.getElementById("orbit");
const profile = document.getElementById("profile");

if (!orbit) {
  console.error("Orbit div missing in HTML");
} else {
  orbit.innerHTML = "";
  console.log("Orbit exists ✔");
}
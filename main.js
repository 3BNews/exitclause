// Button sound effect
const clickSfx = document.getElementById("clickSfx");

if (clickSfx) {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      clickSfx.currentTime = 0;
      clickSfx.play();
    });
  });
}

// Crew Page Loader
const container = document.getElementById("characterContainer");
const infoBox = document.getElementById("characterInfo");

if (container) {
  fetch("characters.json")
    .then(res => res.json())
    .then(data => {
      data.forEach(char => {
        const btn = document.createElement("div");
        btn.className = "circle-btn";
        btn.innerText = char.name;
        btn.onclick = () => {
          window.location.href = `profile.html?=${char.tag}`;
        };
        container.appendChild(btn);
      });
    });
}

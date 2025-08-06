// public/particles.js
window.createSparkles = function (containerId, duration = 1500) {
  const container = document.getElementById(containerId);
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    container.appendChild(sparkle);

    setTimeout(() => {
      container.removeChild(sparkle);
    }, duration);
  }
};

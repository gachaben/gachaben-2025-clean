// public/sparkle.js

window.createSparkles = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.pointerEvents = "none";
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;

  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const sparkles = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 3 + 1,
    opacity: 1,
    speed: Math.random() * 0.5 + 0.5,
  }));

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparkles.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 0, ${s.opacity})`;
      ctx.fill();
      s.y -= s.speed;
      s.opacity -= 0.01;
    });

    if (sparkles.some((s) => s.opacity > 0)) {
      requestAnimationFrame(animate);
    } else {
      container.removeChild(canvas);
    }
  };

  animate();
};

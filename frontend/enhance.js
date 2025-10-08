// enhance.js — Umar AI Pro+ Cinematic Edition (with working slider + zoom)
const BACKEND = "";

document.addEventListener("DOMContentLoaded", () => {
  const beforeImg = document.getElementById("beforeImage");
  const afterImg = document.getElementById("afterImage");
  const loader = document.getElementById("loader");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");
  const compareContainer = document.getElementById("compareContainer");
  const compareSlider = document.getElementById("compareSlider");

  // 🧠 Load stored image
  const storedImg = sessionStorage.getItem("uploadedImage");
  beforeImg.src = storedImg || "https://via.placeholder.com/600x400?text=No+Image+Uploaded";
  afterImg.src = beforeImg.src;
  afterImg.style.opacity = 0;

  let enhancedUrl = null;
  let progressInterval = null;
  let zoomLevel = 1, posX = 0, posY = 0, isPanning = false, startX, startY;

  /* =====================================================
     🪄 1️⃣ Compare Slider (Before/After drag)
  ===================================================== */
  let isDown = false;
  function moveSlider(e) {
    if (!isDown) return;
    const rect = compareContainer.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.min(Math.max(pos, 0), 100);
    afterImg.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
    compareSlider.style.left = `${pos}%`;
  }
  compareSlider.addEventListener("mousedown", () => (isDown = true));
  compareSlider.addEventListener("touchstart", () => (isDown = true));
  window.addEventListener("mouseup", () => (isDown = false));
  window.addEventListener("touchend", () => (isDown = false));
  window.addEventListener("mousemove", moveSlider);
  window.addEventListener("touchmove", moveSlider);

  /* =====================================================
     🧭 2️⃣ Zoom & Pan Controls
  ===================================================== */
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const resetBtn = document.getElementById("resetBtn");

  function updateZoom() {
    [beforeImg, afterImg].forEach((img) => {
      img.style.transform = `scale(${zoomLevel}) translate(${posX / 50}%, ${posY / 50}%)`;
      img.style.transition = "transform 0.2s ease";
    });
  }

  zoomInBtn.addEventListener("click", () => {
    zoomLevel = Math.min(zoomLevel + 0.2, 3);
    updateZoom();
  });
  zoomOutBtn.addEventListener("click", () => {
    zoomLevel = Math.max(zoomLevel - 0.2, 1);
    updateZoom();
  });
  resetBtn.addEventListener("click", () => {
    zoomLevel = 1;
    posX = 0;
    posY = 0;
    afterImg.style.clipPath = "inset(0 50% 0 0)";
    compareSlider.style.left = "50%";
    updateZoom();
  });

  compareContainer.addEventListener("mousedown", (e) => {
    if (zoomLevel <= 1) return;
    isPanning = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });
  window.addEventListener("mouseup", () => (isPanning = false));
  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateZoom();
  });
  compareContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomLevel += e.deltaY < 0 ? 0.1 : -0.1;
    zoomLevel = Math.min(Math.max(zoomLevel, 1), 3);
    updateZoom();
  });
  // 📱 Touch pinch zoom for mobile
let lastDist = 0;
compareContainer.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (lastDist) {
      const delta = dist - lastDist;
      zoomLevel += delta * 0.001;
      zoomLevel = Math.min(Math.max(zoomLevel, 1), 3);
      updateZoom();
    }
    lastDist = dist;
  }
});

compareContainer.addEventListener("touchend", () => (lastDist = 0));


  /* =====================================================
     🎬 3️⃣ Cinematic Loader + Progress Animation
  ===================================================== */
  function startProgress() {
    progressBar.style.display = "block";
    progressFill.style.width = "0%";
    let width = 0;
    progressInterval = setInterval(() => {
      if (width >= 95) return;
      width += Math.random() * 4;
      progressFill.style.width = `${Math.min(width, 95)}%`;
    }, 250);
  }
  function endProgress() {
    clearInterval(progressInterval);
    progressFill.style.width = "100%";
    setTimeout(() => (progressBar.style.display = "none"), 800);
  }

  const messages = [
    "Restoring lost pixels... 🪄",
    "Sharpening clarity 🔍",
    "Color-balancing magic 🎨",
    "Bringing life to your photo ✨",
    "AI enhancement in progress ⚙️",
  ];

  /* =====================================================
     ⚡ 4️⃣ Enhancement Handler
  ===================================================== */
  async function enhance(type = "enhance") {
    const file = await fetch(beforeImg.src).then((r) => r.blob());
    const formData = new FormData();
    formData.append("file", file, "upload.jpg");

    loader.style.display = "flex";
    loader.querySelector("p").textContent = messages[Math.floor(Math.random() * messages.length)];
    startProgress();

    try {
      const res = await fetch(`${BACKEND}/api/enhance?type=${type}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      endProgress();
      loader.style.display = "none";

      if (!res.ok) return alert(data.error || "Enhancement failed.");

      enhancedUrl = data.enhanced.startsWith("http")
        ? data.enhanced
        : `${BACKEND}${data.enhanced}`;

      afterImg.style.opacity = 0;
      afterImg.src = enhancedUrl;
      setTimeout(() => {
        afterImg.style.transition = "opacity 1.2s ease-in-out";
        afterImg.style.opacity = 1;
      }, 100);

      alert(`✅ ${type.toUpperCase()} complete!`);
    } catch (err) {
      loader.style.display = "none";
      endProgress();
      console.error(err);
      alert("Server error: " + err.message);
    }
  }

  // 🎛️ Enhancement Buttons
  document.getElementById("enhanceBtn").addEventListener("click", () => enhance("enhance"));
  document.getElementById("sharpenBtn").addEventListener("click", () => enhance("sharpen"));
  document.getElementById("colorizeBtn").addEventListener("click", () => enhance("colorize"));
  document.getElementById("restoreBtn").addEventListener("click", () => enhance("restore"));

  // ⬇️ Download Button
  document.getElementById("downloadBtn").addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = enhancedUrl || afterImg.src;
    link.download = "umar_ai_enhanced.jpg";
    link.click();
  });
});

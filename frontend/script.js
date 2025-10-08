// frontend/script.js

const BACKEND = ""; // same origin (frontend + backend on same server)
const fileInput = document.getElementById("fileInput");
const loader = document.getElementById("loader");

// 🧠 File Upload & Redirect Handler
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return alert("Please select an image file first!");

  // 🖼️ Show local preview instantly
  const reader = new FileReader();
  reader.onload = () => {
    // ✅ Save uploaded image temporarily for next page
    sessionStorage.setItem("uploadedImage", reader.result);

    // ✅ Redirect user to enhance.html
    window.location.href = "enhance.html";
  };

  // Read the image file as base64
  reader.readAsDataURL(file);
});



  // 🔄 Show loader (if exists)
  if (loader) loader.style.display = "flex";

  const formData = new FormData();
  formData.append("file", file);

  try {
    // No Authorization header required
    const res = await fetch(`${BACKEND}/api/enhance`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (loader) loader.style.display = "none";

    if (!res.ok) {
      alert(data.error || "Enhancement failed.");
      return;
    }

    // 🖼️ Update After Image
    afterImage.src = data.enhanced.startsWith("http")
      ? data.enhanced
      : `${BACKEND}${data.enhanced}`;

    alert("✅ Image enhanced successfully!");
  } catch (err) {
    if (loader) loader.style.display = "none";
    console.error(err);
    alert("Error connecting to backend.");
  };

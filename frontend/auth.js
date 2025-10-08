// ==========================
// Auth Logic (Login/Register)
// ==========================
const BACKEND = ""; // same origin (backend+frontend same server)

// detect which page
const isLoginPage = window.location.pathname.includes("login");

const btn = document.getElementById(isLoginPage ? "loginBtn" : "registerBtn");
btn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) return alert("Please fill all fields.");

  const endpoint = isLoginPage ? "/api/auth/login" : "/api/auth/register";
  const payload = isLoginPage
    ? { email, password }
    : {
        name: document.getElementById("name").value.trim(),
        email,
        password,
      };

  try {
    const res = await fetch(`${BACKEND}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Authentication failed");

    // Store token
    localStorage.setItem("umar_token", data.token);
    localStorage.setItem("umar_user", JSON.stringify(data.user));

    alert("✅ Login successful!");
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});

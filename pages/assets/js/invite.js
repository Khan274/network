const SUPABASE_URL = "https://drvasafwzixcbiuuqxfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initCursorGlow();

  document.getElementById("current-year").textContent = new Date().getFullYear();

  // Get user
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    alert("You're not logged in.");
    window.location.href = "sign-in.html";
    return;
  }

  const userId = user.id;

  // Fetch referral_code
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("referral_code")
    //.eq("id", userId)
    .single();

  if (profileError || !profile) {
    alert("Could not load referral info.");
    console.error(profileError);
    return;
  }

  const referralCode = profile.referral_code || "UNKNOWN";
  const referralLink = `https://www.ubuilderspk.com/pages/sign-up.html?ref=${referralCode}`;

  document.getElementById("referral-code").textContent = referralCode;
  document.getElementById("referral-link").value = referralLink;

  setupShareButtons(referralLink, referralCode);

  // Copy code
  document.getElementById("copy-code-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      showToast("Referral code copied!");
      animateCopyButton("copy-code-btn");
    });
  });

  // Copy link
  document.getElementById("copy-link-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      showToast("Referral link copied!");
      animateCopyButton("copy-link-btn");
    });
  });
});

/* ---------------------------------------------------
   THEME TOGGLE (FIXED + FULLY WORKING)
--------------------------------------------------- */
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");

  // Apply saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  if (!themeToggle) {
    console.warn("Theme toggle button not found (id='theme-toggle').");
    return;
  }

  // Toggle theme on click
  themeToggle.onclick = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // Optional (if your button contains icons)
    updateThemeToggleIcon(themeToggle, newTheme);
  };

  // Initialize icon state
  updateThemeToggleIcon(themeToggle, savedTheme);
}

// Switch icon (if needed)
function updateThemeToggleIcon(btn, theme) {
  if (!btn) return;

  const sun = btn.querySelector(".sun-icon");
  const moon = btn.querySelector(".moon-icon");

  if (!sun || !moon) return;

  if (theme === "dark") {
    sun.style.display = "block";
    moon.style.display = "none";
  } else {
    sun.style.display = "none";
    moon.style.display = "block";
  }
}

/* ---------------------------------------------------
   CURSOR GLOW
--------------------------------------------------- */
function initCursorGlow() {
  const cursorGlow = document.getElementById("cursor-glow");

  if (!cursorGlow) return;

  document.addEventListener("mousemove", (e) => {
    cursorGlow.style.left = e.clientX + "px";
    cursorGlow.style.top = e.clientY + "px";
  });
}

/* ---------------------------------------------------
   TOAST
--------------------------------------------------- */
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  toastMessage.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ---------------------------------------------------
   COPY BUTTON ANIMATION
--------------------------------------------------- */
function animateCopyButton(buttonId) {
  const button = document.getElementById(buttonId);
  button.classList.add("copied");

  const originalHTML = button.innerHTML;

  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    Copied!
  `;

  setTimeout(() => {
    button.classList.remove("copied");
    button.innerHTML = originalHTML;
  }, 2000);
}

/* ---------------------------------------------------
   SHARE BUTTONS
--------------------------------------------------- */
function setupShareButtons(referralLink, referralCode) {
  const shareText = `Join U-Network using my referral code: ${referralCode}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedLink = encodeURIComponent(referralLink);

  document.getElementById("share-whatsapp").href =
    `https://wa.me/?text=${encodedText}%20${encodedLink}`;

  document.getElementById("share-twitter").href =
    `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}`;

  document.getElementById("share-telegram").href =
    `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
}

/* ---------------------------------------------------
   SCROLL REVEAL
--------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach((el) => observer.observe(el));
}

window.addEventListener("load", initScrollReveal);

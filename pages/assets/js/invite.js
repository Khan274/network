const SUPABASE_URL = "https://drvasafwzixcbiuuqxfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize theme
  initTheme();
  
  // Initialize cursor glow effect
  initCursorGlow();
  
  // Set current year in footer
  document.getElementById("current-year").textContent = new Date().getFullYear();

  // Get the current user
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

  // Fetch referral_code from profile
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    alert("Could not load referral info.");
    console.error(profileError);
    return;
  }

  const referralCode = profile.referral_code || "UNKNOWN";
  const referralLink = `https://www.ubuilderspk.com/pages/sign-up.html?ref=${referralCode}`;

  // Inject values into the DOM
  document.getElementById("referral-code").textContent = referralCode;
  document.getElementById("referral-link").value = referralLink;

  // Setup share buttons
  setupShareButtons(referralLink, referralCode);

  // Copy Code Button
  document.getElementById("copy-code-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      showToast("Referral code copied!");
      animateCopyButton("copy-code-btn");
    });
  });

  // Copy Link Button
  document.getElementById("copy-link-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      showToast("Referral link copied!");
      animateCopyButton("copy-link-btn");
    });
  });
});

// Theme toggle functionality
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme") || "light";
  
  document.documentElement.setAttribute("data-theme", savedTheme);
  
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

// Cursor glow effect
function initCursorGlow() {
  const cursorGlow = document.getElementById("cursor-glow");
  
  document.addEventListener("mousemove", (e) => {
    cursorGlow.style.left = e.clientX + "px";
    cursorGlow.style.top = e.clientY + "px";
  });
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  
  toastMessage.textContent = message;
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Animate copy button
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

// Setup share buttons
function setupShareButtons(referralLink, referralCode) {
  const shareText = `Join U-Network using my referral code: ${referralCode}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedLink = encodeURIComponent(referralLink);
  
  // WhatsApp
  document.getElementById("share-whatsapp").href = 
    `https://wa.me/?text=${encodedText}%20${encodedLink}`;
  
  // Twitter/X
  document.getElementById("share-twitter").href = 
    `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}`;
  
  // Telegram
  document.getElementById("share-telegram").href = 
    `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
}

// Scroll reveal animation
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

// Initialize scroll reveal on load
window.addEventListener("load", initScrollReveal);

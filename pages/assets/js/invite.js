const SUPABASE_URL = "https://drvasafwzixcbiuuqxfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw"; // shortened for clarity

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
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

  // Copy Code Button
  document.getElementById("copy-code-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      alert("Referral code copied!");
    });
  });

  // Copy Link Button
  document.getElementById("copy-link-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      alert("Referral link copied!");
    });
  });
});

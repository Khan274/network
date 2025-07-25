const SUPABASE_URL = "https://drvasafwzixcbiuuqxfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const urlParams = new URLSearchParams(window.location.search);
  const refCodeFromURL = urlParams.get("ref");
  const referralInput = form.querySelector('input[placeholder*="Referral"]');

  if (refCodeFromURL && referralInput) {
    referralInput.value = refCodeFromURL.toUpperCase();
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = form.querySelector('input[placeholder="Full Name"]').value.trim();
    const phone = form.querySelector('input[placeholder="Phone Number"]').value.trim();
    const email = form.querySelector('input[placeholder="Email"]').value.trim();
    const password = form.querySelector('input[placeholder="Password"]').value.trim();
    const referralCode = referralInput.value.trim() || null;

    if (!name || !email || !phone || !password) {
      alert("Please fill all required fields.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Signing up...";

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (authError || !authData?.user) {
      alert("Signup failed: " + (authError?.message || "No user returned."));
      submitBtn.disabled = false;
      submitBtn.innerText = "Sign up";
      return;
    }

    const user = authData.user;
    const userId = user.id;

    let referred_by_id = null;
    let referred_by_grand_id = null;

    if (referralCode) {
      // Step 1: Find direct referrer by their referral code
      const { data: refUser, error: refError } = await supabaseClient
        .from("profiles")
        .select("id, referred_by_id")
        .eq("referral_code", referralCode)
        .single();

      if (!refError && refUser) {
        referred_by_id = refUser.id;
        referred_by_grand_id = refUser.referred_by_id || null;
      } else {
        console.warn("Invalid referral code or referrer not found.");
      }
    }

    // Step 2: Generate a unique referral code for the new user
    const generatedCode = userId.slice(0, 8).toUpperCase();

    // Step 3: Insert into profiles table
    const { error: dbError } = await supabaseClient.from("profiles").insert([
      {
        id: userId,
        name,
        email,
        phone,
        referral_code_used: referralCode,
        referral_code: generatedCode,
        referred_by_id,
        referred_by_grand_id,
        wallet_balance: 0,
        created_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      alert("User created, but failed to save profile: " + dbError.message);
      submitBtn.disabled = false;
      submitBtn.innerText = "Sign up";
    } else {
      alert("Account created successfully!");
      window.location.href = "sign-in.html";
    }
  });
});

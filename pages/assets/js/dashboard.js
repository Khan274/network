const SUPABASE_URL = "https://drvasafwzixcbiuuqxfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    alert("Not logged in.");
    window.location.href = "sign-in.html";
    return;
  }

  const userId = user.id;

  // Load current user's profile
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("plan_name, referral_code, wallet_balance")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    console.error("Failed to load profile:", profileError);
    return;
  }

  const userPlan = profile.plan_name;
  const referralCode = profile.referral_code;

  const plans = {
    "Starter Plan": { price: 400, direct: 8, indirect: 1 },
    "Growth Plan": { price: 560, direct: 10, indirect: 2 },
    "Elite Plan": { price: 750, direct: 15, indirect: 4 },
  };

  const selectedPlan = plans[userPlan];
  if (!selectedPlan || !referralCode) {
    console.warn("Plan or referral code missing.");
    return;
  }

  // 1️⃣ Fetch direct referrals
  const { data: directReferrals, error: directError } = await supabaseClient
    .from("profiles")
    .select("id, referral_code")
    .eq("referral_code_used", referralCode);

  if (directError) {
    console.error("Failed to load direct referrals:", directError);
    return;
  }

  const perDirect = (selectedPlan.price * selectedPlan.direct) / 100;
  const directCount = directReferrals.length;
  let directEarnings = directCount * perDirect;

  // 2️⃣ Fetch indirect referrals
  let indirectCount = 0;
  let indirectEarnings = 0;

  for (const direct of directReferrals) {
    const { data: indirects, error: indirectError } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("referral_code_used", direct.referral_code);

    if (!indirectError && indirects.length > 0) {
      indirectCount += indirects.length;
      const perIndirect = (selectedPlan.price * selectedPlan.indirect) / 100;
      indirectEarnings += indirects.length * perIndirect;
    }
  }

  const totalEarnings = directEarnings + indirectEarnings;

  // 3️⃣ Update wallet balance (optional: reset weekly manually via Supabase UI)
  await supabaseClient
    .from("profiles")
    .update({ wallet_balance: totalEarnings })
    .eq("id", userId);

  // 4️⃣ Update UI
  document.getElementById("plan-name").textContent = userPlan || "Not Set";
  document.getElementById("total-invites").textContent = directCount + indirectCount;
  document.getElementById("wallet-balance").textContent = `PKR ${totalEarnings.toFixed(0)}`;
  document.getElementById("total-earnings").textContent = `PKR ${totalEarnings.toFixed(0)}`;

  const directElem = document.getElementById("direct-invites");
  if (directElem) directElem.textContent = `Direct Invites: ${directCount}`;

  const indirectElem = document.getElementById("indirect-invites");
  if (indirectElem) indirectElem.textContent = `Indirect Invites: ${indirectCount}`;
});

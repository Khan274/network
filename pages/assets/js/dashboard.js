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
    .select("plan_name, referral_code, wallet_balance, total_earnings")
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

  // Initialize earnings and counters
  let directEarnings = 0;
  let indirectEarnings = 0;
  let directCount = 0;
  let indirectCount = 0;

  // 1️⃣ Fetch direct referrals who have purchased a plan
  const { data: directReferrals, error: directError } = await supabaseClient
    .from("profiles")
    .select("id, referral_code, plan_name")
    .eq("referral_code_used", referralCode)
    .not("plan_name", "is", null);

  if (directError) {
    console.error("Failed to load direct referrals:", directError);
    return;
  }

  directCount = directReferrals.length;

  // ➕ Calculate direct earnings
  for (const direct of directReferrals) {
    const referredPlan = plans[direct.plan_name];
    if (referredPlan) {
      const earning = (referredPlan.price * selectedPlan.direct) / 100;
      directEarnings += earning;
    }
  }

  // 2️⃣ Fetch indirect referrals for each direct user
  for (const direct of directReferrals) {
    const { data: indirects, error: indirectError } = await supabaseClient
      .from("profiles")
      .select("plan_name")
      .eq("referral_code_used", direct.referral_code)
      .not("plan_name", "is", null);

    if (indirectError) continue;

    for (const indirect of indirects) {
      const indirectPlan = plans[indirect.plan_name];
      if (indirectPlan) {
        const earning = (indirectPlan.price * selectedPlan.indirect) / 100;
        indirectEarnings += earning;
      }
    }

    indirectCount += indirects.length;
  }

  const totalEarnings = directEarnings + indirectEarnings;

  // 3️⃣ Update only total_earnings (lifetime tracker)
  await supabaseClient
    .from("profiles")
    .update({ total_earnings: totalEarnings })
    .eq("id", userId);

  // ⚡ wallet_balance will stay as stored in DB (manual reset possible)

  // 4️⃣ Update UI
  document.getElementById("plan-name").textContent = userPlan || "Not Set";
  document.getElementById("total-invites").textContent = directCount + indirectCount;
  document.getElementById("wallet-balance").textContent = `PKR ${profile.wallet_balance.toLocaleString()}`;
  document.getElementById("total-earnings").textContent = `PKR ${totalEarnings.toLocaleString()}`;

  const directElem = document.getElementById("direct-invites");
  if (directElem) directElem.textContent = `Direct Invites: ${directCount}`;

  const indirectElem = document.getElementById("indirect-invites");
  if (indirectElem) indirectElem.textContent = `Indirect Invites: ${indirectCount}`;
});

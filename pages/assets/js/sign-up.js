const SUPABASE_URL = "https://drvasafwzixcbiuuqxfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const submitBtn = document.getElementById("submitBtn");
    const passwordInput = document.getElementById("password");
    const passwordToggle = document.getElementById("passwordToggle");
    const errorMessage = document.getElementById("errorMessage");
    const successMessage = document.getElementById("successMessage");
    const referralInput = document.getElementById("referral");

    if (!form) return;

    // Prefill referral from URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCodeFromURL = urlParams.get("ref");
    if (refCodeFromURL && referralInput) {
        referralInput.value = refCodeFromURL.toUpperCase();
    }

    // Password toggle
    passwordToggle.addEventListener("click", function () {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        this.classList.toggle("active", isPassword);
    });

    // Input focus animations
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
        input.addEventListener("focus", () => input.parentElement.classList.add("focused"));
        input.addEventListener("blur", () => input.parentElement.classList.remove("focused"));
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.add("show");
        successMessage.classList.remove("show");
    }

    function showSuccess(msg) {
        successMessage.textContent = msg;
        successMessage.classList.add("show");
        errorMessage.classList.remove("show");
    }

    function hideMessages() {
        errorMessage.classList.remove("show");
        successMessage.classList.remove("show");
    }

    function setLoading(loading) {
        submitBtn.disabled = loading;
        submitBtn.classList.toggle("loading", loading);
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        hideMessages();
        setLoading(true);

        const name = document.getElementById("fullName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const referralCode = referralInput.value.trim() || null;

        if (!name || !email || !phone || !password) {
            showError("Please fill all required fields.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            showError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            // Supabase Auth signup
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email,
                password,
            });

            if (authError || !authData?.user) {
                throw new Error(authError?.message || "Signup failed.");
            }

            const userId = authData.user.id;

            let referred_by_id = null;
            let referred_by_grand_id = null;

            if (referralCode) {
                const { data: refUser, error: refError } = await supabaseClient
                    .from("profiles")
                    .select("id, referred_by_id")
                    .eq("referral_code", referralCode)
                    .single();

                if (!refError && refUser) {
                    referred_by_id = refUser.id;
                    referred_by_grand_id = refUser.referred_by_id || null;
                } else {
                    console.warn("Invalid referral code.");
                }
            }

            const generatedCode = userId.slice(0, 8).toUpperCase();

            const { error: dbError } = await supabaseClient.from("profiles").insert([
                {
                    id: userId,
                    name,
                    email,
                    phone,
                    referral_code: generatedCode,
                    referral_code_used: referralCode,
                    referred_by_id,
                    referred_by_grand_id,
                    wallet_balance: 0,
                    created_at: new Date().toISOString(),
                },
            ]);

            if (dbError) {
                showError("User created, but profile saving failed: " + dbError.message);
                setLoading(false);
                return;
            }

            showSuccess("Account created successfully!");
            setTimeout(() => {
                window.location.href = "sign-in.html";
            }, 2000);

        } catch (err) {
            showError(err.message || "An error occurred. Please try again.");
            setLoading(false);
        }
    });

    // Pre-focus filled inputs (for floating label effect)
    inputs.forEach((input) => {
        if (input.value) {
            input.dispatchEvent(new Event("focus"));
            input.dispatchEvent(new Event("blur"));
        }
    });
});

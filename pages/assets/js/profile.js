// Initialize Supabase
const SUPABASE_URL = 'https://drvasafwzixcbiuuqxfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      window.location.href = 'sign-in.html'; // Redirect if not logged in
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('User not found.');
      return;
    }

    const userId = user.id;

    // Fetch user data from Supabase "profiles" table
    const { data: userData, error: fetchError } = await supabase
      .from('profiles')
      .select('name, phone, email, referral_code')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Inject data into DOM
    document.getElementById('profile-name').textContent = userData.name || 'N/A';
    document.getElementById('referral-code').textContent = `Referral Code: ${userData.referral_code || 'N/A'}`;
    document.getElementById('user-email').textContent = userData.email || 'N/A';
    document.getElementById('user-mobile').textContent = userData.phone || 'N/A';

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signOut();
        if (error) {
          alert('Logout failed: ' + error.message);
        } else {
          window.location.href = 'sign-in.html';
        }
      });
    }

    // Handle change password
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'cp.html'; // redirect to change password page
      });
    }

  } catch (err) {
    console.error('Profile load error:', err.message);
    alert('There was a problem loading your profile.');
  }
});

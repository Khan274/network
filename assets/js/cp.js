const SUPABASE_URL = 'https://drvasafwzixcbiuuqxfa.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw'; // Truncated for brevity

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = 'sign-in.html';
    return;
  }

  const form = document.getElementById('change-password-form');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const submitBtn = document.getElementById('submit-btn');
  const messageBox = document.getElementById('form-message');

  const passwordLengthError = document.getElementById('password-length-error');
  const passwordMatchError = document.getElementById('password-match-error');

  function showMessage(text, isError = false) {
    messageBox.textContent = text;
    messageBox.className = isError
      ? 'text-red-600 text-sm mt-3 text-center'
      : 'text-green-600 text-sm mt-3 text-center';
  }

  function validatePasswords() {
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    let isValid = true;

    // Check password length
    if (newPassword.length < 6) {
      passwordLengthError.classList.remove('hidden');
      isValid = false;
    } else {
      passwordLengthError.classList.add('hidden');
    }

    // Check match
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      passwordMatchError.classList.remove('hidden');
      isValid = false;
    } else {
      passwordMatchError.classList.add('hidden');
    }

    // Enable/disable button
    submitBtn.disabled = !isValid;
    submitBtn.classList.toggle('bg-gray-400', !isValid);
    submitBtn.classList.toggle('cursor-not-allowed', !isValid);
    submitBtn.classList.toggle('bg-gradient-to-tl', isValid);
    submitBtn.classList.toggle('from-blue-600', isValid);
    submitBtn.classList.toggle('to-cyan-400', isValid);
    submitBtn.classList.toggle('hover:scale-102', isValid);

    return isValid;
  }

  newPasswordInput.addEventListener('input', validatePasswords);
  confirmPasswordInput.addEventListener('input', validatePasswords);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!validatePasswords()) return;

    // Disable button + show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing...';
    showMessage('');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      showMessage('Failed to update password. Try again.', true);
      console.error('Error:', error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Change Password';
    } else {
      showMessage('Password changed successfully. Redirecting...');
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = 'sign-in.html';
      }, 1500);
    }
  });
});

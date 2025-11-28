const SUPABASE_URL = "https://drvasafwzixcbiuuqxfa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggles();
    initLoginForm();
    initSignupForm();
});

function initPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const inputGroup = this.closest('.input-group');
            const passwordInput = inputGroup.querySelector('input');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.add('active');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('active');
            }
        });
    });
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    const successElement = document.getElementById('successMessage');
    
    if (successElement) {
        successElement.classList.remove('show');
        successElement.textContent = '';
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        errorElement.style.animation = 'none';
        errorElement.offsetHeight;
        errorElement.style.animation = 'shakeIn 0.4s ease';
    }
}

function showSuccess(message) {
    const errorElement = document.getElementById('errorMessage');
    const successElement = document.getElementById('successMessage');
    
    if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
    
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.add('show');
    }
}

function hideMessages() {
    const errorElement = document.getElementById('errorMessage');
    const successElement = document.getElementById('successMessage');
    
    if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
    
    if (successElement) {
        successElement.classList.remove('show');
        successElement.textContent = '';
    }
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.classList.remove('loading');
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('submitBtn');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email) {
            showError('Please enter your email address.');
            emailInput.focus();
            return;
        }
        
        if (!validateEmail(email)) {
            showError('Please enter a valid email address.');
            emailInput.focus();
            return;
        }
        
        if (!password) {
            showError('Please enter your password.');
            passwordInput.focus();
            return;
        }
        
        setButtonLoading(submitBtn, true);
        
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) {
                let errorMessage = 'Login failed. Please try again.';
                
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Invalid email or password. Please check your credentials.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Please verify your email address before logging in.';
                } else if (error.message.includes('Too many requests')) {
                    errorMessage = 'Too many login attempts. Please wait a moment and try again.';
                } else {
                    errorMessage = error.message;
                }
                
                showError(errorMessage);
                setButtonLoading(submitBtn, false);
            } else {
                showSuccess('Login successful!');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        } catch (err) {
            showError('An unexpected error occurred. Please try again.');
            setButtonLoading(submitBtn, false);
            console.error('Login error:', err);
        }
    });
}

function initSignupForm() {
    const signupForm = document.getElementById('signupForm');
    
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const submitBtn = document.getElementById('submitBtn');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : password;
        
        if (!email) {
            showError('Please enter your email address.');
            emailInput.focus();
            return;
        }
        
        if (!validateEmail(email)) {
            showError('Please enter a valid email address.');
            emailInput.focus();
            return;
        }
        
        if (!password) {
            showError('Please enter a password.');
            passwordInput.focus();
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long.');
            passwordInput.focus();
            return;
        }
        
        if (confirmPasswordInput && password !== confirmPassword) {
            showError('Passwords do not match.');
            confirmPasswordInput.focus();
            return;
        }
        
        setButtonLoading(submitBtn, true);
        
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
            });
            
            if (error) {
                let errorMessage = 'Sign up failed. Please try again.';
                
                if (error.message.includes('already registered')) {
                    errorMessage = 'This email is already registered. Please log in instead.';
                } else if (error.message.includes('Password')) {
                    errorMessage = error.message;
                } else {
                    errorMessage = error.message;
                }
                
                showError(errorMessage);
                setButtonLoading(submitBtn, false);
            } else {
                showSuccess('Account created! Please check your email to verify your account.');
                signupForm.reset();
                setButtonLoading(submitBtn, false);
            }
        } catch (err) {
            showError('An unexpected error occurred. Please try again.');
            setButtonLoading(submitBtn, false);
            console.error('Signup error:', err);
        }
    });
}

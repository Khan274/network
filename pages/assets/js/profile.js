// Initialize Supabase
const SUPABASE_URL = 'https://drvasafwzixcbiuuqxfa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydmFzYWZ3eml4Y2JpdXVxeGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjI3MzgsImV4cCI6MjA2ODgzODczOH0.WlHFd8vV31cQG8BUlmQPki3CJK6B4YFRfSYfnkveJQw';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

document.addEventListener('DOMContentLoaded', async () => {
  initUI();
  
  // Check for demo mode via URL parameter (?demo=true)
  const urlParams = new URLSearchParams(window.location.search);
  const isDemo = urlParams.get('demo') === 'true';
  
  try {
    // Check session
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
      // If demo mode is enabled, show sample data instead of redirecting
      if (isDemo) {
        loadDemoData();
        hideLoading();
        return;
      }
      
      // Production: Redirect if not logged in
      window.location.href = 'sign-in.html';
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      alert('User not found.');
      return;
    }

    const userId = user.id;

    // Fetch user data from Supabase "profiles" table
    const { data: userData, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('name, phone, email, referral_code')
      .single();

    if (fetchError) throw fetchError;

    // Inject data into DOM
    document.getElementById('profile-name').textContent = userData.name || 'N/A';
    document.getElementById('referral-code').textContent = `Referral Code: ${userData.referral_code || 'N/A'}`;
    document.getElementById('user-email').textContent = userData.email || 'N/A';
    document.getElementById('user-mobile').textContent = userData.phone || 'N/A';

    // Update sidebar plan if exists
    const sidebarPlan = document.getElementById('sidebar-plan');
    if (sidebarPlan) {
      sidebarPlan.textContent = 'Active';
    }

    hideLoading();

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
          alert('Logout failed: ' + error.message);
        } else {
          window.location.href = 'sign-in.html';
        }
      });
    }

    // Handle dropdown logout
    const dropdownLogoutBtn = document.getElementById('logoutBtn');
    if (dropdownLogoutBtn) {
      dropdownLogoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const { error } = await supabaseClient.auth.signOut();
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
    hideLoading();
  }
});

function initUI() {
  initThemeToggle();
  initSidebar();
  initProfileDropdown();
  initCursorGlow();
  setCurrentYear();
  initAOS();
}

function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 300);
  }
}

function loadDemoData() {
  // Demo data for preview purposes
  const demoData = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+92 300 1234567',
    referral_code: 'DEMO2025'
  };
  
  document.getElementById('profile-name').textContent = demoData.name;
  document.getElementById('referral-code').textContent = `Referral Code: ${demoData.referral_code}`;
  document.getElementById('user-email').textContent = demoData.email;
  document.getElementById('user-mobile').textContent = demoData.phone;
  
  // Update sidebar plan
  const sidebarPlan = document.getElementById('sidebar-plan');
  if (sidebarPlan) {
    sidebarPlan.textContent = 'Demo Plan';
  }
  
  // Setup button handlers for demo mode
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Demo mode - Logout would redirect to sign-in page');
    });
  }

  const dropdownLogoutBtn = document.getElementById('logoutBtn');
  if (dropdownLogoutBtn) {
    dropdownLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Demo mode - Logout would redirect to sign-in page');
    });
  }
  
  const changePasswordBtn = document.getElementById('change-password-btn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Demo mode - Would redirect to change password page');
    });
  }
}

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
}

function initSidebar() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarClose = document.getElementById('sidebarClose');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
      document.body.classList.toggle('sidebar-open');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    });
  }
}

function initProfileDropdown() {
  const profileDropdown = document.getElementById('profileDropdown');
  const profileBtn = document.getElementById('profileBtn');

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove('active');
      }
    });
  }
}

function initCursorGlow() {
  const cursorGlow = document.querySelector('.cursor-glow');
  
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }
}

function setCurrentYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function initAOS() {
  // Simple scroll reveal animation
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Frontend auth helper for login.html and register.html
 */

// safe API base: use existing global API_BASE if present, otherwise fallback
const APP_API_BASE = (typeof API_BASE !== 'undefined') ? API_BASE : (window.API_BASE || 'http://localhost:5000');

function togglePassword(id = 'password') {
  const pwd = document.getElementById(id);
  const btnIcon = document.querySelector(`#${id} ~ .toggle-password i`) || document.querySelector('.toggle-password i');
  if (!pwd) return;
  if (pwd.type === 'password') {
    pwd.type = 'text';
    if (btnIcon) { btnIcon.classList.remove('fa-eye'); btnIcon.classList.add('fa-eye-slash'); }
  } else {
    pwd.type = 'password';
    if (btnIcon) { btnIcon.classList.remove('fa-eye-slash'); btnIcon.classList.add('fa-eye'); }
  }
}

// expose logout globally
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  window.dispatchEvent(new CustomEvent('authChanged', { detail: { authenticated: false } }));
  window.location.href = 'index.html';
}
window.logout = logout;

document.addEventListener('DOMContentLoaded', () => {
  // LOGIN handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('email')?.value || '').trim();
      const password = (document.getElementById('password')?.value || '');
      const remember = document.getElementById('remember')?.checked;
      if (!email || !password) { alert('Enter email and password'); return; }

      try {
        const res = await fetch(`${APP_API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) { alert(data.message || 'Login failed'); return; }
        if (!data.token) { alert('No token returned'); return; }

        if (remember) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user || {}));
        } else {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user || {}));
        }

        window.dispatchEvent(new CustomEvent('authChanged', { detail: { authenticated: true, user: data.user || null, token: data.token } }));
        window.location.href = 'index.html';
      } catch (err) {
        console.error('Login error', err);
        alert('Network error - ensure backend is running at ' + APP_API_BASE);
      }
    });
  }

  // REGISTER handler
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = (document.getElementById('firstName')?.value || '').trim();
      const lastName = (document.getElementById('lastName')?.value || '').trim();
      const email = (document.getElementById('email')?.value || '').trim();
      const phoneNumber = (document.getElementById('phoneNumber')?.value || '').trim();
      const password = (document.getElementById('password')?.value || '');
      const terms = document.getElementById('terms') ? document.getElementById('terms').checked : true;

      if (!firstName || !email || !password) { alert('Please fill required fields'); return; }
      if (!terms) { alert('You must accept Terms & Conditions'); return; }

      try {
        const res = await fetch(`${APP_API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, phoneNumber, password })
        });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) { alert(data.message || 'Registration failed'); return; }

        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user || {}));
          window.dispatchEvent(new CustomEvent('authChanged', { detail: { authenticated: true, user: data.user || null, token: data.token } }));
          window.location.href = 'index.html';
          return;
        }

        alert(data.message || 'Registration successful. Please login.');
        window.location.href = 'login.html';
      } catch (err) {
        console.error('Register error', err);
        alert('Network error - ensure backend is running at ' + APP_API_BASE);
      }
    });
  }
});

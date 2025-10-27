// Simple header auth UI manager

function getStoredUser() {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  try { return userStr ? JSON.parse(userStr) : null; } catch { return null; }
}

function isAuthenticated() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

function renderAuthArea() {
  const area = document.getElementById('auth-area');
  if (!area) return;

  if (isAuthenticated()) {
    const user = getStoredUser();
    const name = user ? `${user.firstName || ''}`.trim() : 'Account';
    area.innerHTML = `
      <div class="auth-links">
        <span class="user-name">Hello, ${escapeHtml(name)}</span>
        <button id="logout-btn" class="btn-link">Logout</button>
      </div>
    `;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      // use global logout defined in auth.js
      if (typeof logout === 'function') logout();
      else {
        localStorage.removeItem('token'); localStorage.removeItem('user');
        sessionStorage.removeItem('token'); sessionStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { authenticated: false } }));
        window.location.href = 'index.html';
      }
    });
  } else {
    area.innerHTML = `
      <div class="auth-links">
        <a href="login.html" class="btn-link">Login</a>
        <a href="register.html" class="btn-link">Register</a>
      </div>
    `;
  }
}

// listen for changes
window.addEventListener('authChanged', () => renderAuthArea());
document.addEventListener('DOMContentLoaded', () => renderAuthArea());

// small helper reused from script.js
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (s) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[s]);
}
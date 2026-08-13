(() => {
  const SESSION_KEY = 'dopamine_user_session';
  window.GOOGLE_CLIENT_ID = '246665098015-2ttch7m3v66f8f43goghil4c52kn2gkv.apps.googleusercontent.com';

  function getUserSession() {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setUserSession(sessionData) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

    // Save social users (Google) if logged in via OAuth
    if (window.DopamineDB && sessionData && sessionData.email && sessionData.provider === 'google') {
      window.DopamineDB.saveSocialUser(sessionData);
    }

    updateHeaderAccountState();
  }

  function clearUserSession() {
    localStorage.removeItem(SESSION_KEY);
    updateHeaderAccountState();
  }

  function formatUserRegistrationDate(user) {
    const rawDate = user.createdAt || user.loginTime;
    if (!rawDate) return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  }

  // Open Minimalist User Profile Drawer
  function openProfileDrawer(user) {
    let overlay = document.querySelector('.profile-drawer-overlay');
    let drawer = document.querySelector('.profile-drawer');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'profile-drawer-overlay';
      document.body.appendChild(overlay);
    }

    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.className = 'profile-drawer';
      document.body.appendChild(drawer);
    }

    const avatarInitial = (user.name || user.email || 'D').charAt(0).toUpperCase();
    const avatarContent = user.picture 
      ? `<img src="${user.picture}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`
      : `<span style="font-family:var(--ff-heading, 'Bebas Neue', sans-serif); font-size:2.2rem; font-weight:700; color:var(--text-primary, #FFFFFF);">${avatarInitial}</span>`;

    const regDateStr = formatUserRegistrationDate(user);

    let birthdateVal = user.birthdate;
    if ((!birthdateVal || birthdateVal === 'No especificada') && window.DopamineDB && user.email) {
      const dbUser = window.DopamineDB.getAllUsers().find(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (dbUser && dbUser.birthdate) {
        birthdateVal = dbUser.birthdate;
      }
    }
    if (!birthdateVal) birthdateVal = 'No especificada';

    drawer.innerHTML = `
      <div class="profile-drawer-header">
        <h2>PERFIL VINCULADO</h2>
        <button type="button" class="drawer-close" id="profile-drawer-close" aria-label="Cerrar perfil">×</button>
      </div>

      <div class="profile-drawer-body">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar-circle">
            ${avatarContent}
          </div>
        </div>

        <div class="profile-user-info">
          <h3 class="profile-user-name">${user.name || 'Miembro Dopamine'}</h3>
          <p class="profile-user-email">${user.email}</p>
        </div>

        <div class="profile-info-card">
          <div class="info-card-row">
            <span class="info-card-label">ESTADO DE CUENTA:</span>
            <span class="info-card-val verified-text">✓ VERIFICADA</span>
          </div>
          <div class="info-card-row">
            <span class="info-card-label">MÉTODO DE INGRESO:</span>
            <span class="info-card-val">${ (user.provider || 'EMAIL').toUpperCase() }</span>
          </div>
          <div class="info-card-row">
            <span class="info-card-label">FECHA DE REGISTRO:</span>
            <span class="info-card-val">${ regDateStr }</span>
          </div>
          <div class="info-card-row">
            <span class="info-card-label">NACIMIENTO:</span>
            <span class="info-card-val">${ birthdateVal }</span>
          </div>
        </div>

        <div class="profile-standalone-member">
          DOPAMINE MEMBER CLUB
        </div>

        <div class="profile-drawer-actions">
          <button type="button" id="profile-btn-logout" class="profile-btn-danger">CERRAR SESIÓN</button>
        </div>
      </div>
    `;

    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('is-active');
      drawer.classList.add('is-active');
    });

    // Event Handlers for close and logout
    const closeDrawer = () => {
      overlay.classList.remove('is-active');
      drawer.classList.remove('is-active');
    };

    overlay.onclick = closeDrawer;
    const btnClose = drawer.querySelector('#profile-drawer-close');
    if (btnClose) btnClose.onclick = closeDrawer;

    const btnLogout = drawer.querySelector('#profile-btn-logout');
    if (btnLogout) {
      btnLogout.onclick = () => {
        clearUserSession();
        closeDrawer();
        window.location.reload();
      };
    }
  }

  function updateHeaderAccountState() {
    const session = getUserSession();
    document.querySelectorAll('.account-link').forEach(link => {
      if (session && session.loggedIn) {
        link.classList.add('is-logged-in', 'is-verified-user');
        link.setAttribute('title', `Cuenta verificada: ${session.name || session.email}`);
        
        // Remove old active green dot if present
        const oldDot = link.querySelector('.user-active-dot');
        if (oldDot) oldDot.remove();

        // Inject verified badge icon over account icon
        let badge = link.querySelector('.user-verified-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'user-verified-badge';
          badge.title = 'Cuenta Verificada';
          badge.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="background:transparent; border-radius:50%;">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#0EA5E9"/>
            </svg>
          `;
          link.appendChild(badge);
        }

        // Attach click handler to open Profile Drawer
        link.onclick = (e) => {
          e.preventDefault();
          openProfileDrawer(session);
        };
      } else {
        link.classList.remove('is-logged-in', 'is-verified-user');
        const badge = link.querySelector('.user-verified-badge');
        if (badge) badge.remove();
        link.onclick = null;
      }
    });
  }

  window.DopamineAuth = {
    getUser: getUserSession,
    setUser: setUserSession,
    logout: clearUserSession,
    updateUI: updateHeaderAccountState,
    openProfileDrawer: openProfileDrawer
  };

  document.addEventListener('DOMContentLoaded', updateHeaderAccountState);
})();

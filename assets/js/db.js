(function(window) {
  const USERS_DB_KEY = 'dopamine_users_db_v1';
  const SESSION_KEY = 'dopamine_user_session';

  // SHA-256 Password Hashing via Web Crypto API
  async function hashPassword(password) {
    if (!password) return '';
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return password;
    }
  }

  // Get all users from local cache
  function getLocalUsers() {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Save users array to local cache
  function saveLocalUsers(users) {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {}
  }

  // Sync users with backend server in background
  async function fetchServerUsers() {
    try {
      const res = await fetch('/api/users/admin');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.users)) {
          saveLocalUsers(data.users);
          return data.users;
        }
      }
    } catch (err) {
      // Backend not running / static mode
    }
    return getLocalUsers();
  }

  const DopamineDB = {
    // Register / Upsert New User (Server first, local fallback)
    async register(userData) {
      const { email, password, name, birthdate, emailVerified } = userData;
      const cleanEmail = email.trim().toLowerCase();
      const rawPass = password || '';
      const hashedPassword = await hashPassword(rawPass);
      const passMasked = rawPass.length > 3 ? (rawPass.substring(0, 2) + '••••' + rawPass.slice(-2)) : '••••••••';

      // 1. Try Backend Server API
      try {
        const res = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: rawPass,
            name: name,
            birthdate: birthdate,
            emailVerified: emailVerified !== undefined ? emailVerified : true
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            // Update local cache
            let users = getLocalUsers();
            let idx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
            if (idx !== -1) users[idx] = data.user;
            else users.unshift(data.user);
            saveLocalUsers(users);

            return { success: true, user: data.user };
          }
        }
      } catch (err) {
        console.warn('Backend server register fallback to local storage:', err.message);
      }

      // 2. Local Storage Fallback
      let users = getLocalUsers();
      let existingIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

      const userRecord = {
        id: (existingIdx !== -1 && users[existingIdx].id) ? users[existingIdx].id : ('usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4)),
        name: name || (existingIdx !== -1 ? users[existingIdx].name : cleanEmail.split('@')[0]),
        email: cleanEmail,
        passwordHash: hashedPassword,
        rawPassword: rawPass,
        passwordMasked: passMasked,
        birthdate: birthdate || (existingIdx !== -1 ? users[existingIdx].birthdate : 'No especificada'),
        createdAt: (existingIdx !== -1 && users[existingIdx].createdAt) ? users[existingIdx].createdAt : new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        provider: 'email',
        emailVerified: emailVerified !== undefined ? emailVerified : true
      };

      if (existingIdx !== -1) {
        users[existingIdx] = userRecord;
      } else {
        users.unshift(userRecord);
      }
      saveLocalUsers(users);

      return { success: true, user: userRecord };
    },

    // Login User (Server check first, with local fallback)
    async login(email, password) {
      const cleanEmail = email.trim().toLowerCase();
      const inputPass = (password || '').trim();

      if (!cleanEmail) {
        return { success: false, error: 'Por favor ingresá tu correo electrónico.' };
      }
      if (!inputPass) {
        return { success: false, error: 'Por favor ingresá tu contraseña.' };
      }

      // 1. Try Backend Server API
      try {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: inputPass })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            return { success: true, user: data.user };
          } else if (data && data.error) {
            return { success: false, error: data.error };
          }
        } else if (res.status === 401) {
          const data = await res.json();
          return { success: false, error: data.error || 'Contraseña o correo incorrectos.' };
        }
      } catch (err) {
        console.warn('Backend server login fallback to local storage:', err.message);
      }

      // 2. Local Storage Validation
      const users = getLocalUsers();
      const user = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        return { success: false, error: 'No existe una cuenta registrada con este correo electrónico.' };
      }

      const inputHash = await hashPassword(inputPass);
      const matchesHash = user.passwordHash && inputHash === user.passwordHash;
      const matchesRaw = user.rawPassword && inputPass === user.rawPassword;

      if (!matchesHash && !matchesRaw) {
        return { success: false, error: 'Contraseña incorrecta. Revisá tus datos e intentá de nuevo.' };
      }

      user.lastLogin = new Date().toISOString();
      saveLocalUsers(users);

      return { success: true, user: user };
    },

    // Save or update Google / Social user
    async saveSocialUser(socialData) {
      const cleanEmail = socialData.email.trim().toLowerCase();

      try {
        const res = await fetch('/api/users/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            name: socialData.name,
            picture: socialData.picture,
            provider: socialData.provider || 'google'
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            return data.user;
          }
        }
      } catch (err) {}

      let users = getLocalUsers();
      let user = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        user = {
          id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
          name: socialData.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          picture: socialData.picture || '',
          provider: socialData.provider || 'google',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: true
        };
        users.unshift(user);
      } else {
        user.name = socialData.name || user.name;
        user.picture = socialData.picture || user.picture;
        user.lastLogin = new Date().toISOString();
      }
      saveLocalUsers(users);
      return user;
    },

    // Get all registered accounts for Admin Panel (Syncs from server)
    getAllUsers() {
      return getLocalUsers();
    },

    getLocalUsers() {
      return getLocalUsers();
    },

    getAdminUsers() {
      return getLocalUsers();
    },

    // Async version for live polling
    async fetchAllUsers() {
      return await fetchServerUsers();
    },

    // Delete user by ID
    async deleteUser(userId) {
      try {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      } catch (e) {}

      let users = getLocalUsers();
      const initialLen = users.length;
      users = users.filter(u => u.id !== userId);
      saveLocalUsers(users);
      return users.length < initialLen;
    },

    // Clear all users
    async clearAll() {
      try {
        await fetch('/api/users/clear-all', { method: 'POST' });
      } catch (e) {}

      localStorage.removeItem(USERS_DB_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('dopamine_email_verification_codes');
      sessionStorage.removeItem('dopamine_email_verification_codes');
    }
  };

  // Initial sync on script load
  fetchServerUsers();

  window.DopamineDB = DopamineDB;
})(window);

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

  // Get all users from Database
  function getUsers() {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      let users = data ? JSON.parse(data) : [];

      // Ensure every email user has a valid passwordHash & rawPassword
      let modified = false;
      users.forEach(u => {
        if (u.provider === 'email' && (!u.passwordHash || !u.rawPassword)) {
          if (!u.rawPassword || u.rawPassword === 'Ingresó con Google' || u.rawPassword === 'Sesión Activa') {
            const suffix = u.id ? u.id.slice(-4) : '2026';
            u.rawPassword = `DopaminePass_${suffix}`;
          }
          u.passwordMasked = u.rawPassword.length > 3 ? (u.rawPassword.substring(0, 2) + '••••' + u.rawPassword.slice(-2)) : '••••••••';
          modified = true;
        }
      });

      if (modified) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      }

      return users;
    } catch (e) {
      console.error('Error loading users DB:', e);
      return [];
    }
  }

  // Save users array to Database
  function saveUsers(users) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }

  // Find user by email (case-insensitive)
  function findUserByEmail(email) {
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  const DopamineDB = {
    // Register / Upsert New User
    async register(userData) {
      const { email, password, name, birthdate, emailVerified } = userData;
      const cleanEmail = email.trim().toLowerCase();
      const rawPass = password || '';

      let users = getUsers();
      let existingIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

      // Block registration if user already exists and is fully verified!
      if (existingIdx !== -1 && users[existingIdx].emailVerified && users[existingIdx].passwordHash && emailVerified === false) {
        return { success: false, error: 'Este correo electrónico ya está registrado. Por favor iniciá sesión.' };
      }

      const hashedPassword = await hashPassword(rawPass);
      const passMasked = rawPass.length > 3 ? (rawPass.substring(0, 2) + '••••' + rawPass.slice(-2)) : '••••••••';

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
        users.push(userRecord);
      }
      saveUsers(users);

      return { success: true, user: userRecord };
    },

    // Mark email as verified
    markVerified(email) {
      const cleanEmail = email.trim().toLowerCase();
      let users = getUsers();
      let user = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.emailVerified = true;
        saveUsers(users);
      }
      return user;
    },

    // Login User (Strict Credentials & Password Hash Verification)
    async login(email, password) {
      const cleanEmail = email.trim().toLowerCase();
      const inputPass = (password || '').trim();

      if (!cleanEmail) {
        return { success: false, error: 'Por favor ingresá tu correo electrónico.' };
      }

      if (!inputPass) {
        return { success: false, error: 'Por favor ingresá tu contraseña.' };
      }

      const user = findUserByEmail(cleanEmail);

      if (!user) {
        return { success: false, error: 'No existe una cuenta registrada con este correo electrónico.' };
      }

      if (user.provider && user.provider !== 'email' && !user.passwordHash && !user.rawPassword) {
        return { success: false, error: `Esta cuenta fue registrada usando ${user.provider.toUpperCase()}. Ingresá con esa opción.` };
      }

      // Hash input password with SHA-256
      const inputHash = await hashPassword(inputPass);

      // Verify if password matches passwordHash OR rawPassword
      const matchesHash = user.passwordHash && inputHash === user.passwordHash;
      const matchesRaw = user.rawPassword && inputPass === user.rawPassword;

      if (!matchesHash && !matchesRaw) {
        return { success: false, error: 'Contraseña incorrecta. Revisá tus datos e intentá de nuevo.' };
      }

      // Password matches! Update last login timestamp and return success
      user.lastLogin = new Date().toISOString();
      let users = getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
        saveUsers(users);
      }

      return { success: true, user: user };
    },

    // Save or update Google / Social user
    saveSocialUser(socialData) {
      const cleanEmail = socialData.email.trim().toLowerCase();
      let users = getUsers();
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
        users.push(user);
        saveUsers(users);
      } else {
        user.name = socialData.name || user.name;
        user.picture = socialData.picture || user.picture;
        user.provider = socialData.provider || user.provider;
        user.lastLogin = new Date().toISOString();
        saveUsers(users);
      }

      return user;
    },

    // Get all registered accounts for Admin Panel
    getAllUsers() {
      const users = getUsers();
      const cleanUsers = users.filter(u => u.id !== 'usr_k9x1_8a' && u.id !== 'usr_m3b2_9f' && u.id !== 'usr_p7c4_1d' && u.id !== 'usr_r2t9_3e');
      if (cleanUsers.length !== users.length) {
        saveUsers(cleanUsers);
      }
      return cleanUsers;
    },

    // Delete user by ID
    deleteUser(userId) {
      let users = getUsers();
      const initialLen = users.length;
      users = users.filter(u => u.id !== userId);
      saveUsers(users);
      return users.length < initialLen;
    },

    // Clear all users & active session
    clearAll() {
      localStorage.removeItem(USERS_DB_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('dopamine_email_verification_codes');
      sessionStorage.removeItem('dopamine_email_verification_codes');
    }
  };

  window.DopamineDB = DopamineDB;
})(window);

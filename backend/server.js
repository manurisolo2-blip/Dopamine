const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (Localhost, Local IP, LAN, Mobile devices, and Remote domains)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Helper to get local network IP
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Password Hashing helper (SHA-256)
function hashPassword(pass) {
  if (!pass) return '';
  return crypto.createHash('sha256').update(pass).digest('hex');
}

// MySQL Connection Setup (Optional mysql2 driver)
let dbPool = null;
let isMySQLConnected = false;

try {
  const mysql = require('mysql2/promise');
  dbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dopamine_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Test DB connection & auto-initialize table
  (async () => {
    try {
      const connection = await dbPool.getConnection();
      console.log('⚡ [MYSQL] Conectado exitosamente a la base de datos (dopamine_db)');
      isMySQLConnected = true;

      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          raw_password VARCHAR(255),
          password_masked VARCHAR(255),
          birthdate VARCHAR(50),
          picture TEXT,
          provider VARCHAR(50) DEFAULT 'email',
          email_verified TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      connection.release();
    } catch (err) {
      console.log('ℹ️ [MODO HÍBRIDO ACTIVO] MySQL local no está activo. Almacenando en backend/users_db.json');
      isMySQLConnected = false;
    }
  })();
} catch (e) {
  console.log('ℹ️ [MODO HÍBRIDO ACTIVO] Módulo mysql2 no cargado. Servidor usando almacenamiento JSON persistente.');
}

// In-Memory / File Fallback Store
const DATA_FILE = path.join(__dirname, 'users_db.json');

function getFallbackUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading users_db.json:', e.message);
  }
  return [];
}

function saveFallbackUsers(users) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing users_db.json:', e.message);
  }
}

// Ensure database file exists
if (!fs.existsSync(DATA_FILE)) {
  saveFallbackUsers([]);
}

// Nodemailer Transporter Setup (Configurable via environment variables or SMTP)
const emailUser = process.env.EMAIL_USER || 'soporte.dopaminestreetwear@gmail.com';
const emailPass = process.env.EMAIL_PASS || '';

let transporter = null;
if (emailPass && emailPass !== 'app_password_here') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 0. SERVER INFO & NETWORK STATUS
app.get('/api/server-info', (req, res) => {
  const localIp = getLocalIpAddress();
  res.json({
    success: true,
    status: 'online',
    localIp: localIp,
    port: PORT,
    urls: {
      localhost: `http://localhost:${PORT}`,
      network: `http://${localIp}:${PORT}`,
      login: `http://${localIp}:${PORT}/login.html`,
      admin: `http://${localIp}:${PORT}/admin-clientes.html`
    },
    database: isMySQLConnected ? 'mysql' : 'json_file'
  });
});

// 1. GET ALL USERS (ADMIN PANEL & CROSS-DEVICE SYNC)
app.get('/api/users/admin', async (req, res) => {
  if (isMySQLConnected && dbPool) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM users ORDER BY created_at DESC');
      const formatted = rows.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.password_hash,
        rawPassword: u.raw_password,
        passwordMasked: u.password_masked,
        birthdate: u.birthdate,
        picture: u.picture,
        provider: u.provider,
        emailVerified: !!u.email_verified,
        createdAt: u.created_at,
        lastLogin: u.last_login
      }));
      return res.json({ success: true, source: 'mysql', users: formatted });
    } catch (err) {
      console.error('MySQL query error:', err.message);
    }
  }

  // Fallback / Primary JSON file
  const users = getFallbackUsers();
  return res.json({ success: true, source: 'local_json', users: users });
});

// 2. REGISTER / UPSERT NEW USER
app.post('/api/users/register', async (req, res) => {
  const { email, password, name, birthdate, emailVerified } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Correo electrónico requerido.' });

  const cleanEmail = email.trim().toLowerCase();
  const rawPass = password || '';
  const passHash = hashPassword(rawPass);
  const passMasked = rawPass.length > 3 ? (rawPass.substring(0, 2) + '••••' + rawPass.slice(-2)) : (rawPass ? '••••••••' : 'Google OAuth');
  const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
  const now = new Date().toISOString();

  if (isMySQLConnected && dbPool) {
    try {
      const sqlNow = now.slice(0, 19).replace('T', ' ');
      await dbPool.query(`
        INSERT INTO users (id, name, email, password_hash, raw_password, password_masked, birthdate, provider, email_verified, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'email', ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          password_hash = VALUES(password_hash),
          raw_password = VALUES(raw_password),
          password_masked = VALUES(password_masked),
          birthdate = VALUES(birthdate),
          email_verified = VALUES(email_verified),
          last_login = VALUES(last_login)
      `, [userId, name || cleanEmail.split('@')[0], cleanEmail, passHash, rawPass, passMasked, birthdate || 'No especificada', emailVerified ? 1 : 0, sqlNow, sqlNow]);

      return res.json({ success: true, user: { id: userId, email: cleanEmail, name, provider: 'email', birthdate, emailVerified: true } });
    } catch (err) {
      console.error('MySQL insert error:', err.message);
    }
  }

  // Fallback JSON file
  let users = getFallbackUsers();
  let idx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
  const userObj = {
    id: idx !== -1 ? users[idx].id : userId,
    name: name || (idx !== -1 ? users[idx].name : cleanEmail.split('@')[0]),
    email: cleanEmail,
    passwordHash: passHash,
    rawPassword: rawPass,
    passwordMasked: passMasked,
    birthdate: birthdate || (idx !== -1 ? users[idx].birthdate : 'No especificada'),
    provider: 'email',
    emailVerified: emailVerified !== undefined ? !!emailVerified : true,
    createdAt: idx !== -1 ? users[idx].createdAt : now,
    lastLogin: now
  };

  if (idx !== -1) {
    users[idx] = userObj;
  } else {
    users.unshift(userObj);
  }
  saveFallbackUsers(users);

  console.log(`👤 [NUEVO REGISTRO]: ${cleanEmail} (${name || 'Sin Nombre'}) guardado en el servidor.`);
  return res.json({ success: true, user: userObj });
});

// 3. LOGIN USER (VERIFY PASSWORD & HASH)
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Correo y contraseña requeridos.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const inputPass = (password || '').trim();
  const inputHash = hashPassword(inputPass);

  if (isMySQLConnected && dbPool) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, error: 'No existe una cuenta registrada con este correo.' });
      }
      const u = rows[0];
      const match = (u.password_hash && u.password_hash === inputHash) || (u.raw_password && u.raw_password === inputPass);
      if (!match) {
        return res.status(401).json({ success: false, error: 'Contraseña incorrecta.' });
      }

      await dbPool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [u.id]);
      return res.json({
        success: true,
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          birthdate: u.birthdate,
          picture: u.picture,
          provider: u.provider,
          emailVerified: !!u.email_verified
        }
      });
    } catch (err) {
      console.error('MySQL login error:', err.message);
    }
  }

  // Fallback JSON file
  const users = getFallbackUsers();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({ success: false, error: 'No existe una cuenta registrada con este correo electrónico.' });
  }

  const matchesHash = user.passwordHash && user.passwordHash === inputHash;
  const matchesRaw = user.rawPassword && user.rawPassword === inputPass;

  if (!matchesHash && !matchesRaw) {
    return res.status(401).json({ success: false, error: 'Contraseña incorrecta. Revisá tus datos e intentá de nuevo.' });
  }

  user.lastLogin = new Date().toISOString();
  saveFallbackUsers(users);

  console.log(`🔑 [LOGIN EXITOSO]: ${cleanEmail} inició sesión.`);
  return res.json({ success: true, user: user });
});

// 4. GOOGLE / SOCIAL USER
app.post('/api/users/social', async (req, res) => {
  const { email, name, picture, provider } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email requerido.' });

  const cleanEmail = email.trim().toLowerCase();
  const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
  const now = new Date().toISOString();

  if (isMySQLConnected && dbPool) {
    try {
      const sqlNow = now.slice(0, 19).replace('T', ' ');
      await dbPool.query(`
        INSERT INTO users (id, name, email, raw_password, password_masked, birthdate, picture, provider, email_verified, created_at, last_login)
        VALUES (?, ?, ?, 'Ingresó con Google', 'Google OAuth', 'Google Account', ?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          picture = VALUES(picture),
          provider = VALUES(provider),
          last_login = VALUES(last_login)
      `, [userId, name || cleanEmail.split('@')[0], cleanEmail, picture || '', provider || 'google', sqlNow, sqlNow]);

      return res.json({ success: true, user: { id: userId, email: cleanEmail, name, provider: provider || 'google', picture } });
    } catch (err) {
      console.error('MySQL social insert error:', err.message);
    }
  }

  // Fallback JSON file
  let users = getFallbackUsers();
  let idx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
  const userObj = {
    id: idx !== -1 ? users[idx].id : userId,
    name: name || cleanEmail.split('@')[0],
    email: cleanEmail,
    picture: picture || '',
    rawPassword: 'Ingresó con Google',
    passwordMasked: 'Google OAuth',
    birthdate: 'Google Account',
    provider: provider || 'google',
    emailVerified: true,
    createdAt: idx !== -1 ? users[idx].createdAt : now,
    lastLogin: now
  };

  if (idx !== -1) users[idx] = userObj;
  else users.unshift(userObj);
  saveFallbackUsers(users);

  return res.json({ success: true, user: userObj });
});

// 5. DELETE USER BY ID
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, error: 'ID requerido' });

  if (isMySQLConnected && dbPool) {
    try {
      await dbPool.query('DELETE FROM users WHERE id = ?', [id]);
    } catch (err) {}
  }

  let users = getFallbackUsers();
  users = users.filter(u => u.id !== id);
  saveFallbackUsers(users);

  console.log(`🗑️ [USUARIO ELIMINADO]: ID ${id}`);
  return res.json({ success: true, message: 'Usuario eliminado.' });
});

// 6. CLEAR ALL USERS (ADMIN)
app.post('/api/users/clear-all', async (req, res) => {
  if (isMySQLConnected && dbPool) {
    try {
      await dbPool.query('TRUNCATE TABLE users');
    } catch (err) {}
  }
  saveFallbackUsers([]);
  console.log('🗑️ [BASE DE DATOS VACIADA]');
  return res.json({ success: true, message: 'Base de datos vaciada.' });
});

// 7. SEND VERIFICATION EMAIL ENDPOINT (REAL MULTI-TIER)
app.post('/api/send-verification-email', async (req, res) => {
  const { to, code } = req.body;
  if (!to || !code) return res.status(400).json({ error: 'Faltan parámetros requeridos (to, code).' });

  const cleanEmail = to.trim().toLowerCase();

  console.log(`\n========================================================`);
  console.log(`📬 [CÓDIGO DE VERIFICACIÓN DOPAMINE GENERADO]`);
  console.log(`   Destinatario: ${cleanEmail}`);
  console.log(`   Código 6 dígitos: >>> ${code} <<<`);
  console.log(`   Fecha/Hora: ${new Date().toLocaleString()}`);
  console.log(`========================================================\n`);

  const nikeHtmlTemplate = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0A0C; color: #FFFFFF; max-width: 540px; margin: 0 auto; padding: 40px 24px; border-radius: 0;">
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="font-size: 28px; font-weight: 900; letter-spacing: 0.25em; color: #FFFFFF; text-transform: uppercase;">DOPAMINE</span>
      </div>
      <div style="background: #141417; border: 1px solid rgba(255,255,255,0.12); padding: 32px 24px; text-align: center;">
        <h1 style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Código de Verificación Dopamine Member</h1>
        <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px; line-height: 1.5;">Ingresá el siguiente código de 6 dígitos para completar la creación de tu cuenta y activar tus beneficios exclusivos:</p>
        
        <div style="background: #0A0A0C; border: 1px solid rgba(255,255,255,0.25); padding: 20px; margin: 24px 0;">
          <span style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #FFFFFF; font-family: monospace, 'Courier New', monospace;">${code}</span>
        </div>

        <p style="font-size: 13px; color: rgba(255,255,255,0.5); margin: 0;">Este código caducará en 15 minutos. Si no solicitaste este código, puedes ignorar este mensaje.</p>
      </div>
      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.4);">
        © 2026 Dopamine Streetwear — Buenos Aires, Argentina.
      </div>
    </div>
  `;

  // If SMTP is configured, send real email via transporter
  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"Dopamine Streetwear" <' + emailUser + '>',
        to: cleanEmail,
        subject: `${code} es tu código de verificación Dopamine`,
        html: nikeHtmlTemplate
      });
      return res.json({ success: true, message: 'Correo enviado vía SMTP con éxito.', codeLogged: true });
    } catch (err) {
      console.warn('⚠️ SMTP sendMail falló:', err.message);
    }
  }

  // Return success with code confirmation
  return res.json({ 
    success: true, 
    message: 'Código generado y procesado exitosamente por el servidor Dopamine.',
    code: code,
    recipient: cleanEmail
  });
});

// START SERVER (Listening on 0.0.0.0 for LAN & Remote access)
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`\n===================================================================`);
  console.log(`🚀 SERVIDOR DOPAMINE STREETWEAR INICIADO CORRECTAMENTE`);
  console.log(`===================================================================`);
  console.log(` 💻 Local (esta PC):       http://localhost:${PORT}`);
  console.log(` 🌐 Red Local (otra PC):    http://${localIp}:${PORT}`);
  console.log(` 🔑 Login y Registro:       http://${localIp}:${PORT}/login.html`);
  console.log(` 📊 Panel Clientes Admin:   http://${localIp}:${PORT}/admin-clientes.html`);
  console.log(`===================================================================\n`);
});

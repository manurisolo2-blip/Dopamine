const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// MySQL Connection Setup (Optional mysql2 driver)
let dbPool = null;
let isMySQLConnected = false;

try {
  const mysql = require('mysql2/promise');
  dbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3006,
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
      console.log('⚡ Conectado a MySQL Database (dopamine_db)');
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
      console.log('ℹ️ MySQL local no está activo (Modo Híbrido Activo - Servidor usando almacenamiento JSON/Memoria)');
      isMySQLConnected = false;
    }
  })();
} catch (e) {
  console.log('ℹ️ Módulo mysql2 no instalado (Modo Híbrido Activo - Servidor usando almacenamiento JSON/Memoria)');
}

// In-Memory / File Fallback Store
const DATA_FILE = path.join(__dirname, 'users_db.json');

function getFallbackUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {}
  return [];
}

function saveFallbackUsers(users) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {}
}

// Transporter setup (Configured for Gmail / SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'soporte.dopaminestreetwear@gmail.com',
    pass: process.env.EMAIL_PASS || 'app_password_here'
  }
});

// REST API ENDPOINTS

// 1. GET ALL USERS FOR ADMIN PANEL
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

  // Fallback
  const users = getFallbackUsers();
  return res.json({ success: true, source: 'local', users: users });
});

// 2. REGISTER NEW USER
app.post('/api/users/register', async (req, res) => {
  const { email, password, name, birthdate, emailVerified } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email requerido.' });

  const cleanEmail = email.trim().toLowerCase();
  const rawPass = password || '';
  const passMasked = rawPass ? (rawPass.substring(0, 2) + '••••' + rawPass.slice(-2)) : 'Google OAuth';
  const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (isMySQLConnected && dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO users (id, name, email, password_hash, raw_password, password_masked, birthdate, provider, email_verified, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'email', ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          raw_password = VALUES(raw_password),
          password_masked = VALUES(password_masked),
          birthdate = VALUES(birthdate),
          email_verified = VALUES(email_verified),
          last_login = VALUES(last_login)
      `, [userId, name || cleanEmail.split('@')[0], cleanEmail, rawPass, rawPass, passMasked, birthdate || 'No especificada', emailVerified ? 1 : 0, now, now]);

      return res.json({ success: true, user: { id: userId, email: cleanEmail, name, provider: 'email' } });
    } catch (err) {
      console.error('MySQL insert error:', err.message);
    }
  }

  // Fallback
  let users = getFallbackUsers();
  let idx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
  const userObj = {
    id: idx !== -1 ? users[idx].id : userId,
    name: name || (idx !== -1 ? users[idx].name : cleanEmail.split('@')[0]),
    email: cleanEmail,
    rawPassword: rawPass,
    passwordMasked: passMasked,
    birthdate: birthdate || 'No especificada',
    provider: 'email',
    emailVerified: !!emailVerified,
    createdAt: idx !== -1 ? users[idx].createdAt : new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  if (idx !== -1) users[idx] = userObj;
  else users.push(userObj);
  saveFallbackUsers(users);

  return res.json({ success: true, user: userObj });
});

// 3. GOOGLE / SOCIAL USER
app.post('/api/users/social', async (req, res) => {
  const { email, name, picture, provider } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email requerido.' });

  const cleanEmail = email.trim().toLowerCase();
  const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (isMySQLConnected && dbPool) {
    try {
      await dbPool.query(`
        INSERT INTO users (id, name, email, raw_password, password_masked, birthdate, picture, provider, email_verified, created_at, last_login)
        VALUES (?, ?, ?, 'Ingresó con Google', 'Google OAuth', 'Google Account', ?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          picture = VALUES(picture),
          provider = VALUES(provider),
          last_login = VALUES(last_login)
      `, [userId, name || cleanEmail.split('@')[0], cleanEmail, picture || '', provider || 'google', now, now]);

      return res.json({ success: true, user: { id: userId, email: cleanEmail, name, provider: 'google' } });
    } catch (err) {
      console.error('MySQL social insert error:', err.message);
    }
  }

  // Fallback
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
    createdAt: idx !== -1 ? users[idx].createdAt : new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  if (idx !== -1) users[idx] = userObj;
  else users.push(userObj);
  saveFallbackUsers(users);

  return res.json({ success: true, user: userObj });
});

// 4. CLEAR ALL USERS (ADMIN)
app.post('/api/users/clear-all', async (req, res) => {
  if (isMySQLConnected && dbPool) {
    try {
      await dbPool.query('TRUNCATE TABLE users');
    } catch (err) {}
  }
  saveFallbackUsers([]);
  return res.json({ success: true, message: 'Base de datos vaciada.' });
});

// 5. SEND VERIFICATION EMAIL ENDPOINT
app.post('/api/send-verification-email', async (req, res) => {
  const { to, code } = req.body;
  if (!to || !code) return res.status(400).json({ error: 'Faltan parámetros requeridos.' });

  const mailOptions = {
    from: '"Dopamine" <soporte.dopaminestreetwear@gmail.com>',
    to: to,
    subject: 'Tu código de verificación Dopamine',
    html: `<h1>Tu código es: ${code}</h1>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Correo enviado con éxito.' });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo enviar el correo.', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Dopamine con soporte MySQL corriendo en http://localhost:${PORT}`);
});

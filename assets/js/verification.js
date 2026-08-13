(function(window) {
  const VERIFICATION_STORE_KEY = 'dopamine_email_verification_codes';
  const FORMSUBMIT_TOKEN = 'eab6852f5dbf07e464e07c94d74566e7';

  function getCodesStore() {
    try {
      const data = sessionStorage.getItem(VERIFICATION_STORE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCodesStore(store) {
    sessionStorage.setItem(VERIFICATION_STORE_KEY, JSON.stringify(store));
  }

  // Nike-Style Direct Real Email Dispatcher Engine
  async function dispatchRealEmail(toEmail, code) {
    const cleanEmail = toEmail.trim().toLowerCase();

    const nikeHtmlTemplate = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #111111; max-width: 520px; margin: 0 auto; padding: 40px 20px; text-align: center;">
        <div style="margin-bottom: 30px;">
          <span style="font-size: 26px; font-weight: 900; letter-spacing: 0.2em; color: #000000; text-transform: uppercase;">DOPAMINE</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 500; color: #111111; margin-bottom: 12px; line-height: 1.35;">Tu código de perfil de miembro de Dopamine</h1>
        <p style="font-size: 14px; color: #666666; margin-bottom: 30px; line-height: 1.4;">Este es el código de verificación de un solo uso que solicitaste:</p>
        
        <div style="border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; padding: 25px 0; margin: 30px 0;">
          <span style="font-size: 38px; font-weight: 700; letter-spacing: 8px; color: #111111; font-family: monospace, 'Courier New', monospace;">${code}</span>
        </div>

        <p style="font-size: 14px; color: #111111; margin-bottom: 15px;">El código caducará después de 15 minutos.</p>
        <p style="font-size: 13px; color: #8d8d8d; line-height: 1.5;">Si ya recibiste este código o ya no lo necesitas, puedes ignorar este correo electrónico.</p>
      </div>
    `;

    // 1. Direct Dispatch via FormSubmit Token URL
    try {
      const endpoint = `https://formsubmit.co/ajax/${FORMSUBMIT_TOKEN}`;
      const formSubmitRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: 'Este es tu código de un solo uso',
          _captcha: 'false',
          _template: 'box',
          _autoresponse: nikeHtmlTemplate,
          Destinatario: cleanEmail,
          Codigo_De_Verificacion: code,
          Mensaje: `Tu código de perfil de miembro de Dopamine es: ${code}`
        })
      });
      const resData = await formSubmitRes.json();
      console.log('📬 [DIRECT NIKE EMAIL DISPATCHED TO ' + cleanEmail + ']:', resData);
    } catch (err) {
      console.warn('FormSubmit direct dispatch warning:', err);
    }

    // 2. Direct Fallback to recipient email URL
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: 'Este es tu código de un solo uso',
          _captcha: 'false',
          _template: 'box',
          _autoresponse: nikeHtmlTemplate,
          Codigo_De_Verificacion: code
        })
      });
    } catch (err) {}

    // 3. Try Node.js Backend Server API if running
    try {
      await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: cleanEmail, code: code })
      });
    } catch (err) {}

    return true;
  }

  const DopamineVerification = {
    // Generate code and dispatch real Nike-style email to recipient's inbox
    async sendVerificationCode(email) {
      const cleanEmail = email.trim().toLowerCase();
      
      // Generate 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const store = getCodesStore();
      store[cleanEmail] = {
        code: code,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes expiry matching Nike
      };
      saveCodesStore(store);

      console.log(`📬 [DOPAMINE DIRECT NIKE EMAIL SENT TO ${cleanEmail}]: ${code}`);

      // Dispatch real email
      await dispatchRealEmail(cleanEmail, code);

      return code;
    },

    // Validate if the entered 6-digit code matches
    verifyCode(email, inputCode) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanInput = inputCode.trim();

      const store = getCodesStore();
      const record = store[cleanEmail];

      if (!record) {
        return { success: false, error: 'No se encontró un código solicitado para este correo. Hacé clic en reenviar.' };
      }

      if (Date.now() > record.expiresAt) {
        return { success: false, error: 'El código ha expirado. Solicitá uno nuevo.' };
      }

      if (record.code !== cleanInput) {
        return { success: false, error: 'Código incorrecto. Revisá tu casilla de correo e intentá de nuevo.' };
      }

      // Code matched! Clean up store
      delete store[cleanEmail];
      saveCodesStore(store);

      return { success: true };
    }
  };

  window.DopamineVerification = DopamineVerification;
})(window);

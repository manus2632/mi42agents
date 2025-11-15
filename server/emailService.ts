import nodemailer from 'nodemailer';

/**
 * Email Service with SMTP Support
 * 
 * Uses mail.bl2020.com SMTP server for sending emails.
 * Falls back to console logging if SMTP is not configured.
 */

let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize SMTP transporter (lazy loading)
 */
function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailSecure = process.env.EMAIL_SECURE === 'true';

  if (!emailHost || !emailPort || !emailUser || !emailPass) {
    console.log('[Email] SMTP not configured - using console output only');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(emailPort),
      secure: emailSecure, // SSL
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    console.log(`[Email] ✅ SMTP configured: ${emailUser}@${emailHost}:${emailPort} (SSL: ${emailSecure})`);
    return transporter;
  } catch (error) {
    console.error('[Email] ❌ Failed to create SMTP transporter:', error);
    return null;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
): Promise<boolean> {
  const appUrl = process.env.APP_URL || 'http://46.224.9.190:3001';
  const verificationUrl = `${appUrl}/verify-email?token=${token}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      background: #f9fafb;
      padding: 40px 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background: #5568d3;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .token-box {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      word-break: break-all;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 Mi42 - Market Intelligence</h1>
  </div>
  
  <div class="content">
    <h2>Willkommen${name ? `, ${name}` : ''}!</h2>
    
    <p>Vielen Dank für Ihre Registrierung bei Mi42. Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse.</p>
    
    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button">E-Mail-Adresse bestätigen</a>
    </p>
    
    <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
    <div class="token-box">${verificationUrl}</div>
    
    <div class="footer">
      <p><strong>Wichtig:</strong> Dieser Link ist 24 Stunden gültig.</p>
      <p>Falls Sie sich nicht bei Mi42 registriert haben, können Sie diese E-Mail ignorieren.</p>
      <p style="margin-top: 20px;">
        <strong>Mi42 - Intelligente Marktforschung für die Bauindustrie</strong><br>
        Automatisierte Analysen • Markttrends • Wettbewerbsanalyse
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Willkommen${name ? `, ${name}` : ''}!

Vielen Dank für Ihre Registrierung bei Mi42. Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse.

Verification-Link:
${verificationUrl}

Dieser Link ist 24 Stunden gültig.

Falls Sie sich nicht bei Mi42 registriert haben, können Sie diese E-Mail ignorieren.

---
Mi42 - Intelligente Marktforschung für die Bauindustrie
Automatisierte Analysen • Markttrends • Wettbewerbsanalyse
  `;

  const smtp = getTransporter();

  if (smtp) {
    // Send via SMTP
    try {
      await smtp.sendMail({
        from: process.env.EMAIL_FROM || `"Mi42 Market Intelligence" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Bestätigen Sie Ihre E-Mail-Adresse - Mi42',
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Email] ✅ Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('[Email] ❌ Failed to send email:', error);
      return false;
    }
  } else {
    // Fallback: Console logging
    console.log('='.repeat(80));
    console.log('[Email] VERIFICATION EMAIL (console only - SMTP not configured)');
    console.log('='.repeat(80));
    console.log(`To: ${email}`);
    console.log(`Name: ${name || 'N/A'}`);
    console.log(`Subject: Bestätigen Sie Ihre E-Mail-Adresse - Mi42`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token: ${token}`);
    console.log('='.repeat(80));
    return true;
  }
}

/**
 * Send welcome email after onboarding
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  briefingCount: number
): Promise<boolean> {
  const appUrl = process.env.APP_URL || 'http://46.224.9.190:3001';
  const dashboardUrl = `${appUrl}/`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      background: #f9fafb;
      padding: 40px 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .feature-box {
      background: white;
      border-left: 4px solid #667eea;
      padding: 15px 20px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .feature-box h3 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 16px;
    }
    .feature-box p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }
    .stats {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .stats-number {
      font-size: 48px;
      font-weight: 700;
      color: #667eea;
      margin: 0;
    }
    .stats-label {
      color: #6b7280;
      font-size: 14px;
      margin: 5px 0 0 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Willkommen bei Mi42!</h1>
  </div>
  
  <div class="content">
    <h2>Hallo ${name},</h2>
    
    <p>Ihr Konto ist jetzt aktiv! Wir haben bereits ${briefingCount} Marktanalysen für Sie vorbereitet.</p>
    
    <div class="stats">
      <p class="stats-number">${briefingCount}</p>
      <p class="stats-label">Vorgefüllte Analysen bereit</p>
    </div>
    
    <div class="feature-box">
      <h3>📊 Marktanalyse</h3>
      <p>Detaillierte Analyse Ihrer Branche und Wettbewerbsposition</p>
    </div>
    
    <div class="feature-box">
      <h3>📈 Trendanalyse</h3>
      <p>Aktuelle Trends und Entwicklungen in der Bauindustrie</p>
    </div>
    
    <div class="feature-box">
      <h3>🎯 Nachfrageprognose</h3>
      <p>Vorhersage der Nachfrage in Ihrer Region</p>
    </div>
    
    <div class="feature-box">
      <h3>🏗️ Projektinformationen</h3>
      <p>Bauprojekte in Ihrer Nähe und relevante Ausschreibungen</p>
    </div>
    
    <p style="text-align: center; margin-top: 30px;">
      <a href="${dashboardUrl}" class="button">Zu meinen Analysen</a>
    </p>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      <strong>Ihr Startguthaben:</strong> 5.000 Credits<br>
      <strong>Gültig für:</strong> Alle Agenten-Analysen<br>
      <strong>Support:</strong> support@mi42.com
    </p>
  </div>
</body>
</html>
  `;

  const textContent = `
Willkommen bei Mi42, ${name}!

Ihr Konto ist jetzt aktiv! Wir haben bereits ${briefingCount} Marktanalysen für Sie vorbereitet.

Ihre vorgefüllten Analysen:
- Marktanalyse: Detaillierte Analyse Ihrer Branche
- Trendanalyse: Aktuelle Entwicklungen in der Bauindustrie
- Nachfrageprognose: Vorhersage der Nachfrage in Ihrer Region
- Projektinformationen: Bauprojekte und Ausschreibungen

Jetzt anmelden: ${dashboardUrl}

Ihr Startguthaben: 5.000 Credits
Support: support@mi42.com

---
Mi42 - Intelligente Marktforschung für die Bauindustrie
  `;

  const smtp = getTransporter();

  if (smtp) {
    try {
      await smtp.sendMail({
        from: process.env.EMAIL_FROM || `"Mi42 Market Intelligence" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Willkommen bei Mi42 - ${briefingCount} Analysen warten auf Sie!`,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Email] ✅ Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('[Email] ❌ Failed to send welcome email:', error);
      return false;
    }
  } else {
    console.log('='.repeat(80));
    console.log('[Email] WELCOME EMAIL (console only - SMTP not configured)');
    console.log('='.repeat(80));
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Subject: Willkommen bei Mi42 - ${briefingCount} Analysen warten auf Sie!`);
    console.log(`Briefing Count: ${briefingCount}`);
    console.log(`Dashboard URL: ${dashboardUrl}`);
    console.log('='.repeat(80));
    return true;
  }
}

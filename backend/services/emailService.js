const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter – will use SendGrid if API key present, otherwise fallback to Ethereal (dev)
let transporter;
if (process.env.SENDGRID_API_KEY) {
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });
} else {
  // Ethereal test account (auto‑generated)
  nodemailer.createTestAccount().then(testAccount => {
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  });
}

/**
 * Send verification email to a newly‑registered user.
 * @param {string} toEmail - Recipient address
 * @param {string} token   - JWT verification token (included in link)
 */
async function sendVerificationEmail(toEmail, token) {
  const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'no-reply@mindguard.app',
    to: toEmail,
    subject: 'MindGuard – Verify Your Email',
    html: `<p>Welcome to MindGuard!<br>Please verify your email by clicking the link below:</p>
           <a href="${verificationLink}">${verificationLink}</a>
           <p>If you did not sign up, you can ignore this email.</p>`,
  };

  if (!transporter) {
    throw new Error('Email transporter not configured');
  }
  const info = await transporter.sendMail(mailOptions);
  // For dev with Ethereal, log preview URL
  if (process.env.NODE_ENV !== 'production') {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
  return info;
}

module.exports = { sendVerificationEmail };

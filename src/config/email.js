const nodemailer = require('nodemailer');

const emailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

// Verify connection
transporter
  .verify()
  .then(() => console.log('✅ Email service ready'))
  .catch((err) => console.warn('⚠️ Email service warning:', err.message));

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const response = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return response;
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail, transporter };

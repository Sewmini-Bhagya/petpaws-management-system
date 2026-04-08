const nodemailer = require('nodemailer');

/**
 * Global Mail Transport Instance
 * Configured using environment variables for the SMTP provider.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Dispatches an email asynchronously to a client.
 * 
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} text - The plaintext body of the email.
 */
exports.sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"PetPaws" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
  } catch (error) {
    console.error('SMTP Transport Error:', error);
  }
};
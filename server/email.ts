import nodemailer from "nodemailer";
import { config } from "dotenv";

config(); // Ensure environment variables are loaded

// Configuration for sending real emails via an SMTP service
const smtpConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: (process.env.EMAIL_PORT === "465"), // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// For development, we'll use a simple setup that logs emails to the console
// if real credentials are not provided.
const devTransporter = {
  streamTransport: true,
  newline: 'unix',
  buffer: true,
};

// Determine which transport to use
const hasSmtpConfig = smtpConfig.host && smtpConfig.auth.user && smtpConfig.auth.pass;
const transporter = nodemailer.createTransport(hasSmtpConfig ? smtpConfig : devTransporter);

export async function sendPasswordResetEmail(email: string, token: string, host: string) {
  const resetLink = `http://${host}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"InboxFlow Support" <no-reply@inboxflow.com>',
    to: email,
    subject: "Your Password Reset Request",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `${resetLink}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>` +
          `<p>Please click on the following link, or paste this into your browser to complete the process:</p>` +
          `<p><a href="${resetLink}">${resetLink}</a></p>` +
          `<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (hasSmtpConfig) {
      console.log("Password reset email sent successfully to:", email);
    } else {
      console.log("Password reset email sent (logged to console):");
      // The `info.message` contains the full raw email content, including the link.
      console.log(info.message.toString());
    }
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
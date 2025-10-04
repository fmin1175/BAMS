import nodemailer from 'nodemailer';

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'bams092325@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // Do not fail on invalid certs in development
    rejectUnauthorized: false
  }
});

/**
 * Send an email notification
 * @param to Recipient email address
 * @param subject Email subject
 * @param text Plain text content
 * @param html HTML content (optional)
 */
export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  try {
    const mailOptions = {
      from: 'BAMS <bams092325@gmail.com>',
      to,
      subject,
      text,
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send a trial request confirmation email
 * @param to Recipient email address
 * @param name Recipient name
 * @param academyName Academy name
 */
export async function sendTrialRequestConfirmation(to: string, name: string, academyName: string) {
  const subject = 'Your BAMS Free Trial Request Has Been Received';
  
  const text = `
    Dear ${name},
    
    Thank you for requesting a free trial for ${academyName} on the Badminton Academy Management System (BAMS).
    
    Your request has been received and is currently under review by our administrators. Once approved, you will receive another email with your login credentials and instructions to access your trial account.
    
    If you have any questions in the meantime, please don't hesitate to contact us.
    
    Best regards,
    The BAMS Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Your BAMS Free Trial Request Has Been Received</h2>
      <p>Dear ${name},</p>
      <p>Thank you for requesting a free trial for <strong>${academyName}</strong> on the Badminton Academy Management System (BAMS).</p>
      <p>Your request has been received and is currently under review by our administrators. Once approved, you will receive another email with your login credentials and instructions to access your trial account.</p>
      <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The BAMS Team</p>
    </div>
  `;
  
  return sendEmail(to, subject, text, html);
}

/**
 * Send a trial request approval email with login credentials
 * @param to Recipient email address
 * @param name Recipient name
 * @param academyName Academy name
 * @param password System generated password
 */
export async function sendTrialRequestApprovalEmail(to: string, name: string, academyName: string, password: string) {
  const subject = 'Your BAMS Free Trial Request Has Been Approved';
  
  const text = `
    Dear ${name},
    
    Great news! Your free trial request for ${academyName} on the Badminton Academy Management System (BAMS) has been approved.
    
    You can now log in to your academy's dashboard using the following credentials:
    
    Email: ${to}
    Password: ${password} (This is your actual password, please copy it exactly as shown)
    
    Your free trial will be active for 90 days from today. During this period, you'll have full access to all features of the BAMS platform.
    
    To get started, please visit: http://localhost:3001/login (or the production URL)
    
    If you have any questions or need assistance, please don't hesitate to contact our support team.
    
    Best regards,
    The BAMS Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Your BAMS Free Trial Request Has Been Approved!</h2>
      <p>Dear ${name},</p>
      <p>Great news! Your free trial request for <strong>${academyName}</strong> on the Badminton Academy Management System (BAMS) has been approved.</p>
      
      <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Your Login Credentials:</strong></p>
        <p style="margin: 0 0 4px 0;"><strong>Email:</strong> ${to}</p>
        <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
      </div>
      
      <p>Your free trial will be active for <strong>90 days</strong> from today. During this period, you'll have full access to all features of the BAMS platform.</p>
      
      <p style="margin: 20px 0;">
        <a href="http://localhost:3001/login" style="background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Log In to Your Account
        </a>
      </p>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The BAMS Team</p>
    </div>
  `;
  
  return sendEmail(to, subject, text, html);
}
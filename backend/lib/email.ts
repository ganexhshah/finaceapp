import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

export async function sendOTPEmail(email: string, otp: string, name?: string) {
  const subject = 'Your OTP for Finance Tracker';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Google Sans', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .otp-box { background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 48px; font-weight: 700; color: #2563eb; letter-spacing: 8px; margin: 0; }
        .message { color: #1f2937; font-size: 16px; line-height: 1.6; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Finance Tracker</h1>
        </div>
        <div class="content">
          <p class="message">Hello${name ? ' ' + name : ''},</p>
          <p class="message">Your One-Time Password (OTP) for verification is:</p>
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
          </div>
          <p class="message">This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
          <p class="message">If you didn't request this OTP, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2026 Finance Tracker. All rights reserved.</p>
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, subject, html);
}

export async function sendWelcomeEmail(email: string, name: string) {
  const subject = 'Welcome to Finance Tracker!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Google Sans', Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .message { color: #1f2937; font-size: 16px; line-height: 1.6; margin: 20px 0; }
        .features { background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .feature { margin: 15px 0; padding-left: 30px; position: relative; }
        .feature:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Finance Tracker!</h1>
        </div>
        <div class="content">
          <p class="message">Hello ${name},</p>
          <p class="message">Thank you for joining Finance Tracker! We're excited to help you manage your finances better.</p>
          <div class="features">
            <h3 style="color: #1f2937; margin-top: 0;">What you can do:</h3>
            <div class="feature">Track your income and expenses</div>
            <div class="feature">Set and monitor budgets</div>
            <div class="feature">Manage multiple accounts</div>
            <div class="feature">Track parties (receivables/payables)</div>
            <div class="feature">View detailed statistics and reports</div>
          </div>
          <p class="message">Get started by logging into your account and exploring the features!</p>
        </div>
        <div class="footer">
          <p>© 2026 Finance Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(email, subject, html);
}

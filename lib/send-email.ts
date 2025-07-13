import { Resend } from 'resend';

// Initialize Resend only if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendPasswordResetEmailParams {
  email: string;
  resetUrl: string;
  userName?: string;
}

export async function sendEmail({ email, resetUrl, userName }: SendPasswordResetEmailParams) {
  // Development mode: Log to console
  if (!process.env.RESEND_API_KEY || process.env.NODE_ENV === 'development') {
    console.log('\n📧 === PASSWORD RESET EMAIL (Development Mode) ===');
    console.log(`📩 To: ${email}`);
    console.log(`👤 User: ${userName || 'Unknown'}`);
    console.log(`🔗 Reset Link: ${resetUrl}`);
    console.log('📝 Subject: Reset Your KetoTrack Password');
    console.log('💡 Tip: In production, this will be sent via Resend');
    console.log('================================================\n');
    return { success: true, messageId: 'dev-mode' };
  }

  // Production mode: Send actual email via Resend
  if (!resend) {
    throw new Error('Resend not initialized. Check RESEND_API_KEY environment variable.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'KetoTrack <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Your KetoTrack Password',
      html: generatePasswordResetEmailHTML({ resetUrl, userName }),
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send email');
    }

    console.log('✅ Password reset email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

function generatePasswordResetEmailHTML({
  resetUrl,
  userName,
}: {
  resetUrl: string;
  userName?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #2b8a3e;
            font-size: 28px;
            margin: 0;
            font-weight: 700;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #2b8a3e;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background-color: #1e6030;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .url-fallback {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🥑 KetoTrack</h1>
        </div>
        
        <div class="content">
            <h2>Reset Your Password</h2>
            
            <p>Hi${userName ? ` ${userName}` : ''},</p>
            
            <p>We received a request to reset your password for your KetoTrack account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
        </div>
        
        <div class="button-container">
            <a href="${resetUrl}" class="button">Reset My Password</a>
        </div>
        
        <div class="warning">
            <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour and can only be used once. If you need a new reset link, please request another password reset.
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <div class="url-fallback">${resetUrl}</div>
        
        <div class="footer">
            <p>Best regards,<br>The KetoTrack Team</p>
            <p><small>If you didn't request this password reset, please contact our support team immediately.</small></p>
        </div>
    </div>
</body>
</html>
  `;
}

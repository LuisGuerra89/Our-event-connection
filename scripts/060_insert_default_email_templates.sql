-- Insert default email templates for dating website

-- Welcome Email (Registration Successful)
INSERT INTO email_templates (template_name, subject, content, variables, status) VALUES
(
  'welcome_email',
  'Welcome to EventMatch - Your Journey Begins! 🎉',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to EventMatch!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hi <strong>{{firstName}}</strong>,</p>
    
    <p>Welcome to EventMatch! We''re thrilled to have you join our community of singles looking for meaningful connections through exciting events.</p>
    
    <p><strong>Here''s what you can do next:</strong></p>
    <ul style="padding-left: 20px;">
      <li>Complete your profile to increase your chances of matching</li>
      <li>Browse upcoming events in your area</li>
      <li>Set your preferences to find compatible matches</li>
      <li>Sign your waiver to attend events</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{siteUrl}}/onboarding" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Complete Your Profile</a>
    </div>
    
    <p>If you have any questions, feel free to reach out to our support team.</p>
    
    <p>Best regards,<br><strong>The EventMatch Team</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© {{year}} EventMatch. All rights reserved.</p>
  </div>
</body>
</html>',
  '["firstName", "siteUrl", "year"]',
  'active'
),

-- Password Changed
(
  'password_changed',
  'Your Password Has Been Changed 🔒',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #4caf50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Password Changed Successfully</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hi <strong>{{firstName}}</strong>,</p>
    
    <p>This is a confirmation that your password for your EventMatch account <strong>{{email}}</strong> has been successfully changed.</p>
    
    <p><strong>Details:</strong></p>
    <ul style="padding-left: 20px;">
      <li>Date & Time: {{dateTime}}</li>
      <li>IP Address: {{ipAddress}}</li>
    </ul>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>⚠️ If you did not make this change:</strong></p>
      <p style="margin: 10px 0 0 0;">Please contact our support team immediately and secure your account.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{siteUrl}}/contact" style="background: #f44336; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Report Issue</a>
    </div>
    
    <p>Best regards,<br><strong>The EventMatch Team</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© {{year}} EventMatch. All rights reserved.</p>
  </div>
</body>
</html>',
  '["firstName", "email", "dateTime", "ipAddress", "siteUrl", "year"]',
  'active'
),

-- Password Reset
(
  'password_reset',
  'Reset Your Password - EventMatch 🔐',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #ff9800; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Reset Your Password</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hi <strong>{{firstName}}</strong>,</p>
    
    <p>We received a request to reset your password for your EventMatch account. Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetLink}}" style="background: #ff9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
    <p style="background: #fff; padding: 10px; border: 1px solid #ddd; word-break: break-all; font-size: 12px;">{{resetLink}}</p>
    
    <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>⏰ This link will expire in 1 hour.</strong></p>
    </div>
    
    <p style="font-size: 14px; color: #666;">If you didn''t request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    
    <p>Best regards,<br><strong>The EventMatch Team</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© {{year}} EventMatch. All rights reserved.</p>
  </div>
</body>
</html>',
  '["firstName", "resetLink", "year"]',
  'active'
),

-- Event Registration Confirmation
(
  'event_registration',
  'You''re Registered! Get Ready for {{eventName}} 🎊',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Event Registration Confirmed!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hi <strong>{{firstName}}</strong>,</p>
    
    <p>Great news! You''re all set for <strong>{{eventName}}</strong>. We can''t wait to see you there!</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #667eea;">Event Details:</h3>
      <p><strong>📅 Date:</strong> {{eventDate}}</p>
      <p><strong>🕐 Time:</strong> {{eventTime}}</p>
      <p><strong>📍 Location:</strong> {{eventLocation}}</p>
      <p><strong>🎫 Registration ID:</strong> {{registrationId}}</p>
    </div>
    
    <p><strong>What to bring:</strong></p>
    <ul style="padding-left: 20px;">
      <li>Valid ID for check-in</li>
      <li>Your registration confirmation (this email)</li>
      <li>A positive attitude and open mind!</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{eventUrl}}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Event Details</a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Need to cancel? Please do so at least 24 hours before the event.</p>
    
    <p>Best regards,<br><strong>The EventMatch Team</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© {{year}} EventMatch. All rights reserved.</p>
  </div>
</body>
</html>',
  '["firstName", "eventName", "eventDate", "eventTime", "eventLocation", "registrationId", "eventUrl", "year"]',
  'active'
),

-- Match Notification
(
  'match_notification',
  'You Have a New Match! 💘',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">💘 You Have a New Match!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hi <strong>{{firstName}}</strong>,</p>
    
    <p>Exciting news! You''ve been matched with <strong>{{matchName}}</strong> based on your preferences and compatibility!</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #f5576c;">Match Details:</h3>
      <p><strong>{{matchName}}</strong></p>
      <p style="color: #666;">Compatibility Score: <strong style="color: #f5576c;">{{compatibilityScore}}%</strong></p>
      <p><strong>Event:</strong> {{eventName}}</p>
    </div>
    
    <p><strong>What''s Next?</strong></p>
    <ul style="padding-left: 20px;">
      <li>View their profile and interests</li>
      <li>Start a conversation</li>
      <li>Plan to meet at the event</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{matchUrl}}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Match Profile</a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Remember to be respectful and have fun getting to know each other!</p>
    
    <p>Best regards,<br><strong>The EventMatch Team</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© {{year}} EventMatch. All rights reserved.</p>
  </div>
</body>
</html>',
  '["firstName", "matchName", "compatibilityScore", "eventName", "matchUrl", "year"]',
  'active'
),

-- Event Reminder
(
  'event_reminder',
  'Reminder: {{eventName}} is Tomorrow! ⏰',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #2196F3; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">⏰ Event Reminder</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hi <strong>{{firstName}}</strong>,</p>
    
    <p>Just a friendly reminder that <strong>{{eventName}}</strong> is happening tomorrow!</p>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
      <h3 style="margin-top: 0; color: #1976D2;">Quick Details:</h3>
      <p><strong>📅 Date:</strong> {{eventDate}}</p>
      <p><strong>🕐 Time:</strong> {{eventTime}}</p>
      <p><strong>📍 Location:</strong> {{eventLocation}}</p>
    </div>
    
    <p><strong>Final Checklist:</strong></p>
    <ul style="padding-left: 20px;">
      <li>✓ Valid ID ready</li>
      <li>✓ Comfortable outfit chosen</li>
      <li>✓ Transportation planned</li>
      <li>✓ Open mind prepared!</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{eventUrl}}" style="background: #2196F3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Event Details</a>
    </div>
    
    <p>We''re excited to see you there!</p>
    
    <p>Best regards,<br><strong>The EventMatch Team</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© {{year}} EventMatch. All rights reserved.</p>
  </div>
</body>
</html>',
  '["firstName", "eventName", "eventDate", "eventTime", "eventLocation", "eventUrl", "year"]',
  'active'
),

-- Payment Receipt
(
  'payment_receipt',
  'Payment Receipt - {{eventName}} 💳',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #4caf50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">💳 Payment Confirmed</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px;">Hi <strong>{{firstName}}</strong>,</p>
    
    <p>Thank you for your payment! Here''s your receipt for <strong>{{eventName}}</strong>.</p>
    
    <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4caf50;">Payment Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px 0;">Transaction ID:</td>
          <td style="padding: 10px 0; text-align: right; font-weight: bold;">{{transactionId}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px 0;">Date:</td>
          <td style="padding: 10px 0; text-align: right;">{{paymentDate}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px 0;">Payment Method:</td>
          <td style="padding: 10px 0; text-align: right;">{{paymentMethod}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px 0;">Subtotal:</td>
          <td style="padding: 10px 0; text-align: right;">${{subtotal}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px 0;">Tax:</td>
          <td style="padding: 10px 0; text-align: right;">${{tax}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 18px; font-weight: bold;">Total:</td>
          <td style="padding: 10px 0; text-align: right; font-size: 18px; font-weight: bold; color: #4caf50;">${{total}}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{receiptUrl}}" style="background: #4caf50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Download Receipt</a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Keep this email for your records. If you have any questions about this payment, please contact our support team.</p>
    
    <p>Best regards,<br><strong>The EventMatch Team</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>© {{year}} EventMatch. All rights reserved.</p>
  </div>
</body>
</html>',
  '["firstName", "eventName", "transactionId", "paymentDate", "paymentMethod", "subtotal", "tax", "total", "receiptUrl", "year"]',
  'active'
)

ON CONFLICT (template_name) DO UPDATE SET
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  variables = EXCLUDED.variables,
  updated_at = NOW();

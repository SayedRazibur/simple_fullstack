export const otpEmailTemplate = ({
  title = 'Your One-Time Password',
  otp,
  expiresMinutes = 15,
  footer = `Speechceu Security Team`,
  name = 'User',
}) => `
  <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
      <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">Speech<span style="color:black">ceu</span></h2>
      <p style="color: #6b7280; font-size: 14px; text-align: right;">
      ${new Date()
        .toLocaleString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Europe/Copenhagen',
        })
        .replace(',', ' at')}
      </p>
      <h2 style="color: #1e293b; margin-bottom: 30px;">${title}</h2>
      <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 16px; color: #111827; margin-top: 8px;">Here is your One-Time Password to securely log in to your CM Exchange account:</p>
      <h1 style="font-size: 32px; color: #51946D; margin: 30px 0;">${otp}</h1>
      <p style="color: #4b5563;">Note: This OTP is valid for ${expiresMinutes} minutes.</p>
      <p style="margin-top: 30px; color: #6b7280;">If you did not request this OTP, please disregard this email or contact our support team.</p>
      <p style="margin-top: 40px; color: #1f2937;">Thank you for staying with us!</p>
      <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
    </div>
  </div>
`;

export const verificationEmailTemplate = ({
  name = 'User',
  verificationCode,
  expiresMinutes = 15,
  footer = 'Speechceu Security Team',
}) => `
  <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
      <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">Speech<span style="color:black">ceu</span></h2>
      <p style="color: #6b7280; font-size: 14px; text-align: right;">
        ${new Date()
          .toLocaleString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Europe/Copenhagen',
          })
          .replace(',', ' at')}
      </p>
      <h2 style="color: #1e293b; margin-bottom: 30px;">🎉 Welcome to Speechceu!</h2>
      <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 16px; color: #111827; margin-top: 8px;">
        Thank you for registering with Speechceu! To complete your registration, please verify your email address using the code below:
      </p>
      <div style="background-color: #f3f4f6; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
        <h1 style="font-size: 36px; color: #51946D; margin: 0; letter-spacing: 8px; font-weight: bold;">${verificationCode}</h1>
      </div>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;"><strong>⚠️ Important:</strong> This verification code is valid for ${expiresMinutes} minutes.</p>
      </div>
      <p style="color: #4b5563; margin-top: 30px;">
        If you did not create an account with Speechceu, please disregard this email or contact our support team.
      </p>
      <p style="margin-top: 40px; color: #1f2937;">Welcome aboard!</p>
      <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
    </div>
  </div>
`;

export const passwordChangedTemplate = (
  name = 'User',
  footer = `Speechceu Security Team`
) => `
  <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
      <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">Speech<span style="color:black">ceu</span></h2>
      <p style="color: #6b7280; font-size: 14px; text-align: right;">
        ${new Date()
          .toLocaleString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Europe/Copenhagen',
          })
          .replace(',', ' at')}
      </p>
      <h2 style="color: #1e293b; margin-bottom: 30px;">Password Changed Successfully</h2>
      <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 16px; color: #111827; margin-top: 8px;">
        We wanted to let you know that your account password has been changed successfully.  
        If you did not make this change, please contact our support team immediately.
      </p>
      <p style="margin-top: 40px; color: #1f2937;">Thank you for staying with us!</p>
      <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
    </div>
  </div>
`;

export const welcomeEmailTemplate = ({
  name = 'User',
  email,
  tempPassword,
  footer = 'Speechceu Team',
}) => `
  <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
      <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">Speech<span style="color:black">ceu</span></h2>
      <p style="color: #6b7280; font-size: 14px; text-align: right;">
        ${new Date()
          .toLocaleString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Europe/Copenhagen',
          })
          .replace(',', ' at')}
      </p>
      <h2 style="color: #1e293b; margin-bottom: 30px;">🎉 Welcome to Speechceu!</h2>
      <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 16px; color: #111827; margin-top: 8px;">
        Great news! Your identity verification has been approved and your account is now active.
      </p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; color: #374151;"><strong>Your Login Credentials:</strong></p>
        <p style="margin: 5px 0; color: #1f2937;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 5px 0; color: #1f2937;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
      </div>
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;"><strong>⚠️ Important:</strong> Please change your password immediately after your first login for security purposes.</p>
      </div>
      <p style="color: #4b5563; margin-top: 30px;">You can now log in and start using all features of Speechceu!</p>
      <p style="margin-top: 40px; color: #1f2937;">Welcome aboard!</p>
      <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
    </div>
  </div>
`;

export const rejectionEmailTemplate = ({
  name = 'User',
  reason,
  footer = 'Speechceu Support Team',
}) => `
  <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
      <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">Speech<span style="color:black">ceu</span></h2>
      <p style="color: #6b7280; font-size: 14px; text-align: right;">
        ${new Date()
          .toLocaleString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Europe/Copenhagen',
          })
          .replace(',', ' at')}
      </p>
      <h2 style="color: #1e293b; margin-bottom: 30px;">Identity Verification Update</h2>
      <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 16px; color: #111827; margin-top: 8px;">
        Thank you for submitting your identity verification. After careful review, we were unable to approve your verification at this time.
      </p>
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; color: #7f1d1d;"><strong>Reason:</strong></p>
        <p style="margin: 0; color: #991b1b;">${reason}</p>
      </div>
      <p style="color: #4b5563; margin-top: 30px;">
        You can submit a new verification request by ensuring:
      </p>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li>All document images are clear and legible</li>
        <li>The document is valid and not expired</li>
        <li>All information matches your profile details</li>
        <li>Both front and back images are provided (for driver's license)</li>
      </ul>
      <p style="color: #4b5563; margin-top: 20px;">
        If you have questions or need assistance, please don't hesitate to contact our support team.
      </p>
      <p style="margin-top: 40px; color: #1f2937;">Best regards,</p>
      <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
    </div>
  </div>
`;

export const documentEmailTemplate = ({
  name = 'User',
  documentTitle,
  documentLinks = [],
  footer = 'Speechceu Team',
}) => {
  const linksHtml = documentLinks
    .map(
      (link, index) => `
    <div style="margin: 10px 0;">
      <a href="${link}" style="display: inline-block; background-color: #51946D; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        View Document ${documentLinks.length > 1 ? index + 1 : ''}
      </a>
    </div>
  `
    )
    .join('');

  return `
  <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9fb;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 40px;">
      <h2 style="color:#51946D; font-size: 24px; font-weight:500; margin-bottom:5px;">Speech<span style="color:black">ceu</span></h2>
      <p style="color: #6b7280; font-size: 14px; text-align: right;">
        ${new Date()
          .toLocaleString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Europe/Copenhagen',
          })
          .replace(',', ' at')}
      </p>
      <h2 style="color: #1e293b; margin-bottom: 30px;">📄 Document Shared with You</h2>
      <p style="font-size: 16px; color: #111827;">Dear <strong>${name}</strong>,</p>
      <p style="font-size: 16px; color: #111827; margin-top: 8px;">
        We are sharing an important document with you. Please find the details below:
      </p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0 0 10px 0; color: #374151;"><strong>Document Title:</strong></p>
        <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${documentTitle}</p>
      </div>
      <div style="margin: 30px 0;">
        <p style="margin: 0 0 15px 0; color: #374151;"><strong>Access Your Document:</strong></p>
        ${linksHtml}
      </div>
      <p style="color: #4b5563; margin-top: 30px;">
        If you have any questions or need assistance accessing the document, please don't hesitate to contact our support team.
      </p>
      <p style="margin-top: 40px; color: #1f2937;">Best regards,</p>
      <p style="margin-top: 10px; color: #6b7280;">${footer}</p>
    </div>
  </div>
`;
};

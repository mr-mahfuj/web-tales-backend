export const EMAIL_VERIFICATION_TEMPLATE = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm your action</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f6f8; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#f5f6f8;">
        Your secure link is ready — it expires soon.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6f8;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px; max-width:100%; background-color:#ffffff; border-radius:10px; border:1px solid #e6e8eb;">
                    <tr>
                        <td style="padding:32px 32px 8px 32px;">
                            <p style="margin:0 0 4px 0; font-size:13px; font-weight:bold; color:#5b3df0; letter-spacing:0.5px;">WEB TALES</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 32px 0 32px;">
                            <p style="margin:0 0 8px 0; font-size:14px; color:#8a8f98;">Hi {{USERNAME}},</p>
                            <h1 style="margin:0 0 12px 0; font-size:20px; line-height:26px; color:#1a1a2e;">Confirm your request</h1>
                            <p style="margin:0 0 24px 0; font-size:14px; line-height:22px; color:#4a4f5a;">
                                Click the button below to confirm. This link is single-use and expires in {{EXPIRY_TIME}} {{UNIT}}.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:0 32px 32px 32px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" bgcolor="#5b3df0" style="border-radius:6px;">
                                        <a href="{{LINK_URL}}" target="_blank" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:6px;">
                                            Confirm Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 28px 32px; border-top:1px solid #eceef1;">
                            <p style="margin:16px 0 0 0; font-size:12px; line-height:18px; color:#a3a8b0;">
                                If you didn't request this, you can safely ignore this email. Never share this link with anyone.
                            </p>
                        </td>
                    </tr>
                </table>
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px; max-width:100%;">
                    <tr>
                        <td align="center" style="padding:20px 16px; font-size:12px; color:#a3a8b0;">
                            &copy; {{CURRENT_YEAR}} Web Tales. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const CONFIRM_PASSWORD_CHANGE_TEMPLATE = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm your password change</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f6f8; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#f5f6f8;">
        A password change was requested for your account.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6f8;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px; max-width:100%; background-color:#ffffff; border-radius:10px; border:1px solid #e6e8eb;">
                    <tr>
                        <td style="padding:32px 32px 8px 32px;">
                            <p style="margin:0 0 4px 0; font-size:13px; font-weight:bold; color:#5b3df0; letter-spacing:0.5px;">WEB TALES</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 32px 0 32px;">
                            <p style="margin:0 0 8px 0; font-size:14px; color:#8a8f98;">Hi {{USERNAME}},</p>
                            <h1 style="margin:0 0 12px 0; font-size:20px; line-height:26px; color:#1a1a2e;">Confirm your password change</h1>
                            <p style="margin:0 0 24px 0; font-size:14px; line-height:22px; color:#4a4f5a;">
                                We received a request to change your password. Confirm below — this link is single-use and expires in {{EXPIRY_TIME}} {{UNIT}}.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:0 32px 32px 32px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" bgcolor="#5b3df0" style="border-radius:6px;">
                                        <a href="{{LINK_URL}}" target="_blank" style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:6px;">
                                            Confirm Password Change
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 28px 32px; border-top:1px solid #eceef1;">
                            <p style="margin:16px 0 0 0; font-size:12px; line-height:18px; color:#a3a8b0;">
                                If you didn't request this, you can safely ignore this email. Never share this link with anyone.
                            </p>
                        </td>
                    </tr>
                </table>
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px; max-width:100%;">
                    <tr>
                        <td align="center" style="padding:20px 16px; font-size:12px; color:#a3a8b0;">
                            &copy; {{CURRENT_YEAR}} Web Tales. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const PASSWORD_CHANGED_NOTIFICATION_TEMPLATE = `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your password has been changed</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f6f8; font-family:Arial, Helvetica, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; font-size:1px; color:#f5f6f8;">
        Your password was successfully changed.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f6f8;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px; max-width:100%; background-color:#ffffff; border-radius:10px; border:1px solid #e6e8eb;">
                    <tr>
                        <td style="padding:32px 32px 8px 32px;">
                            <p style="margin:0 0 4px 0; font-size:13px; font-weight:bold; color:#5b3df0; letter-spacing:0.5px;">WEB TALES</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 32px 0 32px;">
                            <p style="margin:0 0 8px 0; font-size:14px; color:#8a8f98;">Hi {{USERNAME}},</p>
                            <h1 style="margin:0 0 12px 0; font-size:20px; line-height:26px; color:#1a1a2e;">Your password has been changed</h1>
                            <p style="margin:0 0 24px 0; font-size:14px; line-height:22px; color:#4a4f5a;">
                                This confirms the password for your Web Tales account was just changed. If this wasn't you, reset your password immediately and contact support.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 28px 32px; border-top:1px solid #eceef1;">
                            <p style="margin:16px 0 0 0; font-size:12px; line-height:18px; color:#a3a8b0;">
                                If you made this change, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px; max-width:100%;">
                    <tr>
                        <td align="center" style="padding:20px 16px; font-size:12px; color:#a3a8b0;">
                            &copy; {{CURRENT_YEAR}} Web Tales. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

import { transporter } from '../config/email.js';
import { emailGenerator } from './emailGenerator.js';
import { env } from '../config/env.js';
import { generateEmailVerificationToken } from './emailTokenGenerator.js';
import type {
    SendEmailParams,
    SendVerificationEmailParams,
} from '../types/emailVerificationValidation.js';

export async function sendEmail({ to, subject, templateName, values }: SendEmailParams) {
    const html = emailGenerator(templateName, values);
    const text = Object.entries(values)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    const info = await transporter.sendMail({
        from: `"Web Tales" <${env.smtpUser}>`,
        to,
        subject,
        html,
        text,
    });

    console.log('Email sent successfully:', info.messageId);
    return info;
}

export async function sendVerificationEmail({
    userId,
    email,
    username,
}: SendVerificationEmailParams) {
    const token = generateEmailVerificationToken(userId, email);
    const verificationLink = `http://${env.host}:${env.port}/auth/confirm-email/${token}`;

    return sendEmail({
        to: email,
        subject: 'Verify Your Email',
        templateName: 'emailConfirmation.html',
        values: {
            USERNAME: username,
            EXPIRY_TIME: env.emailConfirmationTokenExpiresIn.slice(0, -1),
            UNIT: 'minutes',
            LINK_URL: verificationLink,
            CURRENT_YEAR: new Date().getFullYear().toString(),
        },
    });
}

export async function sendPasswordChangeConfirmationEmail({
    email,
    username,
    token,
}: SendVerificationEmailParams) {
    if (!token) {
        throw new Error('Password change token is required to build the confirmation link');
    }

    const link = `http://${env.host}:${env.port}/users/validate-password-change/${token}`;

    return sendEmail({
        to: email,
        subject: 'Confirm Your Password Change',
        templateName: 'passwordChange.html',
        values: {
            USERNAME: username,
            EXPIRY_TIME: env.passwordChangeTokenExpiresIn.slice(0, -1),
            UNIT: 'minutes',
            LINK_URL: link,
            CURRENT_YEAR: new Date().getFullYear().toString(),
        },
    });
}

export function sendPasswordChangedNotification({
    email,
    username,
}: {
    email: string;
    username: string;
}) {
    return sendEmail({
        to: email,
        subject: 'Your Password Has Been Changed',
        templateName: 'passwordChanged.html',
        values: {
            USERNAME: username,
            CURRENT_YEAR: new Date().getFullYear().toString(),
        },
    });
}

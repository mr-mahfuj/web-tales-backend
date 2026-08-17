import { mailjet } from '../config/emailTransporter.js';
import { emailGenerator } from './emailGenerator.js';
import { env } from '../config/env.js';
import { ERROR_MESSAGES } from '../constants/index.js';
import {
    EMAIL_VERIFICATION_TEMPLATE,
    CONFIRM_PASSWORD_CHANGE_TEMPLATE,
    PASSWORD_CHANGED_NOTIFICATION_TEMPLATE,
} from '../constants/templates.js';
import { generateEmailVerificationToken } from './emailTokenGenerator.js';
import type {
    SendEmailParams,
    SendVerificationEmailParams,
} from '../types/emailVerificationValidation.js';

export async function sendEmail({ to, subject, template, values }: SendEmailParams) {
    const html = emailGenerator(template, values);
    const text = Object.entries(values)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    const credentials = Buffer.from(`${mailjet.apiKey}:${mailjet.secretKey}`).toString('base64');

    const response = await fetch(mailjet.apiUrl, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
            Messages: [
                {
                    From: { Email: env.emailFrom, Name: 'Web Tales' },
                    To: [{ Email: to }],
                    Subject: subject,
                    TextPart: text,
                    HTMLPart: html,
                },
            ],
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to send email: ${errorBody}`);
    }

    return response.json();
}

export async function sendVerificationEmail({
    userId,
    email,
    username,
}: SendVerificationEmailParams) {
    const token = generateEmailVerificationToken(userId, email);
    const verificationLink = `${env.frontendUrl}/auth/confirm-email/${token}`;

    return sendEmail({
        to: email,
        subject: 'Verify Your Email',
        template: EMAIL_VERIFICATION_TEMPLATE,
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
        throw new Error(ERROR_MESSAGES.PASSWORD_CHANGE_TOKEN_REQUIRED);
    }

    const link = `${env.frontendUrl}/users/confirm-password-change/${token}`;

    return sendEmail({
        to: email,
        subject: 'Confirm Your Password Change',
        template: CONFIRM_PASSWORD_CHANGE_TEMPLATE,
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
        template: PASSWORD_CHANGED_NOTIFICATION_TEMPLATE,
        values: {
            USERNAME: username,
            CURRENT_YEAR: new Date().getFullYear().toString(),
        },
    });
}

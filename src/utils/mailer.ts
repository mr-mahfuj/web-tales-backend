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

    try {
        const info = await transporter.sendMail({
            from: `"Web Tales" <${env.smtpUser}>`,
            to,
            subject,
            html,
            text,
        });

        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
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
            EXPIRY_TIME: env.tokenExpiresIn.slice(0, -1),
            UNIT: 'minutes',
            LINK_URL: verificationLink,
            CURRENT_YEAR: new Date().getFullYear().toString(),
        },
    });
}

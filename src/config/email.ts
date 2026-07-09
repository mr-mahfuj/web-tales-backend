import nodemailer from 'nodemailer';
import { env } from './env.js';

export const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: Number(env.smtpPort),
    secure: false,
    auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection failed:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

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

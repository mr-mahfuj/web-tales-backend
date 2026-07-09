import { transporter } from '../config/email.js';

export async function sendEmail(to: string, subject: string, html: string, text: string) {
    try {
        const info = await transporter.sendMail({
            from: `"Your App Name" <${process.env.SMTP_USER}>`,
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

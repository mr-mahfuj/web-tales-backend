export interface SendEmailParams {
    to: string;
    subject: string;
    templateName: string;
    values: Record<string, string>;
}

export interface SendVerificationEmailParams {
    userId: string;
    email: string;
    username: string;
}

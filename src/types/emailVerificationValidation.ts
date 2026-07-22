export interface SendEmailParams {
    to: string;
    subject: string;
    template: string;
    values: Record<string, string>;
}

export interface SendVerificationEmailParams {
    userId: string;
    email: string;
    username: string;
    token?: string;
}

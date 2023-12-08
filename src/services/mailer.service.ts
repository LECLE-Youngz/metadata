import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from 'nodemailer';

interface NormalEmailParams {
    to: string | string[];
    html?: string | Buffer;
    text?: string;
    subject?: string;
}


@Injectable()
export class MailerService {
    transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport(
            { // config mail server
                service: 'Gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: true,
                auth: {
                    user: 'dwalletlecle@gmail.com',
                    pass: 'kmkjqjdceodfonzp',
                }
            }
        );
    }

    async sendMail(inputs: NormalEmailParams): Promise<nodemailer.SentMessageInfo> {
        const { to, text, html, subject } = inputs;
        try {
            const res = await this.transporter.sendMail({
                from: 'Next hype <no-reply@lecle.com>',
                to, subject,
                ...html ? { html } : { text }
            });
            if (res) return true;
            return false;
        } catch (err) {
            Logger.error(`Send email error to ${to}. Detail: ${err.message}`, '[Mailer]')
            return false;
        }
    }

}
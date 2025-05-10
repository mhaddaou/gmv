import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
  }

  async sendWelcomeEmail(email: string, firstName: string, lastName: string): Promise<boolean> {
    try {
      if (!email || !firstName || !lastName) {
        this.logger.error('Missing required fields for welcome email');
        return false;
      }

      const mailOptions = {
        from: this.configService.get<string>('email.user'),
        to: email,
        subject: 'Welcome to GMB Builder!',
        html: `
          <h4 style="text-align: start">Welcome, ${firstName} ${lastName}!</h4>
          <p>Thank you for creating an account with us. We're excited to have you on board!</p>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p>Best regards,<br/>GMB Builder</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending welcome email: ${error.message}`, error.stack);
      return false;
    }
  }
} 
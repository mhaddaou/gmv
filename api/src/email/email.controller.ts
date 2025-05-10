import { Controller, Post, Body, Logger, BadRequestException } from '@nestjs/common';
import { EmailService } from './email.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Post('send-email')
  async sendEmail(@Body() body: { email: string; firstName: string; lastName: string }) {
    try {
      const { email, firstName, lastName } = body;

      if (!email || !firstName || !lastName) {
        throw new BadRequestException('Missing required fields');
      }

      const success = await this.emailService.sendWelcomeEmail(email, firstName, lastName);

      if (!success) {
        throw new BadRequestException('Failed to send email');
      }

      return { message: 'Account created and welcome email sent!' };
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    try {
      const { email } = body;

      if (!email) {
        throw new BadRequestException('Email is required');
      }

      try {
        // Send password reset email
        await this.firebaseService.auth.generatePasswordResetLink(email);

        // Respond with success message
        return { message: 'Password reset email sent successfully' };
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          throw new BadRequestException('User not found');
        }
        throw new BadRequestException('Failed to send password reset email');
      }
    } catch (error) {
      this.logger.error(`Error sending password reset email: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }
} 
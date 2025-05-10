import { Controller, Post, Get, Body, Query, Logger, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentLegacyController {
  private readonly logger = new Logger(PaymentLegacyController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Get('create-subscription-link')
  async createSubscriptionLinkGet(
    @Query('email') email: string,
    @Query('uid') uid: string,
    @Query('queriesCount') queriesCount: string,
  ) {
    try {
      if (!email || !uid) {
        throw new BadRequestException('Email and UID are required');
      }

      const result = await this.paymentService.createSubscriptionLink(
        email,
        uid,
        queriesCount ? parseInt(queriesCount, 10) : 1943,
      );

      return result;
    } catch (error) {
      this.logger.error(`Error creating subscription link (GET): ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }
  
  @Post('create-subscription-link')
  async createSubscriptionLinkPost(
    @Body() body: { email: string; uid: string; queriesCount?: number },
    @Query('email') queryEmail: string,
    @Query('uid') queryUid: string,
    @Query('queriesCount') queryQueriesCount: string,
  ) {
    try {
      // Try to get parameters from either body or query
      const email = body.email || queryEmail;
      const uid = body.uid || queryUid;
      const queriesCount = body.queriesCount || (queryQueriesCount ? parseInt(queryQueriesCount, 10) : 1943);
      
      if (!email || !uid) {
        throw new BadRequestException('Email and UID are required');
      }

      const result = await this.paymentService.createSubscriptionLink(
        email,
        uid,
        queriesCount,
      );

      return result;
    } catch (error) {
      this.logger.error(`Error creating subscription link (POST): ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Post('store-payment')
  async storePayment(@Body() body: { sessionId: string; uid: string }) {
    try {
      const { sessionId, uid } = body;

      if (!sessionId || !uid) {
        throw new BadRequestException('Missing sessionId or uid.');
      }

      return await this.paymentService.storePayment(sessionId, uid);
    } catch (error) {
      this.logger.error(`Error storing payment: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Post('check-payment')
  async checkPayment(@Body() body: { uid: string }) {
    try {
      const { uid } = body;

      if (!uid) {
        throw new BadRequestException('Missing uid.');
      }

      return await this.paymentService.checkPayment(uid);
    } catch (error) {
      this.logger.error(`Error checking payment: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @Post('check-log-counts')
  async checkLogCounts(@Body() body: { uid: string }) {
    try {
      const { uid } = body;

      if (!uid) {
        throw new BadRequestException('Missing uid.');
      }

      return await this.paymentService.checkLogCounts(uid);
    } catch (error) {
      this.logger.error(`Error checking log counts: ${error.message}`, error.stack);
      throw new BadRequestException(error.message);
    }
  }
} 
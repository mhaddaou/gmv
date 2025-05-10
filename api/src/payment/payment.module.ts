import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentLegacyController } from './payment-legacy.controller';
import { PaymentService } from './payment.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [PaymentController, PaymentLegacyController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {} 
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlacesModule } from './places/places.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { PaymentModule } from './payment/payment.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          port: process.env.PORT || 6465,
          google: {
            mapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'your-maps-api-key',
          },
          firebase: {
            projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'your-client-email',
            privateKey: process.env.FIREBASE_PRIVATE_KEY || 'your-private-key',
            databaseUrl: process.env.FIREBASE_DATABASE_URL || 'https://your-project-id.firebaseio.com',
          },
          stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY || 'your-stripe-secret-key',
          }
        }),
      ],
    }),
    PlacesModule,
    EmailModule,
    PaymentModule,
    LocationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

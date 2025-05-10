import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import {
  PlacesQueryDto,
  PlaceDetailsDto,
  PhotoQueryDto,
} from './dto/places.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('places')
export class PlacesController {
  private readonly logger = new Logger(PlacesController.name);

  constructor(
    private readonly placesService: PlacesService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get('getPlaces')
  async getPlaces(@Query() query: PlacesQueryDto) {
    try {
      this.logger.log(`getPlaces request with uid: ${query.uid}`);

      // Validate user exists
      const userRecord = await this.firebaseService.auth.getUser(query.uid);
      if (!userRecord) {
        return { error: 'User not found' };
      }
      this.logger.log(`Successfully fetched user data: ${userRecord.uid}`);

      // Get user's Firestore document for additional data
      const userDoc = await this.firebaseService.db
        .collection('users')
        .doc(query.uid)
        .get();
      if (!userDoc.exists) {
        this.logger.log('No additional user data found in Firestore');
      } else {
        this.logger.log('User Firestore data retrieved successfully');
      }

      const userData = userDoc.data();

      // Fetch the payment record for the given UID
      const paymentQuerySnapshot = await this.firebaseService.db
        .collection('payments')
        .where('uid', '==', query.uid)
        .limit(1)
        .get();

      if (
        paymentQuerySnapshot.empty &&
        (userData?.role !== 'admin' || userData?.role === undefined)
      ) {
        return {
          error: 'No payment record found for the given UID.',
          status: 'not-paid',
        };
      }

      const paymentDoc =
        paymentQuerySnapshot.docs.length > 0
          ? paymentQuerySnapshot.docs[0]
          : null;
      const paymentData = paymentDoc?.data();

      // Check if payment data exists and has queriesCount for lifetime access
      if (
        (!paymentData || !paymentData?.queriesCount) &&
        (userData?.role !== 'admin' || userData?.role === undefined)
      ) {
        return {
          message: 'Invalid payment record.',
          status: 'not-paid',
        };
      }

      // Check the subscription status
      const paymentStatus = paymentData?.status || 'inactive';

      // Check if the subscription was canceled
      if (
        paymentStatus !== 'active' &&
        (userData?.role !== 'admin' || userData?.role === undefined)
      ) {
        return {
          message:
            'Your lifetime access is not active. Please purchase lifetime access to continue using the service.',
          status: 'not-paid',
        };
      }

      // Call the service to get places
      const places = await this.placesService.getPlaces({
        ...query,
        role: userData?.role,
      });

      // Increment the queriesConsumed field
      if (paymentDoc) {
        const newQueriesConsumed = (paymentData?.queriesConsumed || 0) + 1;
        await this.firebaseService.db
          .collection('payments')
          .doc(paymentDoc.id)
          .update({
            queriesConsumed: newQueriesConsumed,
          });
      }

      return { data: places || [] };
    } catch (error) {
      this.logger.error(`Error in getPlaces: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }

  @Get('getPhotoUrl')
  getPhotoUrl(@Query() query: PhotoQueryDto) {
    try {
      if (!query.photo_reference) {
        return { error: 'Photo reference is required' };
      }

      const photoUrl = this.placesService.getPhotoUrl(
        query.photo_reference,
        query.maxwidth,
      );
      return { photoUrl };
    } catch (error) {
      this.logger.error(`Error in getPhotoUrl: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }

  @Get('getDetails')
  async getPlaceDetails(@Query() query: PlaceDetailsDto) {
    try {
      const placeId = query.placeId;

      if (!placeId) {
        return { error: 'Place id is required' };
      }

      const response = await this.placesService.getPlaceDetails({ placeId });
      const item = response?.data;
      const addressObject = this.placesService['getAddressSeparated'](
        item?.result?.adr_address,
      );

      return {
        data: {
          name: item?.name,
          domain: '',
          phone: item.result?.formatted_phone_number,
          website: item.result?.website,
          address: {
            address1: addressObject?.streetAddress,
            address2: '',
            city: addressObject?.city,
            state: addressObject?.state,
            country: addressObject?.country,
            zipCode: addressObject?.zipCode,
          },
          numberOfEmployees: '',
          revenue: '',
          facebook: '',
          linkedin: '',
          site: item.result?.website,
          ...item?.result,
        },
        status: item?.status,
      };
    } catch (error) {
      this.logger.error(
        `Error in getPlaceDetails: ${error.message}`,
        error.stack,
      );
      return { error: error.message };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../firebase/firebase.service';
import { PlacesQueryDto, PlaceDetailsDto } from './dto/places.dto';

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);
  private readonly urlApiPlaces = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  private readonly urlApiDetails = 'https://maps.googleapis.com/maps/api/place/details/json';
  private readonly apiKey: string;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    this.logger.log(`Google Maps API Key initialized: ${this.apiKey ? 'Yes' : 'No'}`);
  }

  private getAddressSeparated(htmlString: string) {
    // Parse the HTML string using JSDOM
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    // Extract each value by class name
    const streetAddress = doc.querySelector('.street-address')?.textContent || '';
    const locality = doc.querySelector('.locality')?.textContent || '';
    const region = doc.querySelector('.region')?.textContent || '';
    const postalCode = doc.querySelector('.postal-code')?.textContent || '';
    const country = doc.querySelector('.country-name')?.textContent || '';

    return {
      streetAddress,
      city: locality,
      state: region,
      zipCode: postalCode,
      country,
    };
  }

  async getPlaces(params: PlacesQueryDto) {
    try {
      // Verify Firebase auth first
      await this.firebaseService.verifyFirebaseAuth(params.uid);

      // Retrieve the payment document with the given uid from Firestore
      this.logger.log(`Checking payment status for uid: ${params.uid}`);
      const paymentSnapshot = await this.firebaseService.db
        .collection('payments')
        .where('uid', '==', params.uid)
        .get();

      if (paymentSnapshot.empty && params.role !== 'admin') {
        this.logger.log('No payment found for user');
        return {
          message: 'You need to purchase lifetime access before searching for places!',
        };
      }

      // Assuming each user has only one payment document
      const paymentDoc = paymentSnapshot.docs.length > 0 ? paymentSnapshot.docs[0] : null;
      const paymentData = paymentDoc?.data();

      // Check if payment exists and has queriesCount
      if ((!paymentData || !paymentData?.queriesCount) && params.role !== 'admin') {
        return {
          message: 'Invalid payment record.',
        };
      }

      const { queriesCount } = paymentData ? paymentData : { queriesCount: 0 };

      // For lifetime access, we'll check all-time usage rather than period-based
      const startDate = new Date(0); // Start from Unix epoch
      const endDate = new Date(); // Current time

      const logSnapshot = await this.firebaseService.db
        .collection('logs')
        .where('userId', '==', params.uid)
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get();

      const lengthDocs = logSnapshot.docs.length;
      if (lengthDocs >= queriesCount && params.role !== 'admin') {
        // User has reached the limit
        return {
          message: 'Out of queries',
        };
      }

      // Proceed with the API call
      let url = this.urlApiPlaces;
      if (params.pageToken) {
        url += `?pagetoken=${params.pageToken}`;
      } else {
        url += `?location=${params.latitude},${params.longitude}`;
        url += `&radius=${params.radius ? params.radius : 1500}`;
        url += '&query=';
        if (params.country) url += `${params.country},`;
        if (params.city) url += `${params.city},`;
        if (params.state) url += `${params.state},`;
        if (params.search) url += `${params.search},`;
        if (params.type) url += `${params.type},`;
      }
      url += `&key=${this.apiKey}`;

      const response = await axios.get(url);

      this.logger.log(`Places API response status: ${response.status}`);

      if (!response.data || !response.data.results) {
        throw new Error('Invalid response from Places API');
      }

      const dataList = response.data.results;
      this.logger.log(`Found ${dataList.length} places`);

      let result: any[] = [];

      if (dataList && dataList.length > 0) {
        result = await Promise.all(
          dataList.map(async (s: any) => {
            const details = await this.getPlaceDetails({ placeId: s?.place_id });
            const addressObject = this.getAddressSeparated(details?.data?.result?.adr_address);
            return {
              name: s?.name,
              domain: '',
              phone: details?.data?.result?.formatted_phone_number,
              website: details?.data?.result?.website,
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
              site: details?.data?.result?.website,
              googleMapsUrl: details?.data?.result?.url,
              ...s,
            };
          }),
        );
      }

      // Log the userId and the count of the list to the Firestore 'logs' collection
      const logEntry = {
        userId: params.uid,
        count: result.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.firebaseService.db.collection('logs').add(logEntry);
      this.logger.log(`Log added with userId and count: ${JSON.stringify(logEntry)}`);

      return result;
    } catch (error) {
      this.logger.error(`Error in getPlaces: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPlaceDetails(params: PlaceDetailsDto) {
    try {
      const response = await axios.get(
        `${this.urlApiDetails}?place_id=${params.placeId}&key=${this.apiKey}`,
      );

      if (!response.data || !response.data.result) {
        throw new Error('Invalid response from Places API Details');
      }

      return response;
    } catch (error) {
      this.logger.error(`Error in getPlaceDetails: ${error.message}`, error.stack);
      throw error;
    }
  }

  getPhotoUrl(photoReference: string, maxwidth: string = '400'): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }
} 
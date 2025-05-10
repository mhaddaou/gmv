import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  private readonly baseUrl = 'https://countriesnow.space/api/v0.1/countries';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getViewModelData() {
    try {
      const countriesCollection = this.firebaseService.db.collection('states');
      const snapshot = await countriesCollection.get();

      if (snapshot.empty) {
        return [];
      }

      const countries: any[] = [];
      snapshot.forEach((doc: any) => {
        countries.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return countries;
    } catch (error) {
      this.logger.error(`Error fetching view model data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTerms() {
    try {
      const termsId = 'terms-id';
      const settingsCollection = this.firebaseService.db.collection('settings');
      const doc = await settingsCollection.doc(termsId).get();

      if (!doc.exists) {
        throw new Error('Setting not found');
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      this.logger.error(`Error fetching terms: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCountries() {
    try {
      // Simplified for now, could fetch from external API or database
      return { countries: ['United States', 'Canada'] };
    } catch (error) {
      this.logger.error(`Error fetching countries: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getStates(country: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/states`, { country });
      const states = response.data.data.states;
      return { states };
    } catch (error) {
      this.logger.error(`Error fetching states: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCities(country: string, state: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/state/cities`, {
        country,
        state,
      });
      const cities = response.data.data;
      return { cities };
    } catch (error) {
      this.logger.error(`Error fetching cities: ${error.message}`, error.stack);
      throw error;
    }
  }

  getCategories() {
    try {
      const placeTypes = [
        'restaurant',
        'cafe',
        'library',
        'school',
        'park',
        'hospital',
        'museum',
        'shopping_mall',
        'stadium',
      ];
      return { categories: placeTypes };
    } catch (error) {
      this.logger.error(`Error fetching categories: ${error.message}`, error.stack);
      throw error;
    }
  }
} 
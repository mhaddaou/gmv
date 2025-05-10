import { Controller, Get, Param, Logger } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  private readonly logger = new Logger(LocationController.name);

  constructor(private readonly locationService: LocationService) {}

  @Get('terms')
  async getTerms() {
    try {
      return await this.locationService.getTerms();
    } catch (error) {
      this.logger.error(`Error in getTerms: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }

  @Get('countries')
  async getCountries() {
    try {
      return await this.locationService.getCountries();
    } catch (error) {
      this.logger.error(`Error in getCountries: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }

  @Get('states/:country')
  async getStates(@Param('country') country: string) {
    try {
      return await this.locationService.getStates(country);
    } catch (error) {
      this.logger.error(`Error in getStates: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }

  @Get('cities/:country/:state')
  async getCities(@Param('country') country: string, @Param('state') state: string) {
    try {
      return await this.locationService.getCities(country, state);
    } catch (error) {
      this.logger.error(`Error in getCities: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }

  @Get('categories')
  async getCategories() {
    try {
      return await this.locationService.getCategories();
    } catch (error) {
      this.logger.error(`Error in getCategories: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }
} 
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MapService {
  private GOOONG_MAP_API_KEY: string;

  constructor() {
    this.GOOONG_MAP_API_KEY = process.env.GOONG_API_KEY;
  }

  async getLocationByAddress(address: string): Promise<unknown> {
    try {
      // const GOOONG_MAP_API_KEY = process.env.GOONG_API_KEY;
      console.log('GOOONG_MAP_API_KEY: ', this.GOOONG_MAP_API_KEY);
      const response = await axios.get('https://rsapi.goong.io/geocode', {
        params: {
          address: address,
          api_key: this.GOOONG_MAP_API_KEY,
        },
      });
      return response?.data?.results;
    } catch (err) {
      console.error('Error fetching data:', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async getLocationByCoordinates(lat: number, lng: number): Promise<unknown> {
    try {
      const response = await axios.get('https://rsapi.goong.io/geocode', {
        params: {
          latlng: `${lat}, ${lng}`,
          api_key: this.GOOONG_MAP_API_KEY,
        },
      });
      return response?.data?.results;
    } catch (err) {
      console.error('Error fetching data:', err);
      throw new InternalServerErrorException(err.message);
    }
  }
}

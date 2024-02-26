import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { MapService } from './map.service';
import { Public } from '../../decorators/public.decorator';

@Controller('map')
@ApiTags('Map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  @Public()
  @ApiQuery({
    name: 'address',
    required: true,
  })
  async getLocationsByAddress(
    @Query('address') address: string,
  ): Promise<unknown> {
    return this.mapService.getLocationByAddress(address);
  }

  @Get('coordinates')
  @Public()
  @ApiQuery({ name: 'lat', required: true, description: 'Vĩ độ', type: Number })
  @ApiQuery({
    name: 'lng',
    required: true,
    description: 'Kinh độ',
    type: Number,
  })
  async getLocationsByCoordinates(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ): Promise<unknown> {
    return this.mapService.getLocationByCoordinates(lat, lng);
  }
}

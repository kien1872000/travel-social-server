import { Airport } from '@dto/place/vehicle.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Vehicle } from '@util/enums';
import { GoongMapService } from 'src/goong-map/goong-map.service';

const EARTH_RADIUS = 6371;
const PLANE_VELOCITY = 700;
@Injectable()
export class VehicleSuggestionService {
  constructor(private readonly goongmapService: GoongMapService) {}
  private haversine(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const dLat = ((lat1 - lat2) * Math.PI) / 180;
    const dLng = ((lng1 - lng2) * Math.PI) / 180;
    lat1 = (lat1 * Math.PI) / 180;
    lat2 = (lat2 * Math.PI) / 180;
    const a =
      Math.pow(Math.sin(dLat / 2), 2) +
      Math.pow(Math.sin(dLng / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.asin(Math.sqrt(a));
    return EARTH_RADIUS * c;
  }
  public async suggestVehicle(
    depatureLat: number,
    depatureLng: number,
    destinationLat: number,
    destinationLng: number,
    nearDepartureAirports: Airport[],
    nearDestinationAirports: Airport[],
  ) {
    try {
      const crowFilesDistance =
        this.haversine(
          depatureLat,
          depatureLng,
          destinationLat,
          destinationLng,
        ) * 1000;
      let airport;
      if (crowFilesDistance > 400000) {
        const timeByPlane = (crowFilesDistance / PLANE_VELOCITY) * 3600;
        const origins = `${depatureLat},${depatureLng}|${destinationLat},${destinationLng}`;
        let destinations = '';
        [...nearDepartureAirports, ...nearDestinationAirports].forEach(
          (value) => {
            destinations = destinations + `${value.lat},${value.lng}`;
          },
        );
        destinations = destinations.slice(0, destinations.length-1);
        const distanceMatrix = await this.goongmapService.getMatrix(
          origins,
          destinations,
          Vehicle.Car,
        );
        const nearDepartureAirportsTemp = distanceMatrix.rows[0].elements.slice(
          0,
          nearDepartureAirports.length,
        );
        const nearestDepartureAirport = nearDepartureAirportsTemp.reduce(
          (prev, curr, index) =>
            prev.duration.value < curr.duration.value
              ? { ...prev, ...nearDepartureAirports[index] }
              : { ...curr, ...nearDepartureAirports[index] },

          nearDepartureAirportsTemp[0],
        );
        const nearDestinationAirportsTemp =
          distanceMatrix.rows[1].elements.slice(nearDepartureAirports.length);
        const nearestDestinationAirport = nearDestinationAirportsTemp.reduce(
          (prev, curr, index) =>
            prev.duration.value < curr.duration.value
              ? { ...prev, ...nearDestinationAirports[index] }
              : { ...curr, ...nearDepartureAirports[index] },
          nearDestinationAirportsTemp[0],
        );
        airport = {
          nearestDepartureAirport,
          nearestDestinationAirport,
          distance:
            (nearestDepartureAirport.distance.value +
              nearestDestinationAirport.distance.value +
              crowFilesDistance) /
            1000,
          duration:
            nearestDepartureAirport.duration.value +
            nearestDestinationAirport.duration.value +
            timeByPlane,
        };
      }
      const [carMatrix, bikeMatrix] = await Promise.all([
        this.goongmapService.getMatrix(
          `${depatureLat},${depatureLng}`,
          `${destinationLat},${destinationLng}}`,
          Vehicle.Car,
        ),
        this.goongmapService.getMatrix(
          `${depatureLat},${depatureLng}`,
          `${destinationLat},${destinationLng}}`,
          Vehicle.Bike,
        ),
      ]);
      const car = {
        distance: carMatrix.rows[0].elements[0].distance.value / 1000,
        duration: carMatrix.rows[0].elements[0].duration.value,
      };
      const bike = {
        distance: bikeMatrix.rows[0].elements[0].distance.value / 1000,
        duration: bikeMatrix.rows[0].elements[0].duration.value,
      };
      if (crowFilesDistance > 400000)
        return this.getRecommend(car, bike, airport);
      return this.getRecommendNoAirport(car, bike);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private getRecommend(car, bike, airport) {
    if (car.duration > bike.duration && car.duration > airport.duration) {
      return {
        recommend: {
          car,
        },
        other: {
          bike,
          airport,
        },
      };
    } else if (
      bike.duration > car.duration &&
      bike.duration > airport.duration
    ) {
      return {
        recommend: {
          bike,
        },
        other: {
          car,
          airport,
        },
      };
    }
    return {
      recommend: {
        airport,
      },
      other: {
        car,
        bike,
      },
    };
  }
  private getRecommendNoAirport(car, bike) {
    if (car.duration > bike.duration) {
      return {
        recommend: {
          car,
        },
        other: {
          bike,
        },
      };
    }
    return {
      recommend: { bike },
      other: { car },
    };
  }
  private getNearestAirport(lat, lng, airports) {
    return airports.reduce((prev, curr) =>
      this.haversine(lat, lng, prev.lat, prev.lng) <
      this.haversine(lat, lng, curr.lat, curr.lng)
        ? prev
        : curr,
    );
  }
}

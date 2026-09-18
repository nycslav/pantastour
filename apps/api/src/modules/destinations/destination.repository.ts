import {
  destinationSummarySchema,
  nearbyDestinationSummarySchema,
  type DestinationDetail,
  type DestinationSummary,
  type DiscoveryQuery,
  type NearbyDestinationQuery,
  type NearbyDestinationSummary,
} from '@saraya/contracts';

import { hasDatabaseConfiguration } from '../../platform/database/pool';
import { PostgresDestinationRepository } from './destination.postgres-repository';
import { seedDestinations } from './destination.seed';

export interface DestinationRepository {
  findAll(query: DiscoveryQuery): Promise<DestinationSummary[]>;
  findNearby(query: NearbyDestinationQuery): Promise<NearbyDestinationSummary[]>;
  findById(id: string): Promise<DestinationDetail | null>;
}

export class InMemoryDestinationRepository implements DestinationRepository {
  async findAll(query: DiscoveryQuery): Promise<DestinationSummary[]> {
    const search = query.search.toLocaleLowerCase();
    const interest = query.interest?.toLocaleLowerCase();

    return seedDestinations
      .filter((destination) => {
        const searchable = [
          destination.name,
          destination.province,
          destination.region,
          destination.category,
          ...destination.tags,
        ]
          .join(' ')
          .toLocaleLowerCase();

        return (
          (!search || searchable.includes(search)) &&
          (!query.islandGroup || destination.islandGroup === query.islandGroup) &&
          (!interest || destination.tags.some((tag) => tag.toLocaleLowerCase() === interest))
        );
      })
      .map((destination) => destinationSummarySchema.parse(destination));
  }

  async findNearby(query: NearbyDestinationQuery): Promise<NearbyDestinationSummary[]> {
    return seedDestinations
      .map((destination) => ({
        ...destinationSummarySchema.parse(destination),
        distanceKm: calculateDistanceKm(
          query.latitude,
          query.longitude,
          destination.coordinates.latitude,
          destination.coordinates.longitude,
        ),
      }))
      .filter(({ distanceKm }) => distanceKm <= query.radiusKm)
      .sort((left, right) => left.distanceKm - right.distanceKm)
      .slice(0, query.limit)
      .map((destination) => nearbyDestinationSummarySchema.parse(destination));
  }

  async findById(id: string): Promise<DestinationDetail | null> {
    return seedDestinations.find((destination) => destination.id === id) ?? null;
  }
}

export function createDestinationRepository(): DestinationRepository {
  if (process.env.NODE_ENV !== 'test' && hasDatabaseConfiguration()) {
    return new PostgresDestinationRepository();
  }

  return new InMemoryDestinationRepository();
}

function calculateDistanceKm(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number,
) {
  const earthRadiusKm = 6371.0088;
  const latitudeDelta = degreesToRadians(toLatitude - fromLatitude);
  const longitudeDelta = degreesToRadians(toLongitude - fromLongitude);
  const fromLatitudeRadians = degreesToRadians(fromLatitude);
  const toLatitudeRadians = degreesToRadians(toLatitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

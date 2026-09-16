import type {
  DestinationDetail,
  DestinationSummary,
  DiscoveryQuery,
} from '@pantastour/contracts';
import { createApiClient } from '@pantastour/api-client';

import { mockDestinations } from './data/mockDestinations';

export interface DestinationGateway {
  list(query: DiscoveryQuery): Promise<DestinationSummary[]>;
  getById(id: string): Promise<DestinationDetail | null>;
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export class MockDestinationGateway implements DestinationGateway {
  async list(query: DiscoveryQuery): Promise<DestinationSummary[]> {
    await wait(120);
    const search = query.search.toLocaleLowerCase();

    return mockDestinations.filter((destination) => {
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
        (!query.interest ||
          destination.tags.some((tag) => tag.toLowerCase() === query.interest?.toLowerCase()))
      );
    });
  }

  async getById(id: string): Promise<DestinationDetail | null> {
    await wait(100);
    return mockDestinations.find((destination) => destination.id === id) ?? null;
  }
}

class ApiDestinationGateway implements DestinationGateway {
  private readonly client = createApiClient(process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000');

  list(query: DiscoveryQuery) {
    return this.client.destinations.list(query);
  }

  getById(id: string) {
    return this.client.destinations.getById(id);
  }
}

export const destinationGateway: DestinationGateway =
  process.env.EXPO_PUBLIC_DATA_MODE === 'api'
    ? new ApiDestinationGateway()
    : new MockDestinationGateway();

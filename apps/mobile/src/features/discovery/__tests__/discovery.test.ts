import type { DestinationDetail, DestinationSummary } from '@saraya/contracts';

import { ApiDestinationGateway } from '../gateways';

const summary: DestinationSummary = {
  id: 'batanes',
  name: 'Batanes',
  province: 'Batanes',
  region: 'Cagayan Valley',
  islandGroup: 'Luzon',
  category: 'Nature',
  rating: 4.9,
  summary: 'Rolling hills and Ivatan heritage.',
  heroTone: 'forest',
  tags: ['Nature', 'Heritage'],
};

const detail: DestinationDetail = {
  ...summary,
  description: 'A northern island destination shaped by Ivatan culture.',
  highlights: ['Marlboro Hills'],
  bestFor: ['Culture'],
  coordinates: { latitude: 20.4487, longitude: 121.9702 },
  culturalGuide: {
    historicalContext: 'Ivatan communities adapted their homes and traditions to the islands.',
    etiquette: ['Ask before photographing residents.'],
    localPhrase: 'Dios mamajes',
  },
};

describe('destination API gateway', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.saraya.test';
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  });

  it('loads and validates destination results from the API', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => [summary],
    } as Response);

    const results = await new ApiDestinationGateway().list({ search: 'Batanes', islandGroup: 'Luzon' });

    expect(results).toEqual([summary]);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.saraya.test/destinations?search=Batanes&islandGroup=Luzon',
      expect.objectContaining({ headers: expect.objectContaining({ Accept: 'application/json' }) }),
    );
  });

  it('loads and validates a destination detail from the API', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => detail,
    } as Response);

    await expect(new ApiDestinationGateway().getById('batanes')).resolves.toEqual(detail);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.saraya.test/destinations/batanes',
      expect.any(Object),
    );
  });

  it('requires an API URL instead of falling back to local data', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    expect(() => new ApiDestinationGateway().list({ search: '' })).toThrow(
      'EXPO_PUBLIC_API_BASE_URL is required',
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

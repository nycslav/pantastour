import { PostgresDestinationRepository } from '../src/modules/destinations/destination.postgres-repository';

const mockQuery = jest.fn();

jest.mock('../src/platform/database/pool', () => ({
  getPool: () => ({ query: mockQuery }),
}));

describe('PostgresDestinationRepository', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('uses PostGIS longitude-latitude ordering and maps nearby results', async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 'baguio',
          name: 'Baguio',
          province: 'Benguet',
          region: 'Cordillera Administrative Region',
          island_group: 'Luzon',
          category: 'Culture',
          rating: '4.8',
          summary: 'First sentence. Second sentence.',
          hero_tone: 'forest',
          tags: ['Arts', 'Food', 'Mountains'],
          distance_km: '0.125',
        },
      ],
    });

    const repository = new PostgresDestinationRepository();
    const result = await repository.findNearby({
      latitude: 16.4023,
      longitude: 120.596,
      radiusKm: 25,
      limit: 5,
    });

    expect(result).toEqual([
      expect.objectContaining({ id: 'baguio', rating: 4.8, distanceKm: 0.125 }),
    ]);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('ST_DWithin'),
      [120.596, 16.4023, 25, 5],
    );
  });
});

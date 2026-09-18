import { seedDestinations } from '../../modules/destinations/destination.seed';
import { closePool, getPool } from './pool';

async function seed() {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    for (const destination of seedDestinations) {
      await client.query(
        `INSERT INTO destinations (
          id, name, province, region, island_group, category, rating, summary, description,
          hero_tone, tags, highlights, best_for, location, historical_context, etiquette,
          local_phrase
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13,
          ST_SetSRID(ST_MakePoint($14, $15), 4326)::geography,
          $16, $17, $18
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          province = EXCLUDED.province,
          region = EXCLUDED.region,
          island_group = EXCLUDED.island_group,
          category = EXCLUDED.category,
          rating = EXCLUDED.rating,
          summary = EXCLUDED.summary,
          description = EXCLUDED.description,
          hero_tone = EXCLUDED.hero_tone,
          tags = EXCLUDED.tags,
          highlights = EXCLUDED.highlights,
          best_for = EXCLUDED.best_for,
          location = EXCLUDED.location,
          historical_context = EXCLUDED.historical_context,
          etiquette = EXCLUDED.etiquette,
          local_phrase = EXCLUDED.local_phrase,
          updated_at = now()`,
        [
          destination.id,
          destination.name,
          destination.province,
          destination.region,
          destination.islandGroup,
          destination.category,
          destination.rating,
          destination.summary,
          destination.description,
          destination.heroTone,
          destination.tags,
          destination.highlights,
          destination.bestFor,
          destination.coordinates.longitude,
          destination.coordinates.latitude,
          destination.culturalGuide.historicalContext,
          destination.culturalGuide.etiquette,
          destination.culturalGuide.localPhrase,
        ],
      );
    }
    await client.query('COMMIT');
    console.log(`Seeded ${seedDestinations.length} destinations.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closePool);

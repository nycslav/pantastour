import {
  generatedItinerarySchema,
  tripPreferencesSchema,
  type GeneratedItinerary,
  type ItineraryDay,
  type ItineraryStop,
} from '@saraya/contracts';
import type { PoolClient, QueryResultRow } from 'pg';

import { getPool } from '../../platform/database/pool';
import type { ItineraryRepository } from './itinerary.repository';

interface ItineraryRow extends QueryResultRow {
  id: string;
  destination_id: string;
  title: string;
  subtitle: string;
  preferences: unknown;
  generated_at: Date | string;
}

interface ItineraryDayRow extends QueryResultRow {
  day_number: number;
  title: string;
}

interface ItineraryStopRow extends QueryResultRow {
  day_number: number;
  id: string;
  time: string;
  title: string;
  detail: string;
  kind: ItineraryStop['kind'];
}

export class PostgresItineraryRepository implements ItineraryRepository {
  async save(itinerary: GeneratedItinerary): Promise<void> {
    const client = await getPool().connect();

    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO itineraries (
          id, destination_id, title, subtitle, preferences, generated_at
        ) VALUES ($1, $2, $3, $4, $5::jsonb, $6)
        ON CONFLICT (id) DO UPDATE SET
          destination_id = EXCLUDED.destination_id,
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          preferences = EXCLUDED.preferences,
          generated_at = EXCLUDED.generated_at,
          updated_at = now()`,
        [
          itinerary.id,
          itinerary.destinationId,
          itinerary.title,
          itinerary.subtitle,
          JSON.stringify(itinerary.preferences),
          itinerary.generatedAt,
        ],
      );
      await client.query('DELETE FROM itinerary_days WHERE itinerary_id = $1', [itinerary.id]);

      for (const day of itinerary.days) {
        await insertDay(client, itinerary.id, day);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<GeneratedItinerary | null> {
    const pool = getPool();
    const itineraryResult = await pool.query<ItineraryRow>(
      `SELECT id, destination_id, title, subtitle, preferences, generated_at
       FROM itineraries WHERE id = $1`,
      [id],
    );
    const itinerary = itineraryResult.rows[0];
    if (!itinerary) {
      return null;
    }

    const [daysResult, stopsResult] = await Promise.all([
      pool.query<ItineraryDayRow>(
        `SELECT day_number, title FROM itinerary_days
         WHERE itinerary_id = $1 ORDER BY day_number`,
        [id],
      ),
      pool.query<ItineraryStopRow>(
        `SELECT day_number, id, time, title, detail, kind FROM itinerary_stops
         WHERE itinerary_id = $1 ORDER BY day_number, id`,
        [id],
      ),
    ]);

    return generatedItinerarySchema.parse({
      id: itinerary.id,
      destinationId: itinerary.destination_id,
      title: itinerary.title,
      subtitle: itinerary.subtitle,
      preferences: tripPreferencesSchema.parse(itinerary.preferences),
      days: daysResult.rows.map((day) => ({
        dayNumber: day.day_number,
        title: day.title,
        stops: stopsResult.rows
          .filter((stop) => stop.day_number === day.day_number)
          .map(({ id: stopId, time, title, detail, kind }) => ({
            id: stopId,
            time,
            title,
            detail,
            kind,
          })),
      })),
      generatedAt: new Date(itinerary.generated_at).toISOString(),
    });
  }
}

async function insertDay(client: PoolClient, itineraryId: string, day: ItineraryDay) {
  await client.query(
    'INSERT INTO itinerary_days (itinerary_id, day_number, title) VALUES ($1, $2, $3)',
    [itineraryId, day.dayNumber, day.title],
  );

  for (const stop of day.stops) {
    await client.query(
      `INSERT INTO itinerary_stops (
        itinerary_id, day_number, id, time, title, detail, kind
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [itineraryId, day.dayNumber, stop.id, stop.time, stop.title, stop.detail, stop.kind],
    );
  }
}

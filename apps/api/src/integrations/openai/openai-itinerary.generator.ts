import type { DestinationDetail, TripPreferences } from '@saraya/contracts';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

import '../../platform/config/load-env';
import type { ItineraryGenerator } from '../../modules/itineraries/itinerary.generator';
import {
  itineraryPlanSchema,
  type ItineraryPlan,
} from '../../modules/itineraries/itinerary.plan';

export class OpenAiItineraryGenerator implements ItineraryGenerator {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = process.env.OPENAI_MODEL ?? 'gpt-5-mini';
  }

  async generate(
    preferences: TripPreferences,
    destination: DestinationDetail,
  ): Promise<ItineraryPlan> {
    const response = await this.client.responses.parse({
      model: this.model,
      instructions: [
        'You create practical, culturally respectful Philippine travel itineraries.',
        'Return exactly the requested number of sequential days, beginning with day 1.',
        'Use realistic daily pacing and include transport, activities, meals, and rest where useful.',
        'Never invent safety guarantees, schedules, prices, opening hours, or accessibility claims.',
        'Mention that travelers should verify time-sensitive arrangements in a stop detail when relevant.',
      ].join(' '),
      input: JSON.stringify({
        destination: {
          name: destination.name,
          province: destination.province,
          region: destination.region,
          summary: destination.summary,
          highlights: destination.highlights,
          culturalContext: destination.culturalGuide.historicalContext,
          etiquette: destination.culturalGuide.etiquette,
        },
        preferences,
      }),
      text: {
        format: zodTextFormat(itineraryPlanSchema, 'philippine_trip_itinerary'),
      },
    });

    if (response.status !== 'completed' || !response.output_parsed) {
      throw new Error(`OpenAI itinerary generation ended with status ${response.status}.`);
    }

    return itineraryPlanSchema.parse(response.output_parsed);
  }
}

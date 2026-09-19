import type { DestinationDetail, TripPreferences } from '@saraya/contracts';
import { z } from 'zod';

import '../../platform/config/load-env';
import type { ItineraryGenerator } from '../../modules/itineraries/itinerary.generator';
import {
  itineraryPlanSchema,
  type ItineraryPlan,
} from '../../modules/itineraries/itinerary.plan';

export class GeminiItineraryGenerator implements ItineraryGenerator {
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
  }

  async generate(
    preferences: TripPreferences,
    destination: DestinationDetail,
  ): Promise<ItineraryPlan> {
    const { GoogleGenAI } = await import('@google/genai');
    const client = new GoogleGenAI({ apiKey: this.apiKey });
    const response = await client.models.generateContent({
      model: this.model,
      contents: JSON.stringify({
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
      config: {
        systemInstruction: [
          'You create practical, culturally respectful Philippine travel itineraries.',
          'Return exactly the requested number of sequential days, beginning with day 1.',
          'Use realistic daily pacing and include transport, activities, meals, and rest where useful.',
          'Never invent safety guarantees, schedules, prices, opening hours, or accessibility claims.',
          'Mention that travelers should verify time-sensitive arrangements in a stop detail when relevant.',
        ].join(' '),
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(itineraryPlanSchema),
      },
    });

    if (!response.text) {
      throw new Error('Gemini itinerary generation returned no text.');
    }

    return itineraryPlanSchema.parse(JSON.parse(response.text));
  }
}

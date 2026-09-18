import type { DestinationDetail, TripPreferences } from '@saraya/contracts';

import { OpenAiItineraryGenerator } from '../../integrations/openai/openai-itinerary.generator';
import { itineraryPlanSchema, type ItineraryPlan } from './itinerary.plan';

export interface ItineraryGenerator {
  generate(preferences: TripPreferences, destination: DestinationDetail): Promise<ItineraryPlan>;
}

export class DeterministicItineraryGenerator implements ItineraryGenerator {
  async generate(
    preferences: TripPreferences,
    destination: DestinationDetail,
  ): Promise<ItineraryPlan> {
    const days = Array.from({ length: preferences.durationDays }, (_, dayIndex) => {
      const primary =
        destination.highlights[dayIndex % destination.highlights.length] ?? destination.name;
      const secondary =
        destination.highlights[(dayIndex + 1) % destination.highlights.length] ??
        'the local community';

      return {
        dayNumber: dayIndex + 1,
        title: dayIndex === 0 ? `Welcome to ${destination.name}` : `${primary} and local stories`,
        stops: [
          {
            time: '7:30 AM',
            title: `${preferences.startingPoint} departure`,
            detail: `${preferences.pace} pace with realistic transfer time.`,
            kind: 'transport' as const,
          },
          {
            time: '10:00 AM',
            title: primary,
            detail: `A community-aware visit shaped around ${preferences.interests.join(', ')}.`,
            kind: 'activity' as const,
          },
          {
            time: '1:00 PM',
            title: 'Local lunch',
            detail: `${preferences.budget} dining with time to ask about local specialties.`,
            kind: 'meal' as const,
          },
          {
            time: '5:30 PM',
            title: `${secondary} area stay`,
            detail: preferences.accessibilityNeeds || 'Rest and prepare for the following day.',
            kind: 'stay' as const,
          },
        ],
      };
    });

    return itineraryPlanSchema.parse({
      title: `${destination.name}: ${destination.tags.slice(0, 3).join(', ')}`,
      subtitle: `${preferences.durationDays} days | ${preferences.budget} | ${preferences.pace}`,
      days,
    });
  }
}

export function createItineraryGenerator(): ItineraryGenerator {
  if (
    process.env.NODE_ENV !== 'test' &&
    process.env.OPENAI_API_KEY &&
    process.env.ITINERARY_GENERATOR !== 'deterministic'
  ) {
    return new OpenAiItineraryGenerator();
  }

  return new DeterministicItineraryGenerator();
}

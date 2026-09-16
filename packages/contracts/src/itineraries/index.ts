import { z } from 'zod';

export const budgetSchema = z.enum(['Budget', 'Comfort', 'Premium']);
export const travelPaceSchema = z.enum(['Relaxed', 'Balanced', 'Full days']);

export const tripPreferencesSchema = z.object({
  destinationId: z.string().min(1),
  startingPoint: z.string().trim().min(2, 'Add a starting point.'),
  durationDays: z.number().int().min(1).max(30),
  budget: budgetSchema,
  interests: z.array(z.string()).min(1, 'Choose at least one interest.'),
  pace: travelPaceSchema,
  accessibilityNeeds: z.string().trim().max(300),
});

export const itineraryStopSchema = z.object({
  id: z.string().min(1),
  time: z.string().min(1),
  title: z.string().min(1),
  detail: z.string().min(1),
  kind: z.enum(['transport', 'activity', 'meal', 'stay']),
});

export const itineraryDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  title: z.string().min(1),
  stops: z.array(itineraryStopSchema).min(1),
});

export const generatedItinerarySchema = z.object({
  id: z.string().min(1),
  destinationId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  preferences: tripPreferencesSchema,
  days: z.array(itineraryDaySchema).min(1),
  generatedAt: z.string().datetime(),
});

export const itineraryStatusSchema = z.enum([
  'idle',
  'checking-access',
  'awaiting-premium',
  'generating',
  'ready',
  'error',
  'cancelled',
]);

export type Budget = z.infer<typeof budgetSchema>;
export type TravelPace = z.infer<typeof travelPaceSchema>;
export type TripPreferences = z.infer<typeof tripPreferencesSchema>;
export type ItineraryStop = z.infer<typeof itineraryStopSchema>;
export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type GeneratedItinerary = z.infer<typeof generatedItinerarySchema>;
export type ItineraryStatus = z.infer<typeof itineraryStatusSchema>;

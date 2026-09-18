import { z } from 'zod';

export const islandGroupSchema = z.enum(['Luzon', 'Visayas', 'Mindanao']);
export const destinationCategorySchema = z.enum([
  'Beach',
  'Culture',
  'Food',
  'Heritage',
  'Mountain',
  'Nature',
]);

export const destinationSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  province: z.string().min(1),
  region: z.string().min(1),
  islandGroup: islandGroupSchema,
  category: destinationCategorySchema,
  rating: z.number().min(0).max(5),
  summary: z.string().min(1),
  heroTone: z.enum(['sky', 'sunset', 'forest', 'lagoon', 'violet', 'gold']),
  tags: z.array(z.string().min(1)).min(1),
});

export const culturalGuideSchema = z.object({
  historicalContext: z.string().min(1),
  etiquette: z.array(z.string().min(1)).min(1),
  localPhrase: z.string().min(1),
});

export const destinationDetailSchema = destinationSummarySchema.extend({
  description: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1),
  bestFor: z.array(z.string().min(1)).min(1),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  culturalGuide: culturalGuideSchema,
});

export const discoveryQuerySchema = z.object({
  search: z.string().trim().default(''),
  islandGroup: islandGroupSchema.optional(),
  interest: z.string().trim().optional(),
});

export const nearbyDestinationQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(500).default(25),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const nearbyDestinationSummarySchema = destinationSummarySchema.extend({
  distanceKm: z.number().nonnegative(),
});

export type IslandGroup = z.infer<typeof islandGroupSchema>;
export type DestinationCategory = z.infer<typeof destinationCategorySchema>;
export type DestinationSummary = z.infer<typeof destinationSummarySchema>;
export type DestinationDetail = z.infer<typeof destinationDetailSchema>;
export type DiscoveryQuery = z.infer<typeof discoveryQuerySchema>;
export type NearbyDestinationQuery = z.infer<typeof nearbyDestinationQuerySchema>;
export type NearbyDestinationQueryInput = z.input<typeof nearbyDestinationQuerySchema>;
export type NearbyDestinationSummary = z.infer<typeof nearbyDestinationSummarySchema>;

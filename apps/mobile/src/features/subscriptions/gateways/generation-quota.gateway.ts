import type {
  GenerationConsumption,
  GenerationQuota,
  PremiumAccess,
} from '@saraya/contracts';

export interface GenerationQuotaGateway {
  getQuota(access: PremiumAccess): Promise<GenerationQuota>;
  consumeAfterSuccess(access: PremiumAccess): Promise<GenerationConsumption>;
  creditTopUp(
    access: PremiumAccess,
    transactionId: string,
  ): Promise<{ credited: boolean; quota: GenerationQuota }>;
}

export class GenerationQuotaExhaustedError extends Error {
  constructor() {
    super('No itinerary generation credits remain.');
    this.name = 'GenerationQuotaExhaustedError';
  }
}

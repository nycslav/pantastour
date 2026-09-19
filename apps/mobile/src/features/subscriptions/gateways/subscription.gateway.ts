export type PremiumEntitlement = 'inactive' | 'active' | 'expired';

export type SubscriptionPackage = {
  id: string;
  productId: string;
  title: string;
  description: string;
  price: string;
  period: string | null;
  recommended: boolean;
};

export interface SubscriptionGateway {
  getEntitlement(): Promise<PremiumEntitlement>;
  getPackages(): Promise<SubscriptionPackage[]>;
  purchase(packageId: string): Promise<PremiumEntitlement>;
  restore(): Promise<PremiumEntitlement>;
}

export class SubscriptionCancelledError extends Error {
  constructor() {
    super('Purchase cancelled.');
    this.name = 'SubscriptionCancelledError';
  }
}

export class SubscriptionConfigurationError extends Error {
  constructor(message = 'Subscriptions are not configured for this build.') {
    super(message);
    this.name = 'SubscriptionConfigurationError';
  }
}

import {
  SubscriptionCancelledError,
  type PremiumEntitlement,
  type SubscriptionGateway,
  type SubscriptionPackage,
} from './subscription.gateway';

export const mockSubscriptionPackages: SubscriptionPackage[] = [
  {
    id: '$rc_monthly',
    productId: 'saraya_premium_monthly',
    title: 'Monthly',
    description: 'Flexible Premium access, renewed monthly.',
    price: '₱149.00',
    period: 'P1M',
    recommended: false,
  },
  {
    id: '$rc_annual',
    productId: 'saraya_premium_annual',
    title: 'Annual',
    description: 'A full year of Premium travel planning.',
    price: '₱1,190.00',
    period: 'P1Y',
    recommended: true,
  },
];

type MockSubscriptionOptions = {
  entitlement?: PremiumEntitlement;
  packages?: SubscriptionPackage[];
  restorable?: boolean;
  cancelNextPurchase?: boolean;
};

export class MockSubscriptionGateway implements SubscriptionGateway {
  private entitlement: PremiumEntitlement;
  private readonly packages: SubscriptionPackage[];
  private readonly restorable: boolean;
  private cancelNextPurchase: boolean;

  constructor(options: MockSubscriptionOptions = {}) {
    this.entitlement = options.entitlement ?? 'inactive';
    this.packages = options.packages ?? mockSubscriptionPackages;
    this.restorable = options.restorable ?? false;
    this.cancelNextPurchase = options.cancelNextPurchase ?? false;
  }

  async getEntitlement() {
    return this.entitlement;
  }

  async getPackages() {
    return this.packages;
  }

  async purchase(packageId: string) {
    if (!this.packages.some((subscriptionPackage) => subscriptionPackage.id === packageId)) {
      throw new Error('The selected subscription package is unavailable.');
    }
    if (this.cancelNextPurchase) {
      this.cancelNextPurchase = false;
      throw new SubscriptionCancelledError();
    }
    this.entitlement = 'active';
    return this.entitlement;
  }

  async restore() {
    if (this.restorable) this.entitlement = 'active';
    return this.entitlement;
  }
}

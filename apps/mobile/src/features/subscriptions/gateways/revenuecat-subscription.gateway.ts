import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { ensureRevenueCatConfigured } from '../services/revenuecat';
import {
  SubscriptionCancelledError,
  type PremiumEntitlement,
  type SubscriptionGateway,
  type SubscriptionPackage,
} from './subscription.gateway';

const entitlementId = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? 'premium';

export function entitlementStatus(customerInfo: CustomerInfo): PremiumEntitlement {
  if (customerInfo.entitlements.active[entitlementId]) return 'active';
  if (customerInfo.entitlements.all[entitlementId]) return 'expired';
  return 'inactive';
}

function normalizePackage(subscriptionPackage: PurchasesPackage): SubscriptionPackage {
  const { product } = subscriptionPackage;
  return {
    id: subscriptionPackage.identifier,
    productId: product.identifier,
    title: product.title,
    description: product.description,
    price: product.priceString,
    period: product.subscriptionPeriod,
    recommended: subscriptionPackage.packageType === 'ANNUAL',
  };
}

function isCancellation(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      ('userCancelled' in error && error.userCancelled === true ||
        'code' in error && error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR),
  );
}

export class RevenueCatSubscriptionGateway implements SubscriptionGateway {
  private packages = new Map<string, PurchasesPackage>();

  async getEntitlement() {
    await ensureRevenueCatConfigured();
    return entitlementStatus(await Purchases.getCustomerInfo());
  }

  async getPackages() {
    await ensureRevenueCatConfigured();
    const offerings = await Purchases.getOfferings();
    const availablePackages = offerings.current?.availablePackages ?? [];
    this.packages = new Map(availablePackages.map((subscriptionPackage) => [subscriptionPackage.identifier, subscriptionPackage]));
    return availablePackages.map(normalizePackage);
  }

  async purchase(packageId: string) {
    await ensureRevenueCatConfigured();
    let subscriptionPackage = this.packages.get(packageId);
    if (!subscriptionPackage) {
      await this.getPackages();
      subscriptionPackage = this.packages.get(packageId);
    }
    if (!subscriptionPackage) throw new Error('The selected subscription package is unavailable.');

    try {
      const { customerInfo } = await Purchases.purchasePackage(subscriptionPackage);
      return entitlementStatus(customerInfo);
    } catch (error) {
      if (isCancellation(error)) throw new SubscriptionCancelledError();
      throw error;
    }
  }

  async restore() {
    await ensureRevenueCatConfigured();
    return entitlementStatus(await Purchases.restorePurchases());
  }
}

export const subscriptionGateway: SubscriptionGateway = new RevenueCatSubscriptionGateway();

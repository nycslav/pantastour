import Purchases, { LOG_LEVEL } from 'react-native-purchases';

import { SubscriptionConfigurationError } from '../gateways/subscription.gateway';

const appEnvironment = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
const apiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ??
  process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;

let initialization: Promise<void> | undefined;

async function configureRevenueCat() {
  if (!apiKey) {
    console.warn('RevenueCat API key is not configured.');
    return;
  }

  if (appEnvironment === 'production' && apiKey.startsWith('test_')) {
    console.warn('A RevenueCat Test Store key cannot be used in a production build.');
    return;
  }

  try {
    if (await Purchases.isConfigured()) return;

    if (__DEV__) {
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey });
  } catch {
    console.warn('RevenueCat could not be initialized.');
  }
}

export function initializeRevenueCat() {
  initialization ??= configureRevenueCat();
  return initialization;
}

export async function ensureRevenueCatConfigured() {
  await initializeRevenueCat();
  if (!(await Purchases.isConfigured())) throw new SubscriptionConfigurationError();
}

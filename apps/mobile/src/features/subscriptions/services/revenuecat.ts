import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;

let initialization: Promise<void> | undefined;

async function configureRevenueCat() {
  if (!apiKey) {
    console.warn('RevenueCat API key is not configured.');
    return;
  }

  try {
    if (await Purchases.isConfigured()) return;

    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
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

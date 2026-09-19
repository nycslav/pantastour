import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Crown, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, LoadingState, Mascot, Screen, StatusPanel } from '@/ui/components';
import { colors, radius, shadows, spacing, type } from '@/ui/theme';

import { SubscriptionCancelledError, type SubscriptionPackage } from '../gateways/subscription.gateway';
import { subscriptionGateway } from '../gateways/revenuecat-subscription.gateway';

type PaywallState = 'loading' | 'ready' | 'purchasing' | 'restoring' | 'success' | 'error';

async function loadPaywallData() {
  const [entitlement, availablePackages] = await Promise.all([
    subscriptionGateway.getEntitlement(),
    subscriptionGateway.getPackages(),
  ]);
  return { entitlement, availablePackages };
}

export function PaywallScreen() {
  const { destinationId = 'south-cebu' } = useLocalSearchParams<{ destinationId?: string }>();
  const router = useRouter();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>();
  const [state, setState] = useState<PaywallState>('loading');
  const [message, setMessage] = useState<string>();

  const selectedPackage = useMemo(
    () => packages.find((subscriptionPackage) => subscriptionPackage.id === selectedPackageId),
    [packages, selectedPackageId],
  );
  const busy = state === 'purchasing' || state === 'restoring';

  const continueToItinerary = useCallback(() => {
    router.replace({
      pathname: '/premium/itinerary',
      params: { destinationId, resumeAfterPurchase: 'true' },
    });
  }, [destinationId, router]);

  const applyPaywallData = useCallback(({
    entitlement,
    availablePackages,
  }: Awaited<ReturnType<typeof loadPaywallData>>) => {
    setMessage(undefined);
    setPackages(availablePackages);
    setSelectedPackageId(
      availablePackages.find((subscriptionPackage) => subscriptionPackage.recommended)?.id ??
        availablePackages[0]?.id,
    );
    if (entitlement === 'active') {
      setMessage('Premium is already active for this account.');
      setState('success');
    } else {
      setState('ready');
    }
  }, []);

  const handleLoadError = useCallback(() => {
    setMessage('Plans could not be loaded. Check your connection and RevenueCat configuration.');
    setState('error');
  }, []);

  useEffect(() => {
    let active = true;
    void loadPaywallData().then(
      (data) => { if (active) applyPaywallData(data); },
      () => { if (active) handleLoadError(); },
    );
    return () => { active = false; };
  }, [applyPaywallData, handleLoadError]);

  const reload = () => {
    setState('loading');
    setMessage(undefined);
    void loadPaywallData().then(applyPaywallData, handleLoadError);
  };

  const purchase = async () => {
    if (!selectedPackage) return;
    setState('purchasing');
    setMessage(undefined);
    try {
      const entitlement = await subscriptionGateway.purchase(selectedPackage.id);
      if (entitlement !== 'active') {
        setMessage('The purchase finished, but Premium is not active yet. Try restoring your purchase.');
        setState('error');
        return;
      }
      setMessage('Premium is active. Your saved trip choices are ready.');
      setState('success');
    } catch (error) {
      if (error instanceof SubscriptionCancelledError) {
        setMessage('Purchase cancelled. Your trip choices are still saved.');
        setState('ready');
      } else {
        setMessage('The purchase could not be completed. No charge was made.');
        setState('error');
      }
    }
  };

  const restore = async () => {
    setState('restoring');
    setMessage(undefined);
    try {
      const entitlement = await subscriptionGateway.restore();
      if (entitlement === 'active') {
        setMessage('Your previous purchase was restored and Premium is active.');
        setState('success');
      } else {
        setMessage('No active Premium purchase was found for this store account.');
        setState('ready');
      }
    } catch {
      setMessage('Purchases could not be restored. Check your connection and try again.');
      setState('error');
    }
  };

  if (state === 'loading') {
    return <Screen><LoadingState label="Loading Premium plans…" /></Screen>;
  }

  if (state === 'success') {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Mascot mood="star" size={156} />
        <View style={styles.successIcon}><Check color={colors.white} size={30} strokeWidth={3} /></View>
        <Text accessibilityRole="header" style={styles.title}>Welcome to Saraya Premium</Text>
        <Text style={styles.subtitle}>{message}</Text>
        <Button icon={Sparkles} label="Continue to my itinerary" onPress={continueToItinerary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable accessibilityLabel="Back to trip preferences" accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <ArrowLeft color={colors.navy} size={24} />
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <View style={styles.eyebrow}><Crown color={colors.yellow} size={18} /><Text style={styles.eyebrowText}>SARAYA PREMIUM</Text></View>
          <Text accessibilityRole="header" style={styles.title}>Make every trip easier to plan</Text>
          <Text style={styles.subtitle}>Unlock premium itinerary generation while keeping your saved trip preferences.</Text>
        </View>
        <Mascot mood="star" size={116} />
      </View>

      <View style={styles.benefits}>
        {['Premium itinerary generation', 'Plans shaped around your pace and budget', 'Restore access on your other devices'].map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <View style={styles.check}><Check color={colors.navy} size={15} strokeWidth={3} /></View>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {packages.length === 0 ? (
        <StatusPanel
          action={<Button icon={RefreshCw} label="Try again" onPress={reload} variant="secondary" />}
          message="RevenueCat returned no packages for the current offering. Add packages in the RevenueCat dashboard and retry."
          title="No plans available"
          tone="warning"
        />
      ) : (
        <View accessibilityRole="radiogroup" style={styles.planList}>
          {packages.map((subscriptionPackage) => {
            const selected = subscriptionPackage.id === selectedPackageId;
            return (
              <Pressable
                accessibilityLabel={`${subscriptionPackage.title}, ${subscriptionPackage.price}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={subscriptionPackage.id}
                onPress={() => setSelectedPackageId(subscriptionPackage.id)}
                style={[styles.plan, selected && styles.planSelected]}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
                <View style={styles.planCopy}>
                  <View style={styles.planTitleRow}>
                    <Text style={styles.planTitle}>{subscriptionPackage.title}</Text>
                    {subscriptionPackage.recommended ? <Text style={styles.recommended}>BEST VALUE</Text> : null}
                  </View>
                  <Text style={styles.planDescription}>{subscriptionPackage.description}</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.price}>{subscriptionPackage.price}</Text>
                  <Text style={styles.period}>{formatPeriod(subscriptionPackage.period)}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {message ? (
        <StatusPanel
          message={message}
          title={state === 'error' ? 'Premium could not be activated' : 'Purchase update'}
          tone={state === 'error' ? 'error' : 'warning'}
        />
      ) : null}

      <Button
        icon={ShieldCheck}
        label={selectedPackage ? `Continue with ${selectedPackage.title}` : 'Choose a Premium plan'}
        disabled={!selectedPackage || busy}
        loading={state === 'purchasing'}
        onPress={() => void purchase()}
      />
      <Button
        icon={RefreshCw}
        label="Restore purchases"
        disabled={busy}
        loading={state === 'restoring'}
        onPress={() => void restore()}
        variant="secondary"
      />
      {state === 'error' ? <Button label="Reload plans" onPress={reload} variant="quiet" /> : null}
      <Text style={styles.legal}>Payment is handled by the configured store. Subscriptions renew according to the selected store product until cancelled.</Text>
    </Screen>
  );
}

function formatPeriod(period: string | null) {
  if (period === 'P1W') return 'per week';
  if (period === 'P1M') return 'per month';
  if (period === 'P1Y') return 'per year';
  return period ? 'subscription' : 'one-time';
}

const styles = StyleSheet.create({
  centered: { minHeight: '100%', justifyContent: 'center', alignItems: 'center', paddingBottom: spacing.xxxl },
  back: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.violetSoft, borderRadius: radius.lg, padding: spacing.xl, overflow: 'hidden' },
  heroCopy: { flex: 1, gap: spacing.sm },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eyebrowText: { color: colors.violet, fontFamily: type.black, fontSize: 11, letterSpacing: 0.8 },
  title: { color: colors.navy, fontFamily: type.black, fontSize: 28, lineHeight: 34, textAlign: 'center' },
  subtitle: { color: colors.muted, fontFamily: type.medium, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  benefits: { gap: spacing.md },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSoft },
  benefitText: { flex: 1, color: colors.navy, fontFamily: type.bold, fontSize: 14 },
  planList: { gap: spacing.md },
  plan: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, ...shadows.card },
  planSelected: { borderColor: colors.blue, backgroundColor: colors.blueSoft },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.blue },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.blue },
  planCopy: { flex: 1, gap: 3 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  planTitle: { color: colors.navy, fontFamily: type.black, fontSize: 17 },
  planDescription: { color: colors.muted, fontFamily: type.medium, fontSize: 12, lineHeight: 17 },
  recommended: { color: colors.navy, backgroundColor: colors.yellow, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3, fontFamily: type.black, fontSize: 9 },
  priceBlock: { alignItems: 'flex-end', gap: 2 },
  price: { color: colors.navy, fontFamily: type.black, fontSize: 16 },
  period: { color: colors.muted, fontFamily: type.medium, fontSize: 10 },
  successIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green },
  legal: { color: colors.muted, fontFamily: type.medium, fontSize: 11, lineHeight: 16, textAlign: 'center' },
});

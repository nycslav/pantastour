import { MockSubscriptionGateway, mockSubscriptionPackages } from '../gateways/mock-subscription.gateway';
import { SubscriptionCancelledError } from '../gateways/subscription.gateway';

describe('subscription gateway contract', () => {
  it('returns inactive, active, and expired entitlement states', async () => {
    await expect(new MockSubscriptionGateway().getEntitlement()).resolves.toBe('inactive');
    await expect(new MockSubscriptionGateway({ entitlement: 'active' }).getEntitlement()).resolves.toBe('active');
    await expect(new MockSubscriptionGateway({ entitlement: 'expired' }).getEntitlement()).resolves.toBe('expired');
  });

  it('provides selectable monthly and annual packages', async () => {
    const packages = await new MockSubscriptionGateway().getPackages();
    expect(packages).toEqual(mockSubscriptionPackages);
    expect(packages.some((subscriptionPackage) => subscriptionPackage.recommended)).toBe(true);
  });

  it('activates premium after purchasing an available package', async () => {
    const gateway = new MockSubscriptionGateway();
    await expect(gateway.purchase('$rc_annual')).resolves.toBe('active');
    await expect(gateway.getEntitlement()).resolves.toBe('active');
  });

  it('distinguishes user cancellation from purchase failure', async () => {
    const gateway = new MockSubscriptionGateway({ cancelNextPurchase: true });
    await expect(gateway.purchase('$rc_monthly')).rejects.toBeInstanceOf(SubscriptionCancelledError);
    await expect(gateway.getEntitlement()).resolves.toBe('inactive');
  });

  it('rejects a package that is not part of the current offering', async () => {
    const gateway = new MockSubscriptionGateway();
    await expect(gateway.purchase('missing-package')).rejects.toThrow('unavailable');
  });

  it('restores only when the store account has a previous purchase', async () => {
    await expect(new MockSubscriptionGateway().restore()).resolves.toBe('inactive');
    await expect(new MockSubscriptionGateway({ restorable: true }).restore()).resolves.toBe('active');
  });
});

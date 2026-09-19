import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { SubscriptionCancelledError } from '../gateways/subscription.gateway';
import { mockSubscriptionPackages } from '../gateways/mock-subscription.gateway';
import { PaywallScreen } from '../screens/PaywallScreen';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockGetEntitlement = jest.fn();
const mockGetPackages = jest.fn();
const mockPurchase = jest.fn();
const mockRestore = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ destinationId: 'siargao' }),
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
}));

jest.mock('../gateways/revenuecat-subscription.gateway', () => ({
  subscriptionGateway: {
    getEntitlement: (...args: unknown[]) => mockGetEntitlement(...args),
    getPackages: (...args: unknown[]) => mockGetPackages(...args),
    purchase: (...args: unknown[]) => mockPurchase(...args),
    restore: (...args: unknown[]) => mockRestore(...args),
  },
}));

describe('Premium paywall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEntitlement.mockResolvedValue('inactive');
    mockGetPackages.mockResolvedValue(mockSubscriptionPackages);
    mockPurchase.mockResolvedValue('active');
    mockRestore.mockResolvedValue('inactive');
  });

  it('loads plans and selects the recommended package', async () => {
    await render(<PaywallScreen />);

    expect(await screen.findByRole('radio', { name: 'Annual, ₱1,190.00', checked: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Monthly, ₱149.00', checked: false })).toBeTruthy();
  });

  it('purchases the selected package and resumes the saved itinerary', async () => {
    await render(<PaywallScreen />);
    const purchaseButton = await screen.findByRole('button', { name: 'Continue with Annual' });
    await act(async () => { fireEvent.press(purchaseButton); });

    expect(await screen.findByRole('header', { name: 'Welcome to Saraya Premium' })).toBeTruthy();
    expect(mockPurchase).toHaveBeenCalledWith('$rc_annual');

    fireEvent.press(screen.getByRole('button', { name: 'Continue to my itinerary' }));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/premium/itinerary',
      params: { destinationId: 'siargao', resumeAfterPurchase: 'true' },
    });
  });

  it('treats cancellation as a recoverable purchase update', async () => {
    mockPurchase.mockRejectedValueOnce(new SubscriptionCancelledError());
    await render(<PaywallScreen />);
    const purchaseButton = await screen.findByRole('button', { name: 'Continue with Annual' });
    await act(async () => { fireEvent.press(purchaseButton); });

    expect(await screen.findByText('Purchase cancelled. Your trip choices are still saved.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue with Annual' })).toBeTruthy();
  });

  it('reports when restore finds no active entitlement', async () => {
    await render(<PaywallScreen />);
    const restoreButton = await screen.findByRole('button', { name: 'Restore purchases' });
    await act(async () => { fireEvent.press(restoreButton); });

    expect(await screen.findByText('No active Premium purchase was found for this store account.')).toBeTruthy();
  });

  it('shows a retry path when the current offering has no packages', async () => {
    mockGetPackages.mockResolvedValueOnce([]);
    await render(<PaywallScreen />);

    expect(await screen.findByText('No plans available')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('radio')).toBeNull());
  });
});

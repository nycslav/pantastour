import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button, Chip } from '../components';

describe('shared UI controls', () => {
  it('exposes button semantics and handles presses', async () => {
    const onPress = jest.fn();
    await render(<Button label="Generate my itinerary" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Generate my itinerary' });
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('announces chip selection state', async () => {
    await render(<Chip label="Mindanao" selected />);
    expect(screen.getByRole('button', { name: 'Mindanao', selected: true })).toBeTruthy();
  });
});

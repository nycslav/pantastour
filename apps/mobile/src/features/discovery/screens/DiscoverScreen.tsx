import type { DestinationSummary, IslandGroup } from '@saraya/contracts';
import { Map, Rows3 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Chip, LoadingState, Mascot, Screen, SearchField, SectionTitle, StatusPanel } from '@/ui/components';
import { colors, radius, spacing, type } from '@/ui/theme';

import { DestinationCard } from '../components/DestinationCard';
import { destinationGateway } from '../gateways';

const islandGroups: (IslandGroup | 'All')[] = ['All', 'Luzon', 'Visayas', 'Mindanao'];

export function DiscoverScreen() {
  const [search, setSearch] = useState('');
  const [islandGroup, setIslandGroup] = useState<IslandGroup | undefined>();
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDestinations(await destinationGateway.list({ search, islandGroup }));
    } catch {
      setError('Destinations could not be loaded. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [islandGroup, search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 180);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <Screen>
      <View style={styles.brandRow}>
        <View style={styles.brandCopy}>
          <Text style={styles.brand}>Saraya</Text>
          <Text style={styles.greeting}>Mabuhay, traveler!</Text>
          <Text style={styles.subtitle}>Find your next Philippine story.</Text>
        </View>
        <Mascot mood="wave" size={88} />
      </View>

      <SearchField
        onChangeText={setSearch}
        placeholder="Search places, food, culture…"
        value={search}
      />

      <View style={styles.chipRow}>
        {islandGroups.map((group) => (
          <Chip
            key={group}
            label={group}
            onPress={() => setIslandGroup(group === 'All' ? undefined : group)}
            selected={group === 'All' ? !islandGroup : islandGroup === group}
          />
        ))}
      </View>

      <StatusPanel
        message="Suggestions span Luzon, Visayas, and Mindanao—Cebu is just one possible adventure."
        title="Explore the whole Philippines"
      />

      <SectionTitle
        action={
          <View style={styles.modeToggle}>
            {(['list', 'map'] as const).map((mode) => {
              const Icon = mode === 'list' ? Rows3 : Map;
              return (
                <Pressable
                  accessibilityLabel={`${mode} view`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: viewMode === mode }}
                  key={mode}
                  onPress={() => setViewMode(mode)}
                  style={[styles.modeButton, viewMode === mode && styles.modeButtonActive]}
                >
                  <Icon color={viewMode === mode ? colors.navy : colors.muted} size={19} />
                </Pressable>
              );
            })}
          </View>
        }
        title="Discover destinations"
      />

      {loading ? <LoadingState label="Finding meaningful places…" /> : null}
      {error ? (
        <StatusPanel
          action={<Button label="Try again" onPress={() => void load()} variant="secondary" />}
          message={error}
          title="We hit a detour"
          tone="error"
        />
      ) : null}
      {!loading && !error && destinations.length === 0 ? (
        <StatusPanel
          message="Try another place, activity, or island group."
          title="No destinations found"
          tone="warning"
        />
      ) : null}

      {!loading && !error && viewMode === 'map' ? (
        <View style={styles.mapPanel}>
          <Text style={styles.mapTitle}>Philippines overview</Text>
          {islandGroups.slice(1).map((group) => {
            const count = destinations.filter((destination) => destination.islandGroup === group).length;
            return (
              <View key={group} style={styles.mapRegion}>
                <View style={styles.mapDot} />
                <View style={styles.mapLine}>
                  <Text style={styles.mapRegionName}>{group}</Text>
                  <Text style={styles.mapCount}>{count} places</Text>
                </View>
              </View>
            );
          })}
          <Text style={styles.mapNote}>Destination counts reflect the current results returned by the Saraya API.</Text>
        </View>
      ) : null}

      {!loading && !error && viewMode === 'list'
        ? destinations.map((destination) => (
            <DestinationCard destination={destination} key={destination.id} />
          ))
        : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { minHeight: 104, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandCopy: { flex: 1, gap: 2 },
  brand: { color: colors.blue, fontFamily: type.black, fontSize: 28 },
  greeting: { color: colors.navy, fontFamily: type.black, fontSize: 20 },
  subtitle: { color: colors.muted, fontFamily: type.medium, fontSize: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  modeToggle: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  modeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  modeButtonActive: { backgroundColor: colors.blueSoft },
  mapPanel: { backgroundColor: colors.blueSoft, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg, minHeight: 310 },
  mapTitle: { color: colors.navy, fontFamily: type.black, fontSize: 18 },
  mapRegion: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mapDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.coral, borderWidth: 4, borderColor: colors.white },
  mapLine: { flex: 1, minHeight: 52, borderBottomWidth: 1, borderBottomColor: colors.border, justifyContent: 'center' },
  mapRegionName: { color: colors.navy, fontFamily: type.black, fontSize: 16 },
  mapCount: { color: colors.muted, fontFamily: type.medium, fontSize: 13 },
  mapNote: { color: colors.muted, fontFamily: type.medium, fontSize: 12, lineHeight: 18 },
});

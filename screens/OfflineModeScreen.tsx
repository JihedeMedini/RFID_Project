import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { MovementService, MovementLog, TagService, MOCK_ITEMS } from '../services';

type OfflineModeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OfflineMode'>;
};

const OfflineModeScreen = ({ navigation }: OfflineModeScreenProps) => {
  const [offlineMovements, setOfflineMovements] = useState<MovementLog[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    loadOfflineQueue();
    
    // Simulate network status check
    const timer = setTimeout(() => {
      setNetworkStatus('online');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const loadOfflineQueue = async () => {
    setLoading(true);
    try {
      const queue = await MovementService.getOfflineQueue();
      setOfflineMovements(queue);
    } catch (error) {
      console.error('Error loading offline queue', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (offlineMovements.length === 0) {
      Alert.alert('Info', 'No offline movements to sync.');
      return;
    }
    
    setSyncing(true);
    
    try {
      const result = await MovementService.syncOfflineMovements();
      
      if (result.success) {
        // Show success message
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 2000);
        
        // Reload the queue
        await loadOfflineQueue();
        
        // Show notification
        Alert.alert('Success', `${result.syncedCount} movements synced successfully.`);
      } else {
        Alert.alert('Error', 'Failed to sync movements. Please try again.');
      }
    } catch (error) {
      console.error('Error syncing movements', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setSyncing(false);
    }
  };

  const getZoneColor = (zone: string): string => {
    switch (zone) {
      case 'ENTRY': return '#10b981'; // green
      case 'EXIT': return '#ef4444'; // red
      case 'WAREHOUSE': return '#3b82f6'; // blue
      case 'SHIPPING': return '#8b5cf6'; // purple
      case 'RECEIVING': return '#f59e0b'; // amber
      case 'QUALITY_CHECK': return '#6366f1'; // indigo
      default: return '#6b7280'; // gray
    }
  };

  const renderItem = ({ item }: { item: MovementLog }) => (
    <View style={styles.movementItem}>
      <View style={styles.movementHeader}>
        <View style={styles.tagContainer}>
          <Image 
            source={{ uri: 'https://img.icons8.com/ios-filled/100/1f2937/tag-window.png' }}
            style={styles.tagIcon}
          />
          <Text style={styles.tagId}>{item.tagId}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.synced ? '#22c55e' : '#f97316' }
        ]}>
          <Text style={styles.statusText}>{item.synced ? 'Synced' : 'Pending'}</Text>
        </View>
      </View>
      
      <View style={styles.movementDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Zone:</Text>
            <View style={[styles.zoneBadge, { backgroundColor: getZoneColor(item.zone) }]}>
              <Text style={styles.zoneText}>{item.zone.replace(/_/g, ' ')}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{item.movementType}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Offline Mode</Text>
          <Text style={styles.headerSubtitle}>Manage and sync offline data</Text>
        </View>
        
        <View style={styles.networkStatusCard}>
          <View style={styles.networkStatusContainer}>
            <View style={[
              styles.networkIndicator, 
              { backgroundColor: networkStatus === 'online' ? '#22c55e' : '#f97316' }
            ]} />
            <Text style={styles.networkStatusText}>
              {networkStatus === 'online' ? 'Online - Ready to sync' : 'Offline - No connection'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.syncButton,
              (syncing || syncSuccess || offlineMovements.length === 0 || networkStatus === 'offline') && styles.syncButtonDisabled
            ]}
            onPress={handleSync}
            disabled={syncing || syncSuccess || offlineMovements.length === 0 || networkStatus === 'offline'}
          >
            {syncing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : syncSuccess ? (
              <View style={styles.syncSuccessContent}>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/checkmark--v1.png' }}
                  style={styles.syncSuccessIcon}
                />
                <Text style={styles.syncButtonText}>Synced</Text>
              </View>
            ) : (
              <View style={styles.syncButtonContent}>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/sync--v1.png' }}
                  style={styles.syncIcon}
                />
                <Text style={styles.syncButtonText}>Sync Now</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/cloud-offline.png' }}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Offline Movements</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{offlineMovements.length}</Text>
            </View>
          </View>
          
          <View style={styles.cardBody}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#f59e0b" size="large" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : offlineMovements.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/9ca3af/cloud-checked--v1.png' }}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No offline movements found</Text>
                <Text style={styles.emptySubtext}>
                  Movements recorded in offline mode will appear here
                </Text>
              </View>
            ) : (
              <FlatList
                data={offlineMovements}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/0c4a6e/info--v1.png' }}
              style={styles.infoIcon}
            />
            <Text style={styles.infoTitle}>About Offline Mode</Text>
          </View>
          <Text style={styles.infoText}>
            When working without internet connectivity, movements are stored locally on your device. 
            Use the 'Sync Now' button when connectivity is restored to send pending movements to the server.
          </Text>
          <View style={styles.infoSteps}>
            <View style={styles.infoStep}>
              <View style={styles.infoStepNumber}>
                <Text style={styles.infoStepNumberText}>1</Text>
              </View>
              <Text style={styles.infoStepText}>Record movements with "Offline Mode" enabled</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.infoStepNumber}>
                <Text style={styles.infoStepNumberText}>2</Text>
              </View>
              <Text style={styles.infoStepText}>Return to an area with network connectivity</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.infoStepNumber}>
                <Text style={styles.infoStepNumberText}>3</Text>
              </View>
              <Text style={styles.infoStepText}>Tap "Sync Now" to upload all pending movements</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  networkStatusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  networkStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  syncButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#fcd34d',
    opacity: 0.7,
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIcon: {
    width: 16,
    height: 16,
    tintColor: 'white',
    marginRight: 6,
  },
  syncButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  syncSuccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncSuccessIcon: {
    width: 16,
    height: 16,
    tintColor: 'white',
    marginRight: 6,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#f59e0b',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
    marginRight: 10,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    tintColor: '#9ca3af',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 8,
  },
  movementItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  tagId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  movementDetails: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  zoneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  zoneText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
  },
  infoText: {
    fontSize: 14,
    color: '#0e7490',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoSteps: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#bfdbfe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoStepNumberText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoStepText: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
  },
});

export default OfflineModeScreen; 
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { MovementService, TagService, Zone, MovementType, MOCK_ITEMS } from '../services';

type TagScannerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TagScanner'>;
};

const TagScannerScreen = ({ navigation }: TagScannerScreenProps) => {
  const [tagId, setTagId] = useState('');
  const [selectedZone, setSelectedZone] = useState<Zone>(Zone.ENTRY);
  const [selectedType, setSelectedType] = useState<MovementType>(MovementType.IN);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [recentScans, setRecentScans] = useState<Array<{tagId: string; timestamp: string}>>([]);
  const [scanAnimation, setScanAnimation] = useState(false);

  useEffect(() => {
    // Load recent scans from local storage
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      const movements = await MovementService.getAllMovements();
      const recent = movements
        .slice(0, 5)
        .map(m => ({ tagId: m.tagId, timestamp: m.timestamp }));
      setRecentScans(recent);
    } catch (error) {
      console.error('Error loading recent scans', error);
    }
  };

  const handleSimulateScan = () => {
    // Animate the scan button
    setScanAnimation(true);
    setTimeout(() => setScanAnimation(false), 500);
    
    // Generate a random tag ID to simulate scanning
    const randomTag = `TAG${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    setTagId(randomTag);
  };

  const handleScanSubmit = async () => {
    if (!tagId.trim()) {
      Alert.alert('Error', 'Please enter a tag ID or scan a tag.');
      return;
    }

    setLoading(true);
    
    try {
      // Check if the tag is assigned to an item
      const isAssigned = await TagService.isTagAssigned(tagId);
      
      if (!isAssigned) {
        Alert.alert(
          'Warning',
          'This tag is not assigned to any item. Do you want to proceed?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
            { text: 'Continue', style: 'destructive', onPress: () => processMovement() }
          ]
        );
      } else {
        await processMovement();
      }
    } catch (error) {
      console.error('Error processing scan', error);
      Alert.alert('Error', 'Failed to process the scan. Please try again.');
      setLoading(false);
    }
  };

  const processMovement = async () => {
    try {
      // Log the movement
      await MovementService.logMovement(tagId, selectedZone, selectedType, offlineMode);
      
      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Clear form
      setTagId('');
      
      // Refresh recent scans
      loadRecentScans();
    } catch (error) {
      Alert.alert('Error', 'Failed to process the movement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getItemName = async (tagId: string): Promise<string> => {
    try {
      const item = await TagService.getItemByTagId(tagId, MOCK_ITEMS);
      return item ? item.name : 'Unknown Item';
    } catch (error) {
      return 'Unknown Item';
    }
  };

  const getZoneColor = (zone: Zone): string => {
    switch (zone) {
      case Zone.ENTRY: return '#10b981'; // green
      case Zone.EXIT: return '#ef4444'; // red
      case Zone.WAREHOUSE: return '#3b82f6'; // blue
      case Zone.SHIPPING: return '#8b5cf6'; // purple
      case Zone.RECEIVING: return '#f59e0b'; // amber
      case Zone.QUALITY_CHECK: return '#6366f1'; // indigo
      default: return '#6b7280'; // gray
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tag Scanner</Text>
          <Text style={styles.headerSubtitle}>Scan and record tag movements</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/qr-code--v1.png' }}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Scan Tag</Text>
          </View>
          
          <View style={styles.cardBody}>
            <Text style={styles.inputLabel}>Tag ID</Text>
            <View style={styles.scanInputContainer}>
              <TextInput
                style={styles.input}
                value={tagId}
                onChangeText={setTagId}
                placeholder="Enter tag ID or scan"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                style={[styles.scanButton, scanAnimation && styles.scanButtonActive]}
                onPress={handleSimulateScan}
              >
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/qr-code--v1.png' }}
                  style={styles.scanButtonIcon}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Zone</Text>
            <View style={styles.optionsContainer}>
              {Object.values(Zone).map((zone) => (
                <TouchableOpacity
                  key={zone}
                  style={[
                    styles.optionButton,
                    selectedZone === zone && [styles.optionButtonSelected, { backgroundColor: getZoneColor(zone) }]
                  ]}
                  onPress={() => setSelectedZone(zone)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedZone === zone && styles.optionTextSelected
                    ]}
                  >
                    {zone.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Movement Type</Text>
            <View style={styles.movementTypeContainer}>
              {Object.values(MovementType).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.movementTypeButton,
                    selectedType === type && styles.movementTypeButtonSelected
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.movementTypeText,
                      selectedType === type && styles.movementTypeTextSelected
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.offlineSwitchContainer}>
              <TouchableOpacity
                style={[
                  styles.offlineSwitch,
                  offlineMode && styles.offlineSwitchActive
                ]}
                onPress={() => setOfflineMode(!offlineMode)}
              >
                <View style={[styles.switchTrack, offlineMode && styles.switchTrackActive]}>
                  <View style={[styles.switchThumb, offlineMode && styles.switchThumbActive]} />
                </View>
                <Text
                  style={[
                    styles.offlineSwitchText,
                    offlineMode && styles.offlineSwitchTextActive
                  ]}
                >
                  Offline Mode {offlineMode ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                success && styles.submitButtonSuccess,
                !tagId.trim() && styles.submitButtonDisabled
              ]}
              onPress={handleScanSubmit}
              disabled={loading || success || !tagId.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : success ? (
                <View style={styles.successContent}>
                  <Image 
                    source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/checkmark--v1.png' }}
                    style={styles.successIcon}
                  />
                  <Text style={styles.submitButtonText}>Success</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Record Movement</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/time-machine--v1.png' }}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Recent Scans</Text>
          </View>
          
          <View style={styles.cardBody}>
            {recentScans.length === 0 ? (
              <View style={styles.emptyState}>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/9ca3af/search--v1.png' }}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No recent scans</Text>
                <Text style={styles.emptySubtext}>Scan a tag to record movements</Text>
              </View>
            ) : (
              recentScans.map((scan, index) => (
                <View key={index} style={styles.recentScanItem}>
                  <View style={styles.recentScanIcon}>
                    <Image 
                      source={{ uri: 'https://img.icons8.com/ios-filled/100/3b82f6/tag-window.png' }}
                      style={styles.tagIcon}
                    />
                  </View>
                  <View style={styles.recentScanContent}>
                    <Text style={styles.recentScanText}>
                      {scan.tagId}
                    </Text>
                    <Text style={styles.recentScanTime}>
                      {new Date(scan.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
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
    backgroundColor: '#3b82f6',
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
  },
  cardBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4b5563',
  },
  scanInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    color: '#1f2937',
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  scanButtonActive: {
    backgroundColor: '#1d4ed8',
    transform: [{ scale: 0.95 }],
  },
  scanButtonIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  optionText: {
    color: '#4b5563',
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  movementTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  movementTypeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  movementTypeButtonSelected: {
    backgroundColor: '#3b82f6',
  },
  movementTypeText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  movementTypeTextSelected: {
    color: 'white',
  },
  offlineSwitchContainer: {
    marginVertical: 16,
  },
  offlineSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchTrack: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
    padding: 2,
  },
  switchTrackActive: {
    backgroundColor: '#10b981',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  switchThumbActive: {
    transform: [{ translateX: 26 }],
  },
  offlineSwitchActive: {
    borderColor: '#10b981',
  },
  offlineSwitchText: {
    color: '#4b5563',
    fontWeight: '500',
    marginLeft: 10,
  },
  offlineSwitchTextActive: {
    color: '#10b981',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonSuccess: {
    backgroundColor: '#10b981',
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  recentScanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recentScanIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tagIcon: {
    width: 20,
    height: 20,
  },
  recentScanContent: {
    flex: 1,
  },
  recentScanText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  recentScanTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default TagScannerScreen; 
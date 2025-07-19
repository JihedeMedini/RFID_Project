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
  Image,
  FlatList
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { TagService, MOCK_ITEMS, Item, TagAssignment } from '../services';

type AssignTagScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AssignTag'>;
};

const AssignTagScreen = ({ navigation }: AssignTagScreenProps) => {
  const [tagId, setTagId] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [assignments, setAssignments] = useState<TagAssignment[]>([]);
  const [scanAnimation, setScanAnimation] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await TagService.getAllAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments', error);
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

  const handleAssign = async () => {
    if (!tagId.trim()) {
      Alert.alert('Error', 'Please enter a tag ID or scan a tag.');
      return;
    }

    if (!selectedItem) {
      Alert.alert('Error', 'Please select an item.');
      return;
    }

    setLoading(true);
    
    try {
      // Check if tag is already assigned
      const isAssigned = await TagService.isTagAssigned(tagId);
      
      if (isAssigned) {
        Alert.alert('Error', 'This tag is already assigned to an item.');
        setLoading(false);
        return;
      }

      // Assign tag to item
      await TagService.assignTag(tagId, selectedItem.id);
      
      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Clear form
      setTagId('');
      setSelectedItem(null);
      
      // Refresh assignments
      loadAssignments();
    } catch (error) {
      console.error('Error assigning tag', error);
      Alert.alert('Error', 'Failed to assign tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[
        styles.itemOption,
        selectedItem?.id === item.id && styles.itemOptionSelected
      ]}
      onPress={() => setSelectedItem(item)}
    >
      <View style={styles.itemIconContainer}>
        <Image 
          source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/box--v1.png' }}
          style={[
            styles.itemIcon,
            selectedItem?.id !== item.id && { tintColor: '#3b82f6' }
          ]}
        />
      </View>
      <View style={styles.itemContent}>
        <Text 
          style={[
            styles.itemName,
            selectedItem?.id === item.id && styles.itemNameSelected
          ]}
        >
          {item.name}
        </Text>
        <Text 
          style={[
            styles.itemSku,
            selectedItem?.id === item.id && styles.itemSkuSelected
          ]}
        >
          {item.sku}
        </Text>
        {item.description && (
          <Text 
            style={[
              styles.itemDescription,
              selectedItem?.id === item.id && styles.itemDescriptionSelected
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
      </View>
      <View style={styles.itemCheckbox}>
        {selectedItem?.id === item.id && (
          <View style={styles.itemCheckboxInner}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/checkmark--v1.png' }}
              style={styles.checkIcon}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assign Tag</Text>
          <Text style={styles.headerSubtitle}>Link RFID tags to inventory items</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/tag-window.png' }}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Tag Information</Text>
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
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/box--v1.png' }}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Select Item</Text>
          </View>
          
          <View style={styles.cardBody}>
            <Text style={styles.inputLabel}>Available Items</Text>
            <View style={styles.itemsContainer}>
              <FlatList
                data={MOCK_ITEMS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                extraData={selectedItem}
                scrollEnabled={false}
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                success && styles.submitButtonSuccess,
                (!tagId.trim() || !selectedItem) && styles.submitButtonDisabled
              ]}
              onPress={handleAssign}
              disabled={loading || success || !tagId.trim() || !selectedItem}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : success ? (
                <View style={styles.successContent}>
                  <Image 
                    source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/checkmark--v1.png' }}
                    style={styles.successIcon}
                  />
                  <Text style={styles.submitButtonText}>Assigned Successfully</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Assign Tag</Text>
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
            <Text style={styles.cardTitle}>Recent Assignments</Text>
          </View>
          
          <View style={styles.cardBody}>
            {assignments.length === 0 ? (
              <View style={styles.emptyState}>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/9ca3af/search--v1.png' }}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No assignments yet</Text>
                <Text style={styles.emptySubtext}>Assigned tags will appear here</Text>
              </View>
            ) : (
              assignments.slice(0, 5).map((assignment, index) => {
                const item = MOCK_ITEMS.find(i => i.id === assignment.itemId);
                return (
                  <View key={index} style={styles.assignmentItem}>
                    <View style={styles.assignmentIcon}>
                      <Image 
                        source={{ uri: 'https://img.icons8.com/ios-filled/100/10b981/tag-window.png' }}
                        style={styles.tagIcon}
                      />
                    </View>
                    <View style={styles.assignmentContent}>
                      <Text style={styles.assignmentTag}>
                        {assignment.tagId}
                      </Text>
                      <Text style={styles.assignmentItemName}>
                        {item ? item.name : 'Unknown'} {item ? `(${item.sku})` : ''}
                      </Text>
                      <Text style={styles.assignmentTime}>
                        {new Date(assignment.assignedAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })
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
    backgroundColor: '#10b981',
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
    backgroundColor: '#10b981',
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  scanButtonActive: {
    backgroundColor: '#059669',
    transform: [{ scale: 0.95 }],
  },
  scanButtonIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemOptionSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemNameSelected: {
    color: 'white',
  },
  itemSku: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
  itemSkuSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  itemDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  itemDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  itemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCheckboxInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 12,
    height: 12,
    tintColor: '#10b981',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonSuccess: {
    backgroundColor: '#059669',
  },
  submitButtonDisabled: {
    backgroundColor: '#86efac',
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
  assignmentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  assignmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tagIcon: {
    width: 20,
    height: 20,
  },
  assignmentContent: {
    flex: 1,
  },
  assignmentTag: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  assignmentItemName: {
    fontSize: 14,
    color: '#4b5563',
  },
  assignmentTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default AssignTagScreen; 
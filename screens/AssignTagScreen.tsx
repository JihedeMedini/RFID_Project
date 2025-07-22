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
  FlatList,
  Modal
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { 
  TagService, 
  MOCK_ITEMS, 
  Item, 
  TagAssignment, 
  Zone, 
  findItemByOracleId,
  findItemBySku
} from '../services';

type AssignTagScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AssignTag'>;
  route: RouteProp<RootStackParamList, 'AssignTag'>;
};

const AssignTagScreen = ({ navigation, route }: AssignTagScreenProps) => {
  const [tagId, setTagId] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [assignments, setAssignments] = useState<TagAssignment[]>([]);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [isTagValid, setIsTagValid] = useState(true);
  const [tagError, setTagError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(MOCK_ITEMS);
  const [selectedHomeZone, setSelectedHomeZone] = useState<Zone | null>(null);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchType, setSearchType] = useState<'oracle' | 'sku'>('oracle');

  useEffect(() => {
    loadAssignments();
    
    // If itemId is provided via route params, preselect that item
    if (route.params?.itemId) {
      const item = MOCK_ITEMS.find(item => item.id === route.params?.itemId);
      if (item) {
        setSelectedItem(item);
        setSelectedHomeZone(item.homeZone || null);
      }
    }
  }, [route.params]);

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
    validateTag(randomTag);
  };
  
  const validateTag = async (tag: string) => {
    if (!tag.trim()) {
      setIsTagValid(false);
      setTagError('Tag ID cannot be empty');
      return false;
    }
    
    setValidating(true);
    
    try {
      // Check if tag is already assigned
      const isAssigned = await TagService.isTagAssigned(tag);
      
      if (isAssigned) {
        setIsTagValid(false);
        setTagError('This tag is already assigned to another item');
        setValidating(false);
        return false;
      } else {
        setIsTagValid(true);
        setTagError('');
        setValidating(false);
        return true;
      }
    } catch (error) {
      console.error('Error validating tag', error);
      setIsTagValid(false);
      setTagError('Error validating tag');
      setValidating(false);
      return false;
    }
  };

  const handleTagChange = (text: string) => {
    setTagId(text);
    if (text.trim()) {
      validateTag(text);
    } else {
      setIsTagValid(true);
      setTagError('');
    }
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

    if (!isTagValid || validating) {
      Alert.alert('Error', tagError || 'Please wait for tag validation to complete.');
      return;
    }

    setLoading(true);
    
    try {
      // Final validation before assigning
      const isValidTag = await validateTag(tagId);
      
      if (!isValidTag) {
        Alert.alert('Error', tagError || 'This tag cannot be assigned.');
        setLoading(false);
        return;
      }

      // Update item's home zone if selected
      const updatedItem = {
        ...selectedItem,
        homeZone: selectedHomeZone || selectedItem.homeZone
      };

      // Assign tag to item
      await TagService.assignTag(tagId, updatedItem.id);
      
      // Show success message
      setSuccess(true);
      
      // Store the assigned tag ID to allow printing
      const assignedTagId = tagId;
      const assignedItemId = updatedItem.id;
      
      setTimeout(() => {
        setSuccess(false);
        
        // Ask if the user wants to print the tag
        Alert.alert(
          'Tag Assigned Successfully',
          'Do you want to print this tag?',
          [
            {
              text: 'No, Skip',
              style: 'cancel',
              onPress: () => {
                // Clear form
                setTagId('');
                setSelectedItem(null);
                setSelectedHomeZone(null);
                
                // Navigate back to lookup screen if we came from there
                if (route.params?.itemId) {
                  navigation.goBack();
                }
              }
            },
            {
              text: 'Yes, Print',
              onPress: () => {
                // Navigate to print screen
                navigation.navigate('PrintTag', {
                  tagId: assignedTagId,
                  itemId: assignedItemId
                });
      
      // Clear form
      setTagId('');
      setSelectedItem(null);
                setSelectedHomeZone(null);
              }
            }
          ]
        );
      }, 2000);
      
      // Refresh assignments
      loadAssignments();
    } catch (error) {
      console.error('Error assigning tag', error);
      Alert.alert('Error', 'Failed to assign tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(MOCK_ITEMS);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = MOCK_ITEMS.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.sku.toLowerCase().includes(query)
    );
    
    setFilteredItems(filtered);
  };

  const handleOracleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    let item: Item | undefined;
    
    // Search based on selected type
    if (searchType === 'oracle') {
      item = findItemByOracleId(searchQuery);
    } else {
      item = findItemBySku(searchQuery);
    }
    
    if (item) {
      setSelectedItem(item);
      setSelectedHomeZone(item.homeZone || null);
      setIsSearchModalVisible(false);
    } else {
      Alert.alert(
        'Not Found', 
        `No item found for ${searchType === 'oracle' ? 'Oracle ID' : 'SKU'}: ${searchQuery}`
      );
    }
  };

  const handleBarcodeSimulation = () => {
    // Simulate scanning a barcode for an item (Oracle ID or SKU)
    const mockOracleIds = ['ORC-10045782', 'ORC-10038921', 'ORC-10029873'];
    const mockSKUs = ['IPH15-128', 'MBP14-1TB', 'APP-2'];
    
    const mockValues = searchType === 'oracle' ? mockOracleIds : mockSKUs;
    const randomValue = mockValues[Math.floor(Math.random() * mockValues.length)];
    
    setSearchQuery(randomValue);
    
    // Auto-search after "scan"
    setTimeout(() => {
      handleOracleSearch();
    }, 500);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[
        styles.itemOption,
        selectedItem?.id === item.id && styles.itemOptionSelected
      ]}
      onPress={() => {
        setSelectedItem(item);
        setSelectedHomeZone(item.homeZone || null);
      }}
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
        <View style={styles.itemDetailsRow}>
        <Text 
          style={[
            styles.itemSku,
            selectedItem?.id === item.id && styles.itemSkuSelected
          ]}
        >
          {item.sku}
        </Text>
          <Text 
            style={[
              styles.itemOracleId,
              selectedItem?.id === item.id && styles.itemOracleIdSelected
            ]}
          >
            {item.oracleId}
          </Text>
        </View>
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
      <View style={[
        styles.itemCheckbox,
        selectedItem?.id === item.id && styles.itemCheckboxSelected
      ]}>
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
                style={[
                  styles.input,
                  !isTagValid && styles.inputError
                ]}
                value={tagId}
                onChangeText={handleTagChange}
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
            {!isTagValid && tagError ? (
              <Text style={styles.errorText}>{tagError}</Text>
            ) : validating ? (
              <View style={styles.validatingContainer}>
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text style={styles.validatingText}>Validating tag...</Text>
              </View>
            ) : isTagValid && tagId ? (
              <View style={styles.validContainer}>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/10b981/checkmark--v1.png' }}
                  style={styles.validIcon}
                />
                <Text style={styles.validText}>Valid tag</Text>
              </View>
            ) : null}
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
            <View style={styles.itemSearchContainer}>
              <TextInput
                style={styles.itemSearchInput}
                value={searchQuery}
                onChangeText={text => {
                  setSearchQuery(text);
                  handleSearch();
                }}
                placeholder="Search items by name or SKU..."
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                style={styles.searchOracleButton}
                onPress={() => setIsSearchModalVisible(true)}
              >
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/search--v1.png' }}
                  style={styles.searchIcon}
                />
                <Text style={styles.searchOracleText}>Oracle</Text>
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <View style={styles.selectedItemBanner}>
                <Text style={styles.selectedItemText}>Selected: {selectedItem.name}</Text>
              </View>
            )}
            
            <Text style={styles.inputLabel}>Available Items</Text>
            <View style={styles.itemsContainer}>
              <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                extraData={selectedItem}
                scrollEnabled={false}
              />
            </View>
          </View>
        </View>

        {selectedItem && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/map-marker--v1.png' }}
                style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>Home Zone</Text>
            </View>
            
            <View style={styles.cardBody}>
              <Text style={styles.inputLabel}>Select Home Zone for Item</Text>
              <View style={styles.zonesContainer}>
                {Object.values(Zone).map((zone) => (
                  <TouchableOpacity
                    key={zone}
                    style={[
                      styles.zoneButton,
                      selectedHomeZone === zone && styles.zoneButtonSelected
                    ]}
                    onPress={() => setSelectedHomeZone(zone)}
                  >
                    <Text
                      style={[
                        styles.zoneButtonText,
                        selectedHomeZone === zone && styles.zoneButtonTextSelected
                      ]}
                    >
                      {zone.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                success && styles.submitButtonSuccess,
                  (!tagId.trim() || !selectedItem || !isTagValid || validating) && styles.submitButtonDisabled
              ]}
              onPress={handleAssign}
                disabled={loading || success || !tagId.trim() || !selectedItem || !isTagValid || validating}
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
        )}
        
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

      {/* Oracle/SKU Search Modal */}
      <Modal
        visible={isSearchModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search by Oracle ID or SKU</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsSearchModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.searchTypeButton,
                  searchType === 'oracle' && styles.searchTypeSelected
                ]}
                onPress={() => setSearchType('oracle')}
              >
                <Text
                  style={[
                    styles.searchTypeText,
                    searchType === 'oracle' && styles.searchTypeTextSelected
                  ]}
                >
                  Oracle ID
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.searchTypeButton,
                  searchType === 'sku' && styles.searchTypeSelected
                ]}
                onPress={() => setSearchType('sku')}
              >
                <Text
                  style={[
                    styles.searchTypeText,
                    searchType === 'sku' && styles.searchTypeTextSelected
                  ]}
                >
                  SKU
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <TextInput
                style={styles.modalSearchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={`Enter ${searchType === 'oracle' ? 'Oracle ID' : 'SKU'}`}
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.modalScanButton}
                onPress={handleBarcodeSimulation}
              >
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/barcode-scanner.png' }}
                  style={styles.modalScanIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalSearchButton}
              onPress={handleOracleSearch}
            >
              <Text style={styles.modalSearchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
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
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  validatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  validatingText: {
    fontSize: 12,
    color: '#3b82f6',
    marginLeft: 4,
  },
  validContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  validIcon: {
    width: 14,
    height: 14,
    tintColor: '#10b981',
  },
  validText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 4,
  },
  itemSearchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemSearchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    color: '#1f2937',
    fontSize: 14,
  },
  searchOracleButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchIcon: {
    width: 14,
    height: 14,
    tintColor: 'white',
    marginRight: 4,
  },
  searchOracleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedItemBanner: {
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  selectedItemText: {
    color: '#0e7490',
    fontWeight: '500',
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
  itemDetailsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  itemSku: {
    fontSize: 14,
    color: '#4b5563',
    marginRight: 8,
  },
  itemSkuSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  itemOracleId: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemOracleIdSelected: {
    color: 'rgba(255, 255, 255, 0.7)',
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
  itemCheckboxSelected: {
    borderColor: 'white',
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
  zonesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  zoneButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  zoneButtonSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  zoneButtonText: {
    fontSize: 14,
    color: '#4b5563',
  },
  zoneButtonTextSelected: {
    color: 'white',
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  searchTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  searchTypeSelected: {
    backgroundColor: '#6366f1',
  },
  searchTypeText: {
    fontWeight: '500',
    color: '#4b5563',
  },
  searchTypeTextSelected: {
    color: 'white',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalSearchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    color: '#1f2937',
    fontSize: 16,
  },
  modalScanButton: {
    backgroundColor: '#6366f1',
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  modalScanIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  modalSearchButton: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSearchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default AssignTagScreen; 
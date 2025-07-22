import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  FlatList
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { 
  findItemByOracleId, 
  findItemBySku, 
  MOCK_ITEMS, 
  TagService, 
  Item, 
  Zone 
} from '../services';

type ItemLookupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ItemLookup'>;
};

// Function to get color for zone badge
const getZoneColor = (zone?: Zone): string => {
  if (!zone) return '#6b7280'; // Gray default
  
  switch (zone) {
    case Zone.ENTRY: return '#10b981'; // Green
    case Zone.EXIT: return '#ef4444'; // Red
    case Zone.WAREHOUSE: return '#3b82f6'; // Blue
    case Zone.SHIPPING: return '#8b5cf6'; // Purple
    case Zone.RECEIVING: return '#f59e0b'; // Amber
    case Zone.QUALITY_CHECK: return '#6366f1'; // Indigo
    default: return '#6b7280'; // Gray
  }
};

const ItemLookupScreen = ({ navigation }: ItemLookupScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'oracle' | 'sku'>('oracle');
  const [loading, setLoading] = useState(false);
  const [foundItem, setFoundItem] = useState<Item | null>(null);
  const [tagAssignment, setTagAssignment] = useState<{tagId: string, assignedAt: string} | null>(null);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>(MOCK_ITEMS);
  const [filteredItems, setFilteredItems] = useState<Item[]>(MOCK_ITEMS);
  const [tagAssignments, setTagAssignments] = useState<{[key: string]: {tagId: string, assignedAt: string}}>({});
  
  useEffect(() => {
    // Load all items and their tag assignments
    loadItemsWithTags();
  }, []);

  const loadItemsWithTags = async () => {
    setLoading(true);
    try {
      const assignments = await TagService.getAllAssignments();
      
      // Create a map of itemId -> tagAssignment
      const assignmentsMap: {[key: string]: {tagId: string, assignedAt: string}} = {};
      
      // For each assignment, add it to the map
      for (const assignment of assignments) {
        assignmentsMap[assignment.itemId] = {
          tagId: assignment.tagId,
          assignedAt: assignment.assignedAt
        };
      }
      
      setTagAssignments(assignmentsMap);
      setAllItems(MOCK_ITEMS);
      setFilteredItems(MOCK_ITEMS);
    } catch (error) {
      console.error('Error loading items with tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset to show all items if search is cleared
      setFilteredItems(allItems);
      setFoundItem(null);
      return;
    }

    setLoading(true);
    try {
      if (searchType === 'oracle' || searchType === 'sku') {
        // Exact search by Oracle ID or SKU
        let item: Item | undefined;
        
        if (searchType === 'oracle') {
          item = findItemByOracleId(searchQuery);
        } else {
          item = findItemBySku(searchQuery);
        }
        
        if (item) {
          setFoundItem(item);
          setFilteredItems([item]);
          
          // Add to recent items
          updateRecentItems(item);
        } else {
          setFoundItem(null);
          // Search in names and descriptions as fallback
          filterItems(searchQuery);
          Alert.alert('Not Found', `No exact match for ${searchType === 'oracle' ? 'Oracle ID' : 'SKU'}: ${searchQuery}`);
        }
      } else {
        // General search
        filterItems(searchQuery);
      }
    } catch (error) {
      console.error('Error searching for item:', error);
      Alert.alert('Error', 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    const filtered = allItems.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) || 
      item.sku.toLowerCase().includes(lowercaseQuery) ||
      (item.oracleId && item.oracleId.toLowerCase().includes(lowercaseQuery)) ||
      (item.description && item.description.toLowerCase().includes(lowercaseQuery))
    );
    setFilteredItems(filtered);
  };

  const updateRecentItems = (item: Item) => {
    setRecentItems(prev => {
      // Remove item if it's already in the list
      const filtered = prev.filter(i => i.id !== item.id);
      // Add it to the beginning
      return [item, ...filtered].slice(0, 5); // Keep only 5 recent items
    });
  };

  const handleAssignTag = (itemId: string) => {
    navigation.navigate('AssignTag', { itemId });
  };

  // Format the date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleBarcodeScan = () => {
    // Simulate scanning a barcode
    const mockScans = ['ORC-10045782', 'ORC-10038921', 'ORC-10029873'];
    const randomScan = mockScans[Math.floor(Math.random() * mockScans.length)];
    
    setSearchType('oracle');
    setSearchQuery(randomScan);
    
    // Auto-search after scan
    setTimeout(() => {
      handleSearch();
    }, 500);
  };

  const renderItem = ({ item }: { item: Item }) => {
    const tagInfo = tagAssignments[item.id];
    
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View 
            style={[
              styles.categoryBadge, 
              { backgroundColor: '#e2e8f0' }
            ]}
          >
            <Text style={styles.categoryText}>{item.category || 'Uncategorized'}</Text>
          </View>
        </View>

        <View style={styles.itemInfoRow}>
          <Text style={styles.infoLabel}>Oracle ID:</Text>
          <Text style={styles.infoValue}>{item.oracleId || 'N/A'}</Text>
        </View>

        <View style={styles.itemInfoRow}>
          <Text style={styles.infoLabel}>SKU:</Text>
          <Text style={styles.infoValue}>{item.sku}</Text>
        </View>

        <View style={styles.itemInfoRow}>
          <Text style={styles.infoLabel}>Home Zone:</Text>
          <View 
            style={[
              styles.zoneBadge, 
              { backgroundColor: getZoneColor(item.homeZone) }
            ]}
          >
            <Text style={styles.zoneText}>
              {item.homeZone?.replace(/_/g, ' ') || 'Not Assigned'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.tagSection}>
          <Text style={styles.sectionTitle}>RFID Tag Assignment</Text>
          
          {tagInfo ? (
            <>
              <View style={styles.tagInfoContainer}>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/3b82f6/tag-window.png' }}
                  style={styles.tagIcon}
                />
                <View style={styles.tagInfo}>
                  <Text style={styles.tagId}>{tagInfo.tagId}</Text>
                  <Text style={styles.tagAssignDate}>
                    Assigned: {formatDate(tagInfo.assignedAt)}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.reassignButton]}
                onPress={() => handleAssignTag(item.id)}
              >
                <Text style={styles.actionButtonText}>Reassign Tag</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.noTagContainer}>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/9ca3af/tag-window.png' }}
                  style={styles.noTagIcon}
                />
                <Text style={styles.noTagText}>No RFID tag assigned</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.assignButton]}
                onPress={() => handleAssignTag(item.id)}
              >
                <Text style={styles.actionButtonText}>Assign Tag</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Item Lookup</Text>
        <Text style={styles.headerSubtitle}>Search by Oracle ID or SKU</Text>
      </View>

      <View style={styles.searchCard}>
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

        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text === '') {
                setFilteredItems(allItems);
                setFoundItem(null);
              }
            }}
            placeholder={`Enter ${searchType === 'oracle' ? 'Oracle ID' : 'SKU'}...`}
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.barcodeButton}
            onPress={handleBarcodeScan}
          >
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/barcode-scanner.png' }}
              style={styles.barcodeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading items...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/9ca3af/search--v1.png' }}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  searchCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchTypeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
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
    backgroundColor: '#3b82f6',
  },
  searchTypeText: {
    fontWeight: '500',
    color: '#4b5563',
  },
  searchTypeTextSelected: {
    color: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    color: '#1f2937',
    fontSize: 16,
  },
  barcodeButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  barcodeIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4b5563',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  itemInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  zoneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoneText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  tagSection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  tagInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tagIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  tagInfo: {
    flex: 1,
  },
  tagId: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e40af',
  },
  tagAssignDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  noTagContainer: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  noTagIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  noTagText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButton: {
    backgroundColor: '#10b981',
  },
  reassignButton: {
    backgroundColor: '#f59e0b',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  recentItemDetails: {
    flexDirection: 'row',
  },
  recentItemId: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8,
  },
  recentItemSku: {
    fontSize: 12,
    color: '#6b7280',
  },
  recentItemArrow: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
});

export default ItemLookupScreen; 
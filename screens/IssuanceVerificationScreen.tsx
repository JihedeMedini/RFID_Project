import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import {
  OrderService,
  TagService,
  Order,
  OrderLine,
  VerificationResult,
  VerificationStatus
} from '../services';

type IssuanceVerificationScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'IssuanceVerification'>;
};

const IssuanceVerificationScreen = ({ navigation }: IssuanceVerificationScreenProps) => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [tagId, setTagId] = useState('');
  const [scanAnimation, setScanAnimation] = useState(false);
  const [scannedResults, setScannedResults] = useState<VerificationResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [verificationSummary, setVerificationSummary] = useState({
    totalItems: 0,
    verifiedItems: 0,
    progress: 0,
    isComplete: false
  });
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    // Update progress bar animation when summary changes
    if (selectedOrder) {
      Animated.timing(progressAnim, {
        toValue: verificationSummary.progress,
        duration: 500,
        useNativeDriver: false
      }).start();
    }
  }, [verificationSummary]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await OrderService.getAllOrders();
      setOrders(allOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
    }
  };

  const handleSelectOrder = async (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalVisible(false);
    
    // Reset scanned results when selecting a new order
    setScannedResults([]);
    
    // Load verification summary
    await updateVerificationSummary(order.id);
  };

  const updateVerificationSummary = async (orderId: string) => {
    try {
      const summary = await OrderService.getVerificationSummary(orderId);
      setVerificationSummary(summary);
    } catch (error) {
      console.error('Error updating verification summary:', error);
    }
  };

  const handleSimulateScan = () => {
    // Animate the scan button
    setScanAnimation(true);
    setTimeout(() => setScanAnimation(false), 500);
    
    // If no order is selected, show error
    if (!selectedOrder) {
      Alert.alert('Error', 'Please select an order first.');
      return;
    }
    
    // Generate a random tag from the mock database (in a real app, this would be a scanner)
    // For testing purposes, sometimes generate valid tags, sometimes invalid
    const randomType = Math.random();
    
    let generatedTag = '';
    
    if (randomType < 0.7) {
      // Generate valid tag ID that would match an order line
      // Find an item that is on the order
      const orderLines = selectedOrder.lines;
      if (orderLines.length > 0) {
        const randomLineIndex = Math.floor(Math.random() * orderLines.length);
        const randomLine = orderLines[randomLineIndex];
        
        // Generate a tag ID format similar to our mock data
        generatedTag = `TAG${randomLine.itemId}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      }
    } else {
      // Generate random invalid tag
      generatedTag = `TAG${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    }
    
    setTagId(generatedTag);
  };

  const handleVerifyTag = async () => {
    if (!tagId.trim()) {
      Alert.alert('Error', 'Please enter a tag ID or scan a tag.');
      return;
    }
    
    if (!selectedOrder) {
      Alert.alert('Error', 'Please select an order first.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Verify the tag against the order
      const result = await OrderService.verifyTag(selectedOrder.id, tagId, TagService);
      
      // Add to scanned results
      setScannedResults(prev => [result, ...prev]);
      
      // Clear tag input
      setTagId('');
      
      // Update verification summary
      await updateVerificationSummary(selectedOrder.id);
      
      // Refresh the selected order to get latest line data
      const refreshedOrder = await OrderService.getOrderById(selectedOrder.id);
      if (refreshedOrder) {
        setSelectedOrder(refreshedOrder);
      }
    } catch (error) {
      console.error('Error verifying tag:', error);
      Alert.alert('Error', 'Failed to verify tag. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!selectedOrder) {
      return;
    }
    
    // Show confirmation dialog based on status
    if (verificationSummary.verifiedItems < verificationSummary.totalItems) {
      Alert.alert(
        'Incomplete Verification',
        `Only ${verificationSummary.verifiedItems} of ${verificationSummary.totalItems} items have been verified. Are you sure you want to submit?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Submit Anyway',
            style: 'destructive',
            onPress: () => submitVerification()
          }
        ]
      );
    } else {
      Alert.alert(
        'Complete Verification',
        'All items have been verified. Submit verification?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Submit',
            onPress: () => submitVerification()
          }
        ]
      );
    }
  };

  const submitVerification = async () => {
    if (!selectedOrder) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await OrderService.submitVerification(selectedOrder.id);
      
      if (success) {
        // Show success message
        setSummaryVisible(true);
        
        // After showing summary, reset the screen
        setTimeout(() => {
          setSummaryVisible(false);
          resetVerification();
        }, 3000);
      } else {
        Alert.alert('Error', 'Failed to submit verification. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      Alert.alert('Error', 'An error occurred while submitting verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetVerification = async () => {
    if (!selectedOrder) {
      return;
    }
    
    setLoading(true);
    
    try {
      await OrderService.resetVerification(selectedOrder.id);
      
      // Refresh orders and selected order
      const allOrders = await OrderService.getAllOrders();
      setOrders(allOrders);
      
      const refreshedOrder = await OrderService.getOrderById(selectedOrder.id);
      if (refreshedOrder) {
        setSelectedOrder(refreshedOrder);
      }
      
      // Clear scanned results
      setScannedResults([]);
      
      // Update verification summary
      await updateVerificationSummary(selectedOrder.id);
    } catch (error) {
      console.error('Error resetting verification:', error);
      Alert.alert('Error', 'Failed to reset verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return {
          icon: 'https://img.icons8.com/ios-filled/100/10b981/checkmark--v1.png',
          color: '#10b981' // green
        };
      case 'invalid':
        return {
          icon: 'https://img.icons8.com/ios-filled/100/ef4444/multiply--v1.png',
          color: '#ef4444' // red
        };
      case 'warning':
        return {
          icon: 'https://img.icons8.com/ios-filled/100/f59e0b/warning-shield--v1.png',
          color: '#f59e0b' // amber
        };
      case 'duplicate':
        return {
          icon: 'https://img.icons8.com/ios-filled/100/6366f1/copy--v1.png',
          color: '#6366f1' // indigo
        };
      default:
        return {
          icon: 'https://img.icons8.com/ios-filled/100/64748b/info--v1.png',
          color: '#64748b' // gray
        };
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <TouchableOpacity
        style={styles.orderItem}
        onPress={() => handleSelectOrder(item)}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>{item.oracleOrderId}</Text>
          <View style={[
            styles.orderStatusBadge,
            { backgroundColor: item.verificationStatus === VerificationStatus.COMPLETE ? '#10b981' : '#3b82f6' }
          ]}>
            <Text style={styles.orderStatusText}>
              {item.verificationStatus === VerificationStatus.COMPLETE ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <Text style={styles.orderType}>{item.type}</Text>
          <Text style={styles.orderDestination}>
            {item.destination && `To: ${item.destination}`}
            {item.source && ` From: ${item.source}`}
          </Text>
        </View>
        
        <View style={styles.orderSummary}>
          <Text style={styles.orderItems}>
            {item.lines.reduce((sum, line) => sum + line.quantity, 0)} items
          </Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderLine = ({ item }: { item: OrderLine }) => {
    const verified = item.verifiedQuantity;
    const total = item.quantity;
    const progress = (verified / total) * 100;
    const isComplete = verified >= total;
    
    return (
      <View style={styles.orderLineItem}>
        <View style={styles.orderLineHeader}>
          <Text style={styles.orderLineName}>{item.name}</Text>
          <Text style={styles.orderLineCount}>
            {verified}/{total}
          </Text>
        </View>
        
        <View style={styles.orderLineSku}>
          <Text style={styles.orderLineSkuText}>SKU: {item.sku}</Text>
          {item.oracleId && (
            <Text style={styles.orderLineOracleId}>Oracle ID: {item.oracleId}</Text>
          )}
        </View>
        
        <View style={styles.orderLineProgress}>
          <View style={styles.orderLineProgressBg}>
            <View 
              style={[
                styles.orderLineProgressFill,
                { width: `${progress}%`, backgroundColor: isComplete ? '#10b981' : '#3b82f6' }
              ]}
            />
          </View>
          <Text style={styles.orderLineProgressText}>
            {isComplete ? 'Complete' : `${Math.round(progress)}%`}
          </Text>
        </View>
      </View>
    );
  };

  const renderScanResult = ({ item }: { item: VerificationResult }) => {
    const status = getStatusIcon(item.status);
    
    return (
      <View style={[styles.scanResultItem, { borderLeftColor: status.color }]}>
        <View style={styles.scanResultIcon}>
          <Image 
            source={{ uri: status.icon }}
            style={[styles.scanResultIconImage, { tintColor: status.color }]}
          />
        </View>
        
        <View style={styles.scanResultContent}>
          <Text style={styles.scanResultTag}>Tag ID: {item.tagId}</Text>
          <Text style={styles.scanResultMessage}>{item.message}</Text>
          {item.orderLine && (
            <View style={styles.scanResultOrderLine}>
              <Text style={styles.scanResultOrderLineText}>
                {item.orderLine.verifiedQuantity} of {item.orderLine.quantity} verified
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Issuance Verification</Text>
        <Text style={styles.headerSubtitle}>Verify items against Oracle orders</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/purchase-order--v1.png' }}
              style={styles.cardHeaderIcon}
            />
            <Text style={styles.cardHeaderTitle}>Select Oracle Order</Text>
          </View>
          
          <View style={styles.cardBody}>
            {selectedOrder ? (
              <View style={styles.selectedOrderContainer}>
                <View style={styles.selectedOrderHeader}>
                  <View>
                    <Text style={styles.selectedOrderNumber}>{selectedOrder.oracleOrderId}</Text>
                    <Text style={styles.selectedOrderType}>{selectedOrder.type}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.changeOrderButton}
                    onPress={() => setIsOrderModalVisible(true)}
                  >
                    <Text style={styles.changeOrderText}>Change</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {verificationSummary.verifiedItems} of {verificationSummary.totalItems} items verified
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(verificationSummary.progress * 100)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                          }),
                          backgroundColor: verificationSummary.isComplete ? '#10b981' : '#3b82f6'
                        }
                      ]}
                    />
                  </View>
                </View>
                
                <View style={styles.orderLinesContainer}>
                  <Text style={styles.orderLinesSectionTitle}>Order Items</Text>
                  {selectedOrder.lines.map(line => (
                    <View key={line.id}>
                      {renderOrderLine({ item: line })}
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectOrderButton}
                onPress={() => setIsOrderModalVisible(true)}
              >
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/3b82f6/purchase-order--v1.png' }}
                  style={styles.selectOrderIcon}
                />
                <Text style={styles.selectOrderText}>Select an Oracle Order</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {selectedOrder && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/tag-window.png' }}
                style={styles.cardHeaderIcon}
              />
              <Text style={styles.cardHeaderTitle}>Scan RFID Tag</Text>
            </View>
            
            <View style={styles.cardBody}>
              <View style={styles.scanContainer}>
                <TextInput
                  style={styles.scanInput}
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
              
              <TouchableOpacity
                style={[styles.verifyButton, !tagId.trim() && styles.verifyButtonDisabled]}
                onPress={handleVerifyTag}
                disabled={loading || !tagId.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify Tag</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedOrder && scannedResults.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image 
                source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/verified-account--v1.png' }}
                style={styles.cardHeaderIcon}
              />
              <Text style={styles.cardHeaderTitle}>Verification Results</Text>
            </View>
            
            <View style={styles.cardBody}>
              <FlatList
                data={scannedResults}
                renderItem={renderScanResult}
                keyExtractor={(item, index) => `${item.tagId}-${index}`}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}

        {selectedOrder && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                Alert.alert(
                  'Reset Verification',
                  'Are you sure you want to reset this verification? All progress will be lost.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reset', style: 'destructive', onPress: resetVerification }
                  ]
                );
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                verificationSummary.verifiedItems === 0 && styles.submitButtonDisabled
              ]}
              disabled={isSubmitting || verificationSummary.verifiedItems === 0}
              onPress={handleSubmitVerification}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Verification</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Order Selection Modal */}
      <Modal
        visible={isOrderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOrderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select an Order</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsOrderModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.orderList}
            />
          </View>
        </View>
      </Modal>

      {/* Verification Summary Modal */}
      <Modal
        visible={summaryVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.summaryModalOverlay}>
          <View style={styles.summaryModalContainer}>
            {verificationSummary.verifiedItems >= verificationSummary.totalItems ? (
              <>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/10b981/checkmark-circle--v1.png' }}
                  style={[styles.summaryIcon, { tintColor: '#10b981' }]}
                />
                <Text style={styles.summaryTitle}>Verification Complete</Text>
                <Text style={styles.summaryText}>
                  All {verificationSummary.totalItems} items successfully verified.
                </Text>
              </>
            ) : (
              <>
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/f59e0b/warning-shield--v1.png' }}
                  style={[styles.summaryIcon, { tintColor: '#f59e0b' }]}
                />
                <Text style={styles.summaryTitle}>Verification Incomplete</Text>
                <Text style={styles.summaryText}>
                  {verificationSummary.verifiedItems} of {verificationSummary.totalItems} items verified.
                </Text>
              </>
            )}
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
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
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
  cardHeaderIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
    marginRight: 10,
  },
  cardHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  selectOrderButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectOrderIcon: {
    width: 40,
    height: 40,
    marginBottom: 12,
  },
  selectOrderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
  },
  selectedOrderContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedOrderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  selectedOrderType: {
    fontSize: 14,
    color: '#64748b',
  },
  changeOrderButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeOrderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#4b5563',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  orderLinesContainer: {
    marginTop: 8,
  },
  orderLinesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  orderLineItem: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  orderLineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderLineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  orderLineCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  orderLineSku: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderLineSkuText: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 16,
  },
  orderLineOracleId: {
    fontSize: 14,
    color: '#64748b',
  },
  orderLineProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderLineProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  orderLineProgressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  orderLineProgressText: {
    fontSize: 12,
    color: '#6b7280',
    width: 60,
    textAlign: 'right',
  },
  scanContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  scanInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
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
  verifyButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scanResultItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  scanResultIcon: {
    marginRight: 12,
  },
  scanResultIconImage: {
    width: 24,
    height: 24,
  },
  scanResultContent: {
    flex: 1,
  },
  scanResultTag: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  scanResultMessage: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
  },
  scanResultOrderLine: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  scanResultOrderLineText: {
    fontSize: 12,
    color: '#4b5563',
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  resetButtonText: {
    color: '#4b5563',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#6ee7b7',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 30,
    textAlign: 'center',
  },
  orderList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 32,
  },
  orderItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  orderStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  orderStatusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  orderDetails: {
    marginBottom: 8,
  },
  orderType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
  },
  orderDestination: {
    fontSize: 14,
    color: '#64748b',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    fontSize: 14,
    color: '#4b5563',
  },
  orderDate: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  summaryIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
});

export default IssuanceVerificationScreen; 
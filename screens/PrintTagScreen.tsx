import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import {
  PrinterService,
  TagService,
  MOCK_ITEMS,
  Item,
  LabelTemplate,
  PrinterDevice,
  PrinterStatus,
  PrinterConnectionType,
  LABEL_TEMPLATES
} from '../services';

type PrintTagScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PrintTag'>;
  route: RouteProp<RootStackParamList, 'PrintTag'>;
};

const PrintTagScreen = ({ navigation, route }: PrintTagScreenProps) => {
  const { tagId, itemId } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(null);
  const [currentPrinter, setCurrentPrinter] = useState<PrinterDevice | null>(null);
  const [availablePrinters, setAvailablePrinters] = useState<PrinterDevice[]>([]);
  const [isPrinterModalVisible, setIsPrinterModalVisible] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [connectingPrinter, setConnectingPrinter] = useState<string | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // Get item data
      const foundItem = MOCK_ITEMS.find(i => i.id === itemId);
      if (foundItem) {
        setItem(foundItem);
      }
      
      // Get default template
      const defaultTemplate = PrinterService.getDefaultTemplate();
      setSelectedTemplate(defaultTemplate);
      
      // Get current printer
      const printer = await PrinterService.getCurrentPrinter();
      setCurrentPrinter(printer);
      
      // Get available printers
      const printers = await PrinterService.getAvailablePrinters();
      setAvailablePrinters(printers);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTemplateSelect = (template: LabelTemplate) => {
    setSelectedTemplate(template);
  };
  
  const handleConnectPrinter = async (printerId: string) => {
    setConnectingPrinter(printerId);
    
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Connect to printer
      const success = await PrinterService.connectToPrinter(printerId);
      
      if (success) {
        // Get updated printer
        const printer = await PrinterService.getCurrentPrinter();
        setCurrentPrinter(printer);
        
        // Update available printers
        const printers = await PrinterService.getAvailablePrinters();
        setAvailablePrinters(printers);
        
        setIsPrinterModalVisible(false);
      } else {
        Alert.alert('Connection Failed', 'Failed to connect to the printer. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting to printer:', error);
      Alert.alert('Error', 'An error occurred while connecting to the printer.');
    } finally {
      setConnectingPrinter(null);
    }
  };
  
  const handlePrint = async () => {
    if (!item || !selectedTemplate || !currentPrinter) {
      Alert.alert('Error', 'Missing required information for printing.');
      return;
    }
    
    if (currentPrinter.status !== PrinterStatus.CONNECTED) {
      Alert.alert('Printer Not Connected', 'Please connect to a printer first.');
      return;
    }
    
    setIsPrinting(true);
    
    try {
      // Simulate printing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Print tag
      const printJob = await PrinterService.printTag(tagId, itemId, selectedTemplate.id);
      
      if (printJob) {
        setPrintSuccess(true);
        setTimeout(() => {
          setPrintSuccess(false);
        }, 3000);
      } else {
        Alert.alert('Print Failed', 'Failed to print the tag. Please check printer connection and try again.');
      }
    } catch (error) {
      console.error('Error printing tag:', error);
      Alert.alert('Error', 'An error occurred while printing the tag.');
    } finally {
      setIsPrinting(false);
    }
  };
  
  const getConnectionTypeIcon = (type: PrinterConnectionType) => {
    switch (type) {
      case PrinterConnectionType.BLUETOOTH:
        return 'https://img.icons8.com/ios-filled/100/3b82f6/bluetooth--v1.png';
      case PrinterConnectionType.WIFI:
        return 'https://img.icons8.com/ios-filled/100/3b82f6/wifi--v1.png';
      case PrinterConnectionType.USB:
        return 'https://img.icons8.com/ios-filled/100/3b82f6/usb-off--v1.png';
      default:
        return 'https://img.icons8.com/ios-filled/100/3b82f6/print--v1.png';
    }
  };
  
  const getStatusColor = (status: PrinterStatus) => {
    switch (status) {
      case PrinterStatus.CONNECTED:
        return '#10b981';
      case PrinterStatus.DISCONNECTED:
        return '#6b7280';
      case PrinterStatus.ERROR:
        return '#ef4444';
      case PrinterStatus.OUT_OF_PAPER:
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };
  
  const renderPrinterItem = ({ item }: { item: PrinterDevice }) => {
    const isConnecting = connectingPrinter === item.id;
    const isConnected = item.status === PrinterStatus.CONNECTED;
    
    return (
      <TouchableOpacity
        style={[
          styles.printerItem,
          isConnected && styles.printerItemConnected
        ]}
        onPress={() => handleConnectPrinter(item.id)}
        disabled={isConnecting || isConnected}
      >
        <Image
          source={{ uri: getConnectionTypeIcon(item.type) }}
          style={styles.printerIcon}
        />
        
        <View style={styles.printerInfo}>
          <Text style={styles.printerName}>{item.name}</Text>
          <Text style={styles.printerAddress}>{item.address}</Text>
        </View>
        
        <View style={styles.printerStatus}>
          {isConnecting ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(item.status) }
                ]}
              />
              <Text style={styles.statusText}>
                {isConnected ? 'Connected' : 'Tap to connect'}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderTemplateItem = ({ item }: { item: LabelTemplate }) => {
    const isSelected = selectedTemplate?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.templateItem,
          isSelected && styles.templateItemSelected
        ]}
        onPress={() => handleTemplateSelect(item)}
      >
        <Image
          source={{ uri: item.previewImage }}
          style={styles.templatePreview}
          resizeMode="contain"
        />
        <Text style={[
          styles.templateName,
          isSelected && styles.templateNameSelected
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.templateDesc,
          isSelected && styles.templateDescSelected
        ]}>
          {item.width}mm × {item.height}mm
        </Text>
      </TouchableOpacity>
    );
  };
  
  if (loading || !item) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Print Tag</Text>
        <Text style={styles.headerSubtitle}>Print RFID tag for your items</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/print--v1.png' }}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Print Preview</Text>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.previewContainer}>
              {selectedTemplate ? (
                <Image
                  source={{ uri: selectedTemplate.previewImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.noTemplateContainer}>
                  <Text style={styles.noTemplateText}>No template selected</Text>
                </View>
              )}
            </View>
            
            <View style={styles.tagInfoContainer}>
              <View style={styles.tagInfoRow}>
                <Text style={styles.tagInfoLabel}>Item:</Text>
                <Text style={styles.tagInfoValue}>{item.name}</Text>
              </View>
              <View style={styles.tagInfoRow}>
                <Text style={styles.tagInfoLabel}>SKU:</Text>
                <Text style={styles.tagInfoValue}>{item.sku}</Text>
              </View>
              <View style={styles.tagInfoRow}>
                <Text style={styles.tagInfoLabel}>Tag ID:</Text>
                <Text style={styles.tagInfoValue}>{tagId}</Text>
              </View>
              {item.oracleId && (
                <View style={styles.tagInfoRow}>
                  <Text style={styles.tagInfoLabel}>Oracle ID:</Text>
                  <Text style={styles.tagInfoValue}>{item.oracleId}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/template--v1.png' }}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Select Template</Text>
          </View>
          
          <View style={styles.cardBody}>
            <FlatList
              data={LABEL_TEMPLATES}
              renderItem={renderTemplateItem}
              keyExtractor={item => item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templateListContent}
            />
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/printer--v1.png' }}
              style={styles.cardIcon}
            />
            <Text style={styles.cardTitle}>Printer Connection</Text>
          </View>
          
          <View style={styles.cardBody}>
            {currentPrinter ? (
              <View style={styles.currentPrinterContainer}>
                <View style={styles.currentPrinterInfo}>
                  <Image
                    source={{ uri: getConnectionTypeIcon(currentPrinter.type) }}
                    style={styles.currentPrinterIcon}
                  />
                  <View>
                    <Text style={styles.currentPrinterName}>{currentPrinter.name}</Text>
                    <View style={styles.currentPrinterStatusRow}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(currentPrinter.status) }
                        ]}
                      />
                      <Text style={styles.currentPrinterStatus}>
                        {currentPrinter.status === PrinterStatus.CONNECTED ? 'Connected' : 'Disconnected'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.changePrinterButton}
                  onPress={() => setIsPrinterModalVisible(true)}
                >
                  <Text style={styles.changePrinterText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.noPrinterButton}
                onPress={() => setIsPrinterModalVisible(true)}
              >
                <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/6b7280/print--v1.png' }}
                  style={styles.noPrinterIcon}
                />
                <Text style={styles.noPrinterText}>No printer connected</Text>
                <Text style={styles.noPrinterSubtext}>Tap to connect</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.printButton,
            (!currentPrinter || currentPrinter.status !== PrinterStatus.CONNECTED || !selectedTemplate) && styles.printButtonDisabled,
            isPrinting && styles.printButtonPrinting,
            printSuccess && styles.printButtonSuccess
          ]}
          onPress={handlePrint}
          disabled={isPrinting || printSuccess || !currentPrinter || currentPrinter.status !== PrinterStatus.CONNECTED || !selectedTemplate}
        >
          {isPrinting ? (
            <ActivityIndicator color="#ffffff" />
          ) : printSuccess ? (
            <View style={styles.printSuccessContent}>
              <Image 
                source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/checkmark--v1.png' }}
                style={styles.printSuccessIcon}
              />
              <Text style={styles.printButtonText}>Printed Successfully</Text>
            </View>
          ) : (
            <Text style={styles.printButtonText}>
              {currentPrinter && currentPrinter.status === PrinterStatus.CONNECTED ? 'Print Tag' : 'Connect Printer to Print'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      
      <Modal
        visible={isPrinterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPrinterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Printer</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsPrinterModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availablePrinters}
              renderItem={renderPrinterItem}
              keyExtractor={item => item.id}
              style={styles.printerList}
              contentContainerStyle={styles.printerListContent}
            />
            
            <TouchableOpacity
              style={styles.modalFooterButton}
              onPress={() => setIsPrinterModalVisible(false)}
            >
              <Text style={styles.modalFooterButtonText}>Cancel</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4b5563',
    fontSize: 16,
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
  scrollContainer: {
    flex: 1,
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
  previewContainer: {
    backgroundColor: '#f3f4f6',
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  noTemplateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTemplateText: {
    color: '#6b7280',
    fontSize: 16,
  },
  tagInfoContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
  },
  tagInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagInfoLabel: {
    width: 80,
    fontWeight: '500',
    color: '#4b5563',
  },
  tagInfoValue: {
    flex: 1,
    color: '#1f2937',
  },
  templateListContent: {
    paddingVertical: 8,
  },
  templateItem: {
    width: 120,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  templateItemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  templatePreview: {
    width: 100,
    height: 80,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
    textAlign: 'center',
  },
  templateNameSelected: {
    color: '#1e40af',
  },
  templateDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  templateDescSelected: {
    color: '#3b82f6',
  },
  currentPrinterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
  },
  currentPrinterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrinterIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  currentPrinterName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  currentPrinterStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  currentPrinterStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
  changePrinterButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changePrinterText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  noPrinterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  noPrinterIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  noPrinterText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 4,
  },
  noPrinterSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  printButton: {
    backgroundColor: '#3b82f6',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  printButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  printButtonPrinting: {
    backgroundColor: '#6366f1',
  },
  printButtonSuccess: {
    backgroundColor: '#10b981',
  },
  printButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  printSuccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  printSuccessIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    marginRight: 8,
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
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
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
  modalCloseButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  printerList: {
    maxHeight: 300,
  },
  printerListContent: {
    paddingBottom: 16,
  },
  printerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  printerItemConnected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  printerIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  printerAddress: {
    fontSize: 12,
    color: '#6b7280',
  },
  printerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalFooterButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalFooterButtonText: {
    color: '#4b5563',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default PrintTagScreen; 
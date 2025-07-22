import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert as RNAlert,
  Image,
  StatusBar,
  Modal
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { 
  AlertService, 
  TagService, 
  MovementService, 
  UserService,
  Alert, 
  AlertType, 
  AlertSeverity,
  MOCK_ITEMS
} from '../services';

type AlertDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AlertDetail'>;
  route: RouteProp<RootStackParamList, 'AlertDetail'>;
};

const AlertDetailScreen = ({ navigation, route }: AlertDetailScreenProps) => {
  const { alertId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [notes, setNotes] = useState('');
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isEscalateModalVisible, setIsEscalateModalVisible] = useState(false);
  const [escalationNotes, setEscalationNotes] = useState('');
  const [relatedItem, setRelatedItem] = useState<any | null>(null);
  const [relatedMovements, setRelatedMovements] = useState<any[]>([]);
  
  useEffect(() => {
    loadAlertDetails();
  }, [alertId]);
  
  const loadAlertDetails = async () => {
    setLoading(true);
    try {
      // Get alert data
      const alertData = await AlertService.getAlertById(alertId);
      
      if (!alertData) {
        RNAlert.alert('Error', 'Alert not found');
        navigation.goBack();
        return;
      }
      
      setAlert(alertData);
      
      // If there's a tag ID, get related item and movements
      if (alertData.tagId) {
        // Get item for this tag
        const item = await TagService.getItemByTagId(alertData.tagId, MOCK_ITEMS);
        setRelatedItem(item);
        
        // Get movements for this tag
        const movements = await MovementService.getMovementsByTagId(alertData.tagId);
        setRelatedMovements(movements);
      }
    } catch (error) {
      console.error('Error loading alert details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAcknowledge = async () => {
    if (!alert) return;
    
    setIsAcknowledging(true);
    
    try {
      // Get current user ID (in a real app this would be from auth state)
      const currentUser = await UserService.getCurrentUser();
      
      if (!currentUser) {
        RNAlert.alert('Error', 'User not found');
        return;
      }
      
      const success = await AlertService.acknowledgeAlert(alert.id, currentUser.id, notes);
      
      if (success) {
        // Refresh alert data
        await loadAlertDetails();
        RNAlert.alert('Success', 'Alert acknowledged successfully');
      } else {
        RNAlert.alert('Error', 'Failed to acknowledge alert');
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      RNAlert.alert('Error', 'An error occurred while acknowledging alert');
    } finally {
      setIsAcknowledging(false);
    }
  };
  
  const handleEscalate = async () => {
    if (!alert) return;
    
    setIsEscalating(true);
    
    try {
      // Get current user ID (in a real app this would be from auth state)
      const currentUser = await UserService.getCurrentUser();
      
      if (!currentUser) {
        RNAlert.alert('Error', 'User not found');
        return;
      }
      
      const success = await AlertService.escalateAlert(alert.id, currentUser.id, escalationNotes);
      
      if (success) {
        // Close modal
        setIsEscalateModalVisible(false);
        // Refresh alert data
        await loadAlertDetails();
        RNAlert.alert('Success', 'Alert escalated to supervisor');
      } else {
        RNAlert.alert('Error', 'Failed to escalate alert');
      }
    } catch (error) {
      console.error('Error escalating alert:', error);
      RNAlert.alert('Error', 'An error occurred while escalating alert');
    } finally {
      setIsEscalating(false);
    }
  };
  
  const handleResolve = async () => {
    if (!alert) return;
    
    RNAlert.alert(
      'Resolve Alert',
      'Are you sure you want to mark this alert as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            try {
              const success = await AlertService.dismissAlert(alert.id);
              
              if (success) {
                // Refresh alert data
                await loadAlertDetails();
                RNAlert.alert('Success', 'Alert marked as resolved');
              } else {
                RNAlert.alert('Error', 'Failed to resolve alert');
              }
            } catch (error) {
              console.error('Error resolving alert:', error);
              RNAlert.alert('Error', 'An error occurred while resolving alert');
            }
          }
        }
      ]
    );
  };
  
  const getSeverityInfo = (severity: AlertSeverity) => {
    return AlertService.getSeverityDescription(severity);
  };
  
  const getTypeInfo = (type: AlertType) => {
    return AlertService.getTypeDescription(type);
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading alert details...</Text>
      </View>
    );
  }
  
  if (!alert) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Alert not found</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const severityInfo = getSeverityInfo(alert.severity);
  const typeInfo = getTypeInfo(alert.type);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={[styles.alertHeader, { backgroundColor: severityInfo.color }]}>
          <Image 
            source={{ uri: typeInfo.icon }}
            style={styles.alertIcon}
          />
          <View style={styles.alertTitleContainer}>
            <Text style={styles.alertType}>{typeInfo.label}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alert Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Severity</Text>
            <View style={[styles.severityBadge, { backgroundColor: severityInfo.color }]}>
              <Text style={styles.severityText}>{severityInfo.label}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>
              {alert.resolved ? 'Resolved' : 'Active'}
              {alert.acknowledged ? ' (Acknowledged)' : ''}
              {alert.escalated ? ' (Escalated)' : ''}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>{formatDate(alert.timestamp)}</Text>
          </View>
          
          {alert.resolved && alert.resolvedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Resolved</Text>
              <Text style={styles.detailValue}>{formatDate(alert.resolvedAt)}</Text>
            </View>
          )}
          
          {alert.tagId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tag ID</Text>
              <Text style={styles.detailValue}>{alert.tagId}</Text>
            </View>
          )}
          
          {alert.zoneId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Zone</Text>
              <Text style={styles.detailValue}>{alert.zoneId}</Text>
            </View>
          )}
          
          <View style={styles.severityInfoContainer}>
            <Text style={styles.severityInfoTitle}>{severityInfo.label} Severity</Text>
            <Text style={styles.severityInfoText}>{severityInfo.description}</Text>
          </View>
          
          <View style={styles.typeInfoContainer}>
            <Text style={styles.typeInfoTitle}>{typeInfo.label}</Text>
            <Text style={styles.typeInfoText}>{typeInfo.description}</Text>
          </View>
        </View>
        
        {relatedItem && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Related Item</Text>
            
            <View style={styles.relatedItemContainer}>
              <Text style={styles.relatedItemName}>{relatedItem.name}</Text>
              <Text style={styles.relatedItemDescription}>{relatedItem.description}</Text>
              
              <View style={styles.relatedItemDetails}>
                <View style={styles.relatedItemDetail}>
                  <Text style={styles.relatedItemDetailLabel}>SKU</Text>
                  <Text style={styles.relatedItemDetailValue}>{relatedItem.sku}</Text>
                </View>
                
                {relatedItem.oracleId && (
                  <View style={styles.relatedItemDetail}>
                    <Text style={styles.relatedItemDetailLabel}>Oracle ID</Text>
                    <Text style={styles.relatedItemDetailValue}>{relatedItem.oracleId}</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.viewItemButton}
                onPress={() => navigation.navigate('ItemLookup')}
              >
                <Text style={styles.viewItemButtonText}>View Item Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {relatedMovements.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Related Movements</Text>
            
            {relatedMovements.map((movement, index) => (
              <View key={index} style={styles.movementItem}>
                <View style={styles.movementHeader}>
                  <Text style={styles.movementZone}>{movement.zone}</Text>
                  <Text style={styles.movementType}>{movement.movementType}</Text>
                </View>
                
                <Text style={styles.movementTime}>{formatDate(movement.timestamp)}</Text>
                
                <View style={styles.movementStatus}>
                  {movement.verified ? (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : (
                    <View style={styles.unverifiedBadge}>
                      <Text style={styles.unverifiedText}>Unverified</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
        
        {alert.acknowledged && alert.acknowledgement && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acknowledgement</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>By</Text>
              <Text style={styles.detailValue}>{alert.acknowledgement.acknowledgedBy}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>At</Text>
              <Text style={styles.detailValue}>{formatDate(alert.acknowledgement.acknowledgedAt)}</Text>
            </View>
            
            {alert.acknowledgement.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{alert.acknowledgement.notes}</Text>
              </View>
            )}
          </View>
        )}
        
        {alert.escalated && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Escalation</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Escalated By</Text>
              <Text style={styles.detailValue}>{alert.escalatedBy}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>At</Text>
              <Text style={styles.detailValue}>{alert.escalatedAt ? formatDate(alert.escalatedAt) : 'Unknown'}</Text>
            </View>
            
            {alert.escalationNotes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Escalation Notes</Text>
                <Text style={styles.notesText}>{alert.escalationNotes}</Text>
              </View>
            )}
          </View>
        )}
        
        {!alert.resolved && !alert.acknowledged && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acknowledge Alert</Text>
            <Text style={styles.acknowledgeInfo}>
              Add any notes about this alert and acknowledge that you've seen it.
            </Text>
            
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter acknowledgement notes (optional)"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity
              style={styles.acknowledgeButton}
              onPress={handleAcknowledge}
              disabled={isAcknowledging}
            >
              {isAcknowledging ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.acknowledgeButtonText}>Acknowledge Alert</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.actionButtonsContainer}>
          {!alert.resolved && (
            <TouchableOpacity 
              style={styles.resolveButton} 
              onPress={handleResolve}
            >
              <Text style={styles.resolveButtonText}>Resolve Alert</Text>
            </TouchableOpacity>
          )}
          
          {!alert.escalated && !alert.resolved && (
            <TouchableOpacity 
              style={styles.escalateButton} 
              onPress={() => setIsEscalateModalVisible(true)}
            >
              <Text style={styles.escalateButtonText}>Escalate to Supervisor</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      
      {/* Escalation Modal */}
      <Modal
        visible={isEscalateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEscalateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Escalate to Supervisor</Text>
            
            <Text style={styles.modalText}>
              This will notify a supervisor about this alert and increase its priority.
              Please provide details about why this alert requires escalation.
            </Text>
            
            <TextInput
              style={styles.escalationNotesInput}
              value={escalationNotes}
              onChangeText={setEscalationNotes}
              placeholder="Enter reason for escalation"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEscalateModalVisible(false)}
                disabled={isEscalating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.escalateConfirmButton}
                onPress={handleEscalate}
                disabled={isEscalating}
              >
                {isEscalating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.escalateConfirmButtonText}>Escalate</Text>
                )}
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  alertHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    width: 36,
    height: 36,
    tintColor: 'white',
    marginRight: 12,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    textAlign: 'right',
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  severityInfoContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  severityInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  severityInfoText: {
    fontSize: 14,
    color: '#4b5563',
  },
  typeInfoContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  typeInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  typeInfoText: {
    fontSize: 14,
    color: '#4b5563',
  },
  relatedItemContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  relatedItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  relatedItemDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  relatedItemDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  relatedItemDetail: {
    marginRight: 20,
  },
  relatedItemDetailLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  relatedItemDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  viewItemButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewItemButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  movementItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  movementZone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  movementType: {
    fontSize: 14,
    color: '#4b5563',
  },
  movementTime: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  movementStatus: {
    alignItems: 'flex-start',
  },
  verifiedBadge: {
    backgroundColor: '#d1fae5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '500',
  },
  unverifiedBadge: {
    backgroundColor: '#fee2e2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  unverifiedText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#4b5563',
  },
  acknowledgeInfo: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  acknowledgeButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acknowledgeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  resolveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  resolveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  escalateButton: {
    flex: 1,
    backgroundColor: '#f97316',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  escalateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
  },
  escalationNotesInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  escalateConfirmButton: {
    backgroundColor: '#f97316',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  escalateConfirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default AlertDetailScreen; 
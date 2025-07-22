import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { AlertService, Alert, AlertType, AlertSeverity } from '../services';

type AlertsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Alerts'>;
};

const AlertsScreen = ({ navigation }: AlertsScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    // Generate some test alerts if none exist
    const generateTestAlerts = async () => {
      const existingAlerts = await AlertService.getAllAlerts();
      if (existingAlerts.length === 0) {
        for (let i = 0; i < 5; i++) {
          await AlertService.generateRandomAlert();
        }
      }
    };
    
    generateTestAlerts();
    loadAlerts();

    // Set up a refresh interval
    const refreshInterval = setInterval(loadAlerts, 10000);

    // Clean up
    return () => clearInterval(refreshInterval);
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      let alertsData: Alert[];
      
      switch (activeFilter) {
        case 'active':
          alertsData = await AlertService.getActiveAlerts();
          break;
        case 'resolved':
          const allAlerts = await AlertService.getAllAlerts();
          alertsData = allAlerts.filter(alert => alert.resolved);
          break;
        case 'all':
        default:
          alertsData = await AlertService.getAllAlerts();
          break;
      }
      
      // Sort by timestamp (newest first)
      alertsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAlert = (alert: Alert) => {
    navigation.navigate('AlertDetail', { alertId: alert.id });
  };

  const handleCreateTestAlert = async () => {
    try {
      await AlertService.generateRandomAlert();
      await loadAlerts();
    } catch (error) {
      console.error('Error creating test alert:', error);
    }
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    const severityInfo = AlertService.getSeverityDescription(severity);
    return severityInfo.color;
  };

  const getTypeIcon = (type: AlertType): string => {
    const typeInfo = AlertService.getTypeDescription(type);
    return typeInfo.icon;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const renderAlertItem = ({ item }: { item: Alert }) => (
    <TouchableOpacity 
      style={styles.alertItem} 
      onPress={() => handleViewAlert(item)}
    >
      <View 
        style={[
          styles.alertSeverityIndicator, 
          { backgroundColor: getSeverityColor(item.severity) }
        ]} 
      />
      
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Image 
            source={{ uri: getTypeIcon(item.type) }}
            style={[
              styles.alertTypeIcon, 
              { tintColor: getSeverityColor(item.severity) }
            ]}
          />
          <Text style={styles.alertType}>
            {AlertService.getTypeDescription(item.type).label}
          </Text>
          {item.resolved && (
            <View style={styles.resolvedBadge}>
              <Text style={styles.resolvedText}>Resolved</Text>
            </View>
          )}
          {item.escalated && (
            <View style={styles.escalatedBadge}>
              <Text style={styles.escalatedText}>Escalated</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.alertMessage}>{item.message}</Text>
        
        <View style={styles.alertFooter}>
          <Text style={styles.alertTimestamp}>{formatDate(item.timestamp)}</Text>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => handleViewAlert(item)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateTestAlert}
        >
          <Text style={styles.addButtonText}>+ Test Alert</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => {
            setActiveFilter('all');
            loadAlerts();
          }}
        >
          <Text 
            style={[
              styles.filterButtonText,
              activeFilter === 'all' && styles.filterButtonTextActive
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'active' && styles.filterButtonActive
          ]}
          onPress={() => {
            setActiveFilter('active');
            loadAlerts();
          }}
        >
          <Text 
            style={[
              styles.filterButtonText,
              activeFilter === 'active' && styles.filterButtonTextActive
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'resolved' && styles.filterButtonActive
          ]}
          onPress={() => {
            setActiveFilter('resolved');
            loadAlerts();
          }}
        >
          <Text 
            style={[
              styles.filterButtonText,
              activeFilter === 'resolved' && styles.filterButtonTextActive
            ]}
          >
            Resolved
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading alerts...</Text>
        </View>
      ) : alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image 
            source={{ uri: 'https://img.icons8.com/ios-filled/100/9ca3af/bell--v1.png' }}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No alerts found</Text>
          <Text style={styles.emptySubtext}>
            {activeFilter === 'all' 
              ? 'There are no alerts in the system' 
              : activeFilter === 'active' 
                ? 'There are no active alerts' 
                : 'There are no resolved alerts'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={loadAlerts}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontWeight: '500',
    color: '#4b5563',
  },
  filterButtonTextActive: {
    color: 'white',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    opacity: 0.5,
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
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  alertItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertSeverityIndicator: {
    width: 8,
    height: '100%',
  },
  alertContent: {
    flex: 1,
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTypeIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  resolvedBadge: {
    backgroundColor: '#d1fae5',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  resolvedText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  escalatedBadge: {
    backgroundColor: '#fef3c7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 6,
  },
  escalatedText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  alertMessage: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
});

export default AlertsScreen; 
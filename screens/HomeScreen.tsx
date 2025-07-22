import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { UserService, User, UserStatus } from '../services';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Load current user
    const loadUser = async () => {
      const user = await UserService.getCurrentUser();
      setCurrentUser(user);
    };
    
    loadUser();
  }, []);

  // Function to get connection status icon
  const getStatusIndicator = () => {
    if (!isOnline) {
      return { color: '#ef4444', text: 'Offline' }; // Red for offline
    }
    
    return { color: '#10b981', text: 'Online' }; // Green for online
  };

  const statusIndicator = getStatusIndicator();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.headerBackground}
          imageStyle={{ opacity: 0.2 }}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>RFID Warehouse</Text>
              <Text style={styles.subtitle}>Management System</Text>
              <View style={styles.tagline}>
                <Text style={styles.taglineText}>Streamline inventory tracking with RFID technology</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {currentUser && (
          <View style={styles.userInfoContainer}>
            <View style={styles.userInfoLeft}>
              <Image
                source={{ uri: currentUser.profileImage || 'https://randomuser.me/api/portraits/lego/1.jpg' }}
                style={styles.userAvatar}
              />
              <View style={styles.userTextContainer}>
                <Text style={styles.userName}>{currentUser.fullName}</Text>
                <Text style={styles.userRole}>{currentUser.role}</Text>
              </View>
            </View>
            <View style={styles.connectionStatus}>
              <View style={[styles.statusDot, { backgroundColor: statusIndicator.color }]} />
              <Text style={styles.statusText}>{statusIndicator.text}</Text>
            </View>
          </View>
        )}

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Active Tags</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>Movements</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('TagScanner')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#3b82f6' }]}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/qr-code--v1.png' }}
                  style={styles.menuIcon}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>Tag Scanner</Text>
                <Text style={styles.menuItemDescription}>
                  Scan tags and record movements between zones
                </Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.menuArrowText}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AssignTag')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#10b981' }]}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/tag-window.png' }}
                  style={styles.menuIcon}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>Assign Tag</Text>
                <Text style={styles.menuItemDescription}>
                  Link RFID tags to inventory items
                </Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.menuArrowText}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ItemLookup')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#6366f1' }]}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/search--v1.png' }}
                  style={styles.menuIcon}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>Item Lookup</Text>
                <Text style={styles.menuItemDescription}>
                  Search for items by Oracle ID or SKU
                </Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.menuArrowText}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('IssuanceVerification')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#10b981' }]}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/verified-account--v1.png' }}
                  style={styles.menuIcon}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>Issuance Verification</Text>
                <Text style={styles.menuItemDescription}>
                  Verify items against Oracle orders
                </Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.menuArrowText}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Alerts')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#ef4444' }]}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/bell--v1.png' }}
                  style={styles.menuIcon}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>Alerts</Text>
                <Text style={styles.menuItemDescription}>
                  View and manage system alerts
                </Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.menuArrowText}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('OfflineMode')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#f59e0b' }]}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/cloud-offline.png' }}
                  style={styles.menuIcon}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>Offline Mode</Text>
                <Text style={styles.menuItemDescription}>
                  Manage and sync offline data
                </Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.menuArrowText}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>AI Features</Text>

          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AIInsights')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#8b5cf6' }]}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/light-on.png' }}
                  style={styles.menuIcon}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>AI Insights</Text>
                <Text style={styles.menuItemDescription}>
                  Get intelligent insights about your warehouse operations
                </Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.menuArrowText}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AIChat')}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#ec4899' }]}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/chat-message.png' }}
                  style={styles.menuIcon}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuItemText}>AI Assistant</Text>
                <Text style={styles.menuItemDescription}>
                  Chat with an AI assistant about your warehouse
                </Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.menuArrowText}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About This App</Text>
            <Text style={styles.infoText}>
              This mobile application is part of the RFID Warehouse Management System,
              designed to help track inventory using RFID technology. Use it to scan tags,
              record movements, and manage your warehouse operations efficiently.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBackground: {
    backgroundColor: '#1e40af',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  tagline: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  taglineText: {
    color: 'white',
    fontSize: 12,
  },
  userInfoContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userTextContainer: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  userRole: {
    fontSize: 12,
    color: '#6b7280',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  menuArrow: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuArrowText: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0e7490',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  version: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

export default HomeScreen; 
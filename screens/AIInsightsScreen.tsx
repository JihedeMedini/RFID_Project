import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
  RefreshControl
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { AIService, AIInsight } from '../services';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type AIInsightsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AIInsights'>;
};

const AIInsightsScreen: React.FC<AIInsightsScreenProps> = ({ navigation }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    
    try {
      const aiInsights = await AIService.generateInsights();
      setInsights(aiInsights);
    } catch (err) {
      console.error('Failed to load insights:', err);
      setError('Unable to load AI insights. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const onRefresh = () => {
    loadInsights(true);
  };

  // Get icon based on insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'movement': return 'truck-fast';
      case 'inventory': return 'package-variant';
      case 'alert': return 'alert-circle';
      case 'prediction': return 'chart-line';
      default: return 'lightbulb-on';
    }
  };

  // Get color based on insight type
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'movement': return '#3498db';
      case 'inventory': return '#2ecc71';
      case 'alert': return '#e74c3c';
      case 'prediction': return '#9b59b6';
      default: return '#f39c12';
    }
  };

  // Get background color based on confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#d5f5e3'; // High confidence - green
    if (confidence >= 0.5) return '#fef9e7'; // Medium confidence - yellow
    return '#fadbd8'; // Low confidence - red
  };

  // Render each insight card
  const renderInsight = ({ item }: { item: AIInsight }) => {
    const insightColor = getInsightColor(item.type);
    const confidenceColor = getConfidenceColor(item.confidence);
    
    return (
      <View style={[styles.insightCard, { borderLeftColor: insightColor }]}>
        <View style={styles.insightHeader}>
          <View style={[styles.iconContainer, { backgroundColor: insightColor }]}>
            <Icon name={getInsightIcon(item.type)} size={24} color="#fff" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.insightTitle}>{item.title}</Text>
            <Text style={styles.insightType}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={styles.insightDescription}>{item.description}</Text>
        
        {item.actionRecommendation && (
          <View style={styles.recommendationContainer}>
            <Icon name="lightbulb-on" size={16} color="#f39c12" />
            <Text style={styles.recommendation}>{item.actionRecommendation}</Text>
          </View>
        )}
        
        <View style={styles.insightFooter}>
          <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}>
            <Text style={styles.confidenceText}>
              Confidence: {Math.round(item.confidence * 100)}%
            </Text>
          </View>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Generating AI insights...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Insights</Text>
        <View style={styles.headerRight} />
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => loadInsights()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : insights.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="lightbulb-off" size={48} color="#95a5a6" />
          <Text style={styles.emptyText}>No insights available</Text>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => loadInsights()}
          >
            <Text style={styles.generateButtonText}>Generate Insights</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={insights}
          renderItem={renderInsight}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066cc']}
            />
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  insightType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  insightDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  recommendation: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AIInsightsScreen; 
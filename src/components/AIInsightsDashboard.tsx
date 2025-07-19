import { useState, useEffect } from 'react';
import AIService, { AIInsight, InsightType } from '../services/AIService';

const AIInsightsDashboard = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<InsightType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const data = await AIService.generateInsights();
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setTimeout(() => setRefreshing(false), 600); // Minimum visual feedback time
  };

  const filteredInsights = activeFilter === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === activeFilter);

  const getTypeIcon = (type: InsightType) => {
    switch (type) {
      case 'inventory':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'movement':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'alert':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'prediction':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: InsightType) => {
    switch (type) {
      case 'inventory':
        return 'bg-blue-100 text-blue-800';
      case 'movement':
        return 'bg-green-100 text-green-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      case 'prediction':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse-slow" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
          </svg>
          AI Insights
        </h2>
        <button 
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="text-white bg-indigo-500 hover:bg-indigo-600 p-2 rounded-full transition-all duration-200 flex items-center hover:shadow-md active:scale-95 disabled:opacity-50"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Insights
          </button>
          <button
            onClick={() => setActiveFilter('inventory')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
              activeFilter === 'inventory' 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-4 h-4 mr-1">{getTypeIcon('inventory')}</span>
            Inventory
          </button>
          <button
            onClick={() => setActiveFilter('movement')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
              activeFilter === 'movement' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-4 h-4 mr-1">{getTypeIcon('movement')}</span>
            Movement
          </button>
          <button
            onClick={() => setActiveFilter('alert')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
              activeFilter === 'alert' 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-4 h-4 mr-1">{getTypeIcon('alert')}</span>
            Alerts
          </button>
          <button
            onClick={() => setActiveFilter('prediction')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center ${
              activeFilter === 'prediction' 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-4 h-4 mr-1">{getTypeIcon('prediction')}</span>
            Predictions
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center">
          <svg className="animate-spin h-12 w-12 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 text-lg">Generating AI insights...</p>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-gray-500 text-lg">No insights available</p>
          <p className="text-gray-400 text-sm mt-1">Try changing your filter or refreshing</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((insight, index) => (
            <div 
              key={insight.id} 
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className={`p-2 rounded-full mr-3 ${getTypeColor(insight.type)}`}>
                    {getTypeIcon(insight.type)}
                  </span>
                  <h3 className="font-medium text-gray-900">{insight.title}</h3>
                </div>
                <span 
                  className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(insight.type)}`}
                >
                  {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3">{insight.description}</p>
              
              {insight.relatedItems && insight.relatedItems.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Related Items:</p>
                  <div className="flex flex-wrap gap-1">
                    {insight.relatedItems.map(item => (
                      <span 
                        key={item} 
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {insight.actionRecommendation && (
                <div className="bg-indigo-50 border-l-2 border-indigo-300 p-3 text-sm text-indigo-700 mb-3">
                  <span className="font-medium">Recommendation:</span> {insight.actionRecommendation}
                </div>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {new Date(insight.timestamp).toLocaleString()}
                </span>
                <span className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
                  Confidence: {Math.round(insight.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsightsDashboard; 
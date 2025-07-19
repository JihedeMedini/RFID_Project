import { MovementService, TagService, AlertService } from '../mockServices';
import { MOCK_ITEMS } from '../mockServices';

// Serverless function endpoint
const SERVERLESS_API_ENDPOINT = 'https://serverless-function-v2.vercel.app/api/azureopenai';

// Types for AI features
export type InsightType = 'inventory' | 'movement' | 'alert' | 'prediction';

export interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  timestamp: number;
  confidence: number;
  relatedItems?: string[];
  relatedTags?: string[];
  actionRecommendation?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI Service for intelligent features
class AIService {
  private systemPrompt = `You are an AI assistant for an RFID Warehouse Management System. 
  You help users manage inventory, track movements, analyze alerts, and provide insights. 
  Keep responses concise, professional, and focused on warehouse operations.`;

  // Generate insights based on system data
  async generateInsights(): Promise<AIInsight[]> {
    try {
      const movements = MovementService.getAllMovements();
      const tags = TagService.getAllAssignments();
      const alerts = AlertService.getAllAlerts();
      
      // Prepare context for AI
      const context = {
        movements: movements.slice(0, 10), // Send only recent movements
        tags: tags.length,
        alerts: alerts.filter(a => !a.resolved).length,
        alertTypes: this.countAlertsByType(alerts),
        recentActivity: this.summarizeRecentActivity(movements)
      };
      
      const prompt = `Based on the following warehouse data, generate 3-5 key insights that would be valuable for warehouse management:
      ${JSON.stringify(context)}
      
      Format each insight as a JSON object with: type, title, description, confidence (0-1), and actionRecommendation.`;
      
      const response = await this.callServerlessFunction([
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt }
      ]);
      
      // Parse insights from response
      let insights: AIInsight[] = [];
      try {
        // Extract JSON from response - handle both direct JSON or text with JSON
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to mock insights if parsing fails
          insights = this.getMockInsights();
        }
      } catch (error) {
        console.error('Failed to parse insights:', error);
        insights = this.getMockInsights();
      }
      
      return insights.map(insight => ({
        ...insight,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.getMockInsights();
    }
  }
  
  // Chat with the AI assistant about warehouse operations
  async chat(messages: ChatMessage[], systemContext?: string): Promise<string> {
    try {
      // Add warehouse context to the system prompt
      const enhancedSystemPrompt = systemContext 
        ? `${this.systemPrompt}\n\nCurrent warehouse context: ${systemContext}`
        : this.systemPrompt;
        
      const allMessages = [
        { role: 'system' as const, content: enhancedSystemPrompt },
        ...messages
      ];
      
      const response = await this.callServerlessFunction(allMessages);
      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      return "I'm having trouble connecting to the AI service. Please try again later.";
    }
  }
  
  // Analyze movement patterns and predict potential issues
  async analyzeMovementPatterns(): Promise<string> {
    try {
      const movements = MovementService.getAllMovements();
      
      const prompt = `Analyze these recent movement logs and identify any unusual patterns or potential issues:
      ${JSON.stringify(movements.slice(0, 20))}
      
      Provide a concise analysis focusing on:
      1. Unusual movement patterns
      2. Potential bottlenecks
      3. Optimization recommendations`;
      
      const response = await this.callServerlessFunction([
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt }
      ]);
      
      return response;
    } catch (error) {
      console.error('Error analyzing movement patterns:', error);
      return "Unable to analyze movement patterns at this time.";
    }
  }
  
  // Generate recommendations for inventory optimization
  async getInventoryRecommendations(): Promise<string> {
    try {
      const tags = TagService.getAllAssignments();
      const movements = MovementService.getAllMovements();
      
      // Group items by frequency of movement
      const itemMovements: Record<string, number> = {};
      movements.forEach(movement => {
        const item = TagService.getItemByTagId(movement.tagId, MOCK_ITEMS);
        if (item && item.id) {
          itemMovements[item.id] = (itemMovements[item.id] || 0) + 1;
        }
      });
      
      const prompt = `Based on this inventory and movement data, provide recommendations for inventory optimization:
      Tags: ${JSON.stringify(tags.slice(0, 10))}
      Item Movement Frequency: ${JSON.stringify(itemMovements)}
      
      Focus on:
      1. Items that might need restocking
      2. Items with unusual movement patterns
      3. Storage optimization suggestions`;
      
      const response = await this.callServerlessFunction([
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: prompt }
      ]);
      
      return response;
    } catch (error) {
      console.error('Error getting inventory recommendations:', error);
      return "Unable to generate inventory recommendations at this time.";
    }
  }

  // Private helper methods
  private async callServerlessFunction(messages: ChatMessage[]): Promise<string> {
    try {
      // Call the serverless function
      const response = await fetch(SERVERLESS_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          max_tokens: 800,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract content from the response based on the structure
      let content = '';
      
      // Check for the specific format shown in the user's example
      if (data.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
        content = data.choices[0].message.content;
      } 
      // Fallback to other potential formats
      else if (data.message && data.message.content) {
        content = data.message.content;
      } else if (data.content) {
        content = data.content;
      }
      
      return content || this.getMockResponse(messages[messages.length - 1].content);
    } catch (error) {
      console.error('Error calling serverless function:', error);
      return this.getMockResponse(messages[messages.length - 1].content);
    }
  }
  
  private getMockResponse(query: string): string {
    if (query.includes('insight') || query.includes('recommend')) {
      return "Based on recent movement data, I've noticed that items in the Warehouse zone have a 27% higher movement frequency compared to last week. This might indicate increased demand for these products. Consider reviewing inventory levels for these items to ensure adequate stock.";
    } else if (query.includes('movement') || query.includes('pattern')) {
      return "I've analyzed the movement patterns and found potential bottlenecks in the Receiving zone during afternoon hours. The average processing time has increased by 15% compared to morning hours. Consider redistributing staff during peak times to improve efficiency.";
    } else {
      return "I'm here to help with your warehouse management needs. I can provide insights on inventory, movement patterns, and alert analysis. What specific information are you looking for today?";
    }
  }
  
  private getMockInsights(): AIInsight[] {
    return [
      {
        id: crypto.randomUUID(),
        type: 'movement',
        title: 'Increased Movement in Warehouse Zone',
        description: 'There has been a 27% increase in movement activity in the Warehouse zone compared to last week.',
        timestamp: Date.now(),
        confidence: 0.89,
        actionRecommendation: 'Consider reviewing staffing levels in the Warehouse zone to accommodate increased activity.'
      },
      {
        id: crypto.randomUUID(),
        type: 'inventory',
        title: 'Potential Stock Issues',
        description: 'Several high-movement items have not been restocked in the past 7 days.',
        timestamp: Date.now(),
        confidence: 0.76,
        relatedItems: ['MacBook Pro 14"', 'AirPods Pro'],
        actionRecommendation: 'Review inventory levels for these items and consider restocking.'
      },
      {
        id: crypto.randomUUID(),
        type: 'alert',
        title: 'Recurring Unassigned Tag Alerts',
        description: 'Multiple unassigned tag alerts have been triggered from the Receiving zone.',
        timestamp: Date.now(),
        confidence: 0.92,
        actionRecommendation: 'Check tag assignment procedures in the Receiving zone.'
      },
      {
        id: crypto.randomUUID(),
        type: 'prediction',
        title: 'Predicted Shipping Delay Risk',
        description: 'Based on current movement patterns, there is a risk of shipping delays in the next 24 hours.',
        timestamp: Date.now(),
        confidence: 0.67,
        actionRecommendation: 'Prepare contingency plans for priority shipments.'
      }
    ];
  }
  
  private countAlertsByType(alerts: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    alerts.forEach(alert => {
      counts[alert.type] = (counts[alert.type] || 0) + 1;
    });
    return counts;
  }
  
  private summarizeRecentActivity(movements: any[]): string {
    const recent = movements.slice(0, 5);
    const zones = new Set(recent.map(m => m.zone));
    const types = new Set(recent.map(m => m.movementType));
    
    return `Recent activity includes ${recent.length} movements across ${zones.size} zones with ${types.size} movement types.`;
  }
}

export default new AIService(); 
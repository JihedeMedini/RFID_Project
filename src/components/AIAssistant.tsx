import { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  ArrowPathIcon,
  LightBulbIcon,
  UserIcon
} from '@heroicons/react/24/outline';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

type AIAssistantProps = {
  onClose?: () => void;
};

const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your RFID system assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample suggestions for the AI assistant
  const suggestions = [
    "How do I register a new RFID reader?",
    "What does the warning status on a device mean?",
    "How can I create a custom report?",
    "Show me movement trends for the past week",
    "What are the best practices for zone configuration?"
  ];
  
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      const aiMessage: Message = {
        id: messages.length + 2,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Mock AI response generation based on user input
  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('register') && input.includes('reader')) {
      return "To register a new RFID reader, go to the Device Management page and click on 'Add Reader'. Fill in the required information like name, IP address, and location. You can also select the reader model from the dropdown. Once registered, you can configure its antennas and assign it to zones.";
    }
    
    if (input.includes('warning') && (input.includes('status') || input.includes('device'))) {
      return "A warning status on a device indicates that the device is operational but has some issues that might affect its performance. This could be due to high CPU or memory usage, elevated temperature, or weak signal strength. You can view detailed metrics by clicking 'View Details' on the device in the Device Status Monitor.";
    }
    
    if (input.includes('custom') && input.includes('report')) {
      return "To create a custom report, go to the Reports page and use the Report Generator tool. You can select 'Custom Report' as the report type, specify the date range, select zones and tags to include, and choose whether to include charts and visualizations. You can also save your custom report configuration as a template for future use.";
    }
    
    if (input.includes('movement') && input.includes('trends')) {
      return "To view movement trends, go to the AI Dashboard where you can find the Movement Trends chart. This shows tag movements across different zones over time. You can filter by date range and specific zones. For more detailed analysis, you can generate a Movement Report from the Reports page.";
    }
    
    if (input.includes('zone') && input.includes('configuration')) {
      return "For optimal zone configuration, consider these best practices:\n1. Place readers strategically at zone entry/exit points\n2. Ensure proper antenna coverage with minimal overlap\n3. Configure appropriate power levels for each antenna\n4. Set up specific rules for each zone based on your security requirements\n5. Regularly test and calibrate your zone boundaries";
    }
    
    return "I understand you're asking about " + userInput + ". Could you provide more details so I can give you a more specific answer? Or you can try one of the suggested questions below.";
  };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center">
        <div className="flex items-center">
          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
          <h3 className="font-medium">RFID System Assistant</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white hover:text-blue-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user' 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === 'user' ? (
                  <>
                    <span className="text-xs text-blue-700 font-medium">You</span>
                    <UserIcon className="h-3 w-3 ml-1 text-blue-700" />
                  </>
                ) : (
                  <>
                    <span className="text-xs text-gray-600 font-medium">AI Assistant</span>
                    <LightBulbIcon className="h-3 w-3 ml-1 text-gray-600" />
                  </>
                )}
                <span className="text-xs text-gray-500 ml-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-white text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your RFID system..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={input.trim() === ''}
            className={`ml-2 p-2 rounded-full ${
              input.trim() === '' 
                ? 'bg-gray-200 text-gray-400' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant; 
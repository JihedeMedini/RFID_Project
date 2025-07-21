import { useState } from 'react';
import { 
  ChatBubbleLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import AIAssistant from './AIAssistant';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={toggleChatbot}
        className={`fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open AI Assistant"
      >
        <ChatBubbleLeftIcon className="h-6 w-6" />
      </button>
      
      {/* Chatbot Dialog */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] z-50 animate-scale-in">
          <AIAssistant onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

export default AIChatbot; 
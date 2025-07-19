import { useState, useEffect } from 'react';

interface PrintingAnimationProps {
  onComplete: () => void;
}

const PrintingAnimation = ({ onComplete }: PrintingAnimationProps) => {
  const [progress, setProgress] = useState(0);
  const [showPrintedPage, setShowPrintedPage] = useState(false);
  
  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowPrintedPage(true);
            setTimeout(() => {
              onComplete();
            }, 1500);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [onComplete]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Printing Label
          </h3>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-6">
            {showPrintedPage ? (
              <div className="relative">
                <div className="animate-slide-up">
                  <svg className="w-32 h-32 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <line x1="8" y1="14" x2="8" y2="14"></line>
                    <line x1="12" y1="14" x2="12" y2="14"></line>
                    <line x1="16" y1="14" x2="16" y2="14"></line>
                    <line x1="8" y1="18" x2="8" y2="18"></line>
                    <line x1="12" y1="18" x2="12" y2="18"></line>
                    <line x1="16" y1="18" x2="16" y2="18"></line>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xs font-mono text-center">
                      <div className="text-blue-800 font-bold">RFID TAG</div>
                      <div className="text-gray-600">Printed</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <svg className="w-32 h-32 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9V2h12v7"></path>
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                
                {/* Animated printer head */}
                <div 
                  className="absolute left-0 right-0 h-1 bg-blue-600 transition-transform duration-300 ease-in-out"
                  style={{ 
                    top: `${10 + (progress * 0.12)}rem`,
                    transform: `translateX(${progress % 20 < 10 ? progress % 10 : 10 - (progress % 10)}px)`
                  }}
                ></div>
                
                {/* Paper coming out animation */}
                {progress > 50 && (
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 w-12 bg-white border border-gray-200"
                    style={{ 
                      top: '18rem',
                      height: `${(progress - 50) * 0.1}rem`,
                      maxHeight: '4rem'
                    }}
                  ></div>
                )}
              </div>
            )}
          </div>
          
          {!showPrintedPage && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-500">
                {progress < 30 && "Preparing label..."}
                {progress >= 30 && progress < 70 && "Sending to printer..."}
                {progress >= 70 && progress < 100 && "Printing..."}
                {progress === 100 && "Finishing..."}
              </div>
            </>
          )}
          
          {showPrintedPage && (
            <div className="text-center text-green-600 font-medium animate-fade-in">
              Label successfully printed!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintingAnimation; 
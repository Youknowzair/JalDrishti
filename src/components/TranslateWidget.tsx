import React, { useEffect, useRef } from 'react';

// Declare the Google Translate types
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: any;
      };
    };
  }
}

const TranslateWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Only run once
    if (scriptLoaded.current) return;
    
    // Create the Google Translate initialization function
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi,mr,te,ta,kn',
              layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL
            },
            'google-translate-element'
          );
          console.log('Google Translate widget initialized');
        } catch (error) {
          console.error('Error initializing Google Translate:', error);
        }
      }
    };

    // Load the Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      console.error('Failed to load Google Translate script');
    };
    
    script.onload = () => {
      scriptLoaded.current = true;
      console.log('Google Translate script loaded');
    };
    
    document.body.appendChild(script);
    
    // Clean up
    return () => {
      if (scriptLoaded.current && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      className="google-translate-container" 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        backgroundColor: '#ffffff',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        border: '2px solid #4285F4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}
    >
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '5px',
        color: '#4285F4'
      }}>
        Translate Page:
      </div>
      <div 
        id="google-translate-element" 
        ref={containerRef}
        style={{ minHeight: '40px', minWidth: '200px' }}
      ></div>
    </div>
  );
};

export default TranslateWidget;

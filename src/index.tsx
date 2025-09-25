import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
      translate: {
        TranslateElement: any;
      };
    };
  }
}

// Create a more visible translate container
const createTranslateContainer = () => {
  // First check if it already exists to avoid duplicates
  if (document.getElementById('google_translate_element')) {
    return;
  }
  
  const googleDiv = document.createElement('div');
  googleDiv.id = 'google_translate_element';
  googleDiv.style.position = 'fixed';
  googleDiv.style.top = '60px'; // Position it lower to make it more visible
  googleDiv.style.right = '20px';
  googleDiv.style.zIndex = '999999'; // Very high z-index to ensure visibility
  googleDiv.style.backgroundColor = '#f0f8ff'; // Light blue background
  googleDiv.style.padding = '8px';
  googleDiv.style.borderRadius = '4px';
  googleDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  googleDiv.style.border = '2px solid #007bff';
  googleDiv.innerHTML = '<span style="color:#007bff;font-weight:bold;display:block;margin-bottom:5px;">Translate:</span>';
  
  document.body.appendChild(googleDiv);
  
  console.log('Google Translate container created');
}

// Add Google Translate widget
function addGoogleTranslate() {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  
  script.onerror = function() {
    console.error('Failed to load Google Translate script');
  };
  
  script.onload = function() {
    console.log('Google Translate script loaded');
  };
  
  document.body.appendChild(script);

  window.googleTranslateElementInit = function() {
    try {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,te,ta,kn',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: true
        },
        'google_translate_element'
      );
      console.log('Google Translate initialized');
    } catch (e) {
      console.error('Error initializing Google Translate:', e);
    }
  };
}

// First render the React app, then add the translate widget
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
  () => {
    // After React has rendered, add the translate widget
    setTimeout(() => {
      createTranslateContainer();
      addGoogleTranslate();
    }, 1000); // Small delay to ensure DOM is ready
  }
);

// Also add a backup initialization in case the callback doesn't work
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!document.getElementById('google_translate_element') || 
        document.getElementById('google_translate_element').children.length === 1) {
      console.log('Adding Google Translate via window load event');
      createTranslateContainer();
      addGoogleTranslate();
    }
  }, 2000);
});

// Internationalization support for Hindi and English
export type Language = 'en' | 'hi';

export interface TranslationKeys {
  // Common
  welcome: string;
  login: string;
  logout: string;
  loading: string;
  submit: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  view: string;
  search: string;
  filter: string;
  export: string;
  
  // Navigation
  community: string;
  agent: string;
  admin: string;
  home: string;
  dashboard: string;
  reports: string;
  maps: string;
  settings: string;
  
  // Water Management
  waterGuard: string;
  reportProblem: string;
  viewUpdates: string;
  waterQualityTesting: string;
  waterAssets: string;
  hamlets: string;
  predictions: string;
  tasks: string;
  
  // Problem Types
  handpumpBroken: string;
  waterQuality: string;
  waterShortage: string;
  pipeLeakage: string;
  other: string;
  
  // Status
  pending: string;
  inProgress: string;
  resolved: string;
  functional: string;
  needsMaintenance: string;
  nonFunctional: string;
  
  // Priority
  low: string;
  medium: string;
  high: string;
  critical: string;
  
  // Forms
  title: string;
  description: string;
  location: string;
  photo: string;
  notes: string;
  problemType: string;
  phLevel: string;
  tdsLevel: string;
  contaminationLevel: string;
  turbidity: string;
  chlorineLevel: string;
  
  // Messages
  reportSubmitted: string;
  testSubmitted: string;
  dataSync: string;
  offlineMode: string;
  unauthorized: string;
  error: string;
  success: string;
  
  // Dashboard
  totalTasks: string;
  completedTasks: string;
  pendingTasks: string;
  todaysTasks: string;
  recentReports: string;
  aiPredictions: string;
  equityAnalysis: string;
  regionalMap: string;
  quickActions: string;
  
  // Actions
  captureLocation: string;
  takePhoto: string;
  syncData: string;
  assignTasks: string;
  manageUsers: string;
  exportReports: string;
  viewHeatmap: string;
  
  // Time
  daysAgo: string;
  hoursAgo: string;
  minutesAgo: string;
  today: string;
  yesterday: string;
  
  // Notifications
  locationCaptured: string;
  syncComplete: string;
  installApp: string;
  offlineReports: string;
}

const translations: Record<Language, TranslationKeys> = {
  en: {
    // Common
    welcome: "Welcome",
    login: "Login",
    logout: "Logout",
    loading: "Loading",
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    search: "Search",
    filter: "Filter",
    export: "Export",
    
    // Navigation
    community: "Community",
    agent: "Field Agent",
    admin: "Administrator",
    home: "Home",
    dashboard: "Dashboard",
    reports: "Reports",
    maps: "Maps",
    settings: "Settings",
    
    // Water Management
    waterGuard: "Water Guard",
    reportProblem: "Report Problem",
    viewUpdates: "View Updates",
    waterQualityTesting: "Water Quality Testing",
    waterAssets: "Water Assets",
    hamlets: "Hamlets",
    predictions: "Predictions",
    tasks: "Tasks",
    
    // Problem Types
    handpumpBroken: "Handpump Broken",
    waterQuality: "Water Quality Issue",
    waterShortage: "Water Shortage",
    pipeLeakage: "Pipe Leakage",
    other: "Other",
    
    // Status
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    functional: "Functional",
    needsMaintenance: "Needs Maintenance",
    nonFunctional: "Non-functional",
    
    // Priority
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    
    // Forms
    title: "Title",
    description: "Description",
    location: "Location",
    photo: "Photo",
    notes: "Notes",
    problemType: "Problem Type",
    phLevel: "pH Level",
    tdsLevel: "TDS Level",
    contaminationLevel: "Contamination Level",
    turbidity: "Turbidity",
    chlorineLevel: "Chlorine Level",
    
    // Messages
    reportSubmitted: "Report submitted successfully",
    testSubmitted: "Water quality test submitted successfully",
    dataSync: "Data synced successfully",
    offlineMode: "Offline Mode",
    unauthorized: "You are logged out. Logging in again...",
    error: "Error",
    success: "Success",
    
    // Dashboard
    totalTasks: "Total Tasks",
    completedTasks: "Completed",
    pendingTasks: "Pending",
    todaysTasks: "Today's Tasks",
    recentReports: "Recent Reports",
    aiPredictions: "AI Predictions",
    equityAnalysis: "Equity Analysis",
    regionalMap: "Regional Map",
    quickActions: "Quick Actions",
    
    // Actions
    captureLocation: "Capture Location",
    takePhoto: "Take Photo",
    syncData: "Sync Data",
    assignTasks: "Assign Tasks",
    manageUsers: "Manage Users",
    exportReports: "Export Reports",
    viewHeatmap: "View Heatmap",
    
    // Time
    daysAgo: "days ago",
    hoursAgo: "hours ago",
    minutesAgo: "minutes ago",
    today: "today",
    yesterday: "yesterday",
    
    // Notifications
    locationCaptured: "Location captured",
    syncComplete: "Data synchronized",
    installApp: "Install app for offline access",
    offlineReports: "reports stored locally",
  },
  
  hi: {
    // Common
    welcome: "स्वागत है",
    login: "लॉगिन करें",
    logout: "लॉगआउट",
    loading: "लोड हो रहा है",
    submit: "जमा करें",
    cancel: "रद्द करें",
    save: "सेव करें",
    delete: "डिलीट करें",
    edit: "संपादित करें",
    view: "देखें",
    search: "खोजें",
    filter: "फिल्टर",
    export: "निर्यात",
    
    // Navigation
    community: "समुदाय",
    agent: "फील्ड एजेंट",
    admin: "प्रशासक",
    home: "होम",
    dashboard: "डैशबोर्ड",
    reports: "रिपोर्ट्स",
    maps: "मानचित्र",
    settings: "सेटिंग्स",
    
    // Water Management
    waterGuard: "जल संरक्षण",
    reportProblem: "समस्या रिपोर्ट करें",
    viewUpdates: "अपडेट देखें",
    waterQualityTesting: "जल गुणवत्ता परीक्षण",
    waterAssets: "जल स्रोत",
    hamlets: "गांव",
    predictions: "भविष्यवाणी",
    tasks: "कार्य",
    
    // Problem Types
    handpumpBroken: "हैंडपंप खराब",
    waterQuality: "पानी की गुणवत्ता",
    waterShortage: "पानी की कमी",
    pipeLeakage: "पाइप लीकेज",
    other: "अन्य",
    
    // Status
    pending: "लंबित",
    inProgress: "प्रगति में",
    resolved: "हल हो गया",
    functional: "कार्यशील",
    needsMaintenance: "रखरखाव चाहिए",
    nonFunctional: "गैर-कार्यशील",
    
    // Priority
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    critical: "गंभीर",
    
    // Forms
    title: "शीर्षक",
    description: "विवरण",
    location: "स्थान",
    photo: "फोटो",
    notes: "टिप्पणी",
    problemType: "समस्या का प्रकार",
    phLevel: "पीएच स्तर",
    tdsLevel: "टीडीएस स्तर",
    contaminationLevel: "संदूषण स्तर",
    turbidity: "टर्बिडिटी",
    chlorineLevel: "क्लोरीन स्तर",
    
    // Messages
    reportSubmitted: "रिपोर्ट सफलतापूर्वक जमा की गई",
    testSubmitted: "जल गुणवत्ता परीक्षण सफलतापूर्वक जमा किया गया",
    dataSync: "डेटा सफलतापूर्वक सिंक हो गया",
    offlineMode: "ऑफलाइन मोड",
    unauthorized: "आप लॉग आउट हो गए हैं। फिर से लॉगिन कर रहे हैं...",
    error: "त्रुटि",
    success: "सफलता",
    
    // Dashboard
    totalTasks: "कुल कार्य",
    completedTasks: "पूर्ण",
    pendingTasks: "लंबित",
    todaysTasks: "आज के कार्य",
    recentReports: "हाल की रिपोर्ट्स",
    aiPredictions: "AI भविष्यवाणी",
    equityAnalysis: "इक्विटी विश्लेषण",
    regionalMap: "क्षेत्रीय मानचित्र",
    quickActions: "त्वरित कार्य",
    
    // Actions
    captureLocation: "स्थान कैप्चर करें",
    takePhoto: "फोटो लें",
    syncData: "डेटा सिंक करें",
    assignTasks: "कार्य असाइन करें",
    manageUsers: "उपयोगकर्ता प्रबंधन",
    exportReports: "रिपोर्ट निर्यात करें",
    viewHeatmap: "हीटमैप देखें",
    
    // Time
    daysAgo: "दिन पहले",
    hoursAgo: "घंटे पहले",
    minutesAgo: "मिनट पहले",
    today: "आज",
    yesterday: "कल",
    
    // Notifications
    locationCaptured: "स्थान कैप्चर हो गया",
    syncComplete: "डेटा सिंक्रोनाइज़ हो गया",
    installApp: "ऑफलाइन एक्सेस के लिए ऐप इंस्टॉल करें",
    offlineReports: "रिपोर्ट्स स्थानीय रूप से संग्रहीत",
  }
};

// Current language state
let currentLanguage: Language = 'en';

// Get current language
export const getCurrentLanguage = (): Language => currentLanguage;

// Set language
export const setLanguage = (lang: Language): void => {
  currentLanguage = lang;
  localStorage.setItem('water-guard-lang', lang);
  
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
};

// Get translation
export const t = (key: keyof TranslationKeys): string => {
  return translations[currentLanguage][key] || translations.en[key] || key;
};

// Get bilingual text (Hindi | English format)
export const tBilingual = (key: keyof TranslationKeys): string => {
  const hi = translations.hi[key] || key;
  const en = translations.en[key] || key;
  return `${hi} | ${en}`;
};

// Initialize language from localStorage
export const initializeLanguage = (): void => {
  const savedLang = localStorage.getItem('water-guard-lang') as Language;
  if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
    currentLanguage = savedLang;
  } else {
    // Detect user's preferred language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('hi')) {
      currentLanguage = 'hi';
    } else {
      currentLanguage = 'en';
    }
  }
};

// Format relative time
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays > 1) {
    return `${diffInDays} ${t('daysAgo')}`;
  } else if (diffInDays === 1) {
    return t('yesterday');
  } else if (diffInHours > 1) {
    return `${diffInHours} ${t('hoursAgo')}`;
  } else if (diffInMinutes > 1) {
    return `${diffInMinutes} ${t('minutesAgo')}`;
  } else {
    return t('today');
  }
};

// Format date for display
export const formatDate = (date: string | Date): string => {
  const targetDate = new Date(date);
  
  if (currentLanguage === 'hi') {
    return targetDate.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    return targetDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

import { useState, useEffect } from "react";

// React hook for using translations
export const useTranslation = () => {
  const [language, setCurrentLang] = useState(currentLanguage);
  
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setCurrentLang(event.detail);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);
  
  return {
    t,
    tBilingual,
    language,
    setLanguage,
    formatRelativeTime,
    formatDate,
  };
};

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeLanguage();
}

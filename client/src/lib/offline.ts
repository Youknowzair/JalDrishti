// Offline functionality and PWA support
interface OfflineData {
  problemReports: any[];
  waterQualityTests: any[];
  lastSync: string;
}

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data: any;
  timestamp: string;
  retryCount: number;
}

class OfflineManager {
  private dbName = 'WaterGuardOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private requestQueue: QueuedRequest[] = [];
  private isOnline = navigator.onLine;
  private maxRetries = 3;

  constructor() {
    this.initDB();
    this.setupEventListeners();
    this.loadRequestQueue();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('problemReports')) {
          const problemReportsStore = db.createObjectStore('problemReports', { keyPath: 'id' });
          problemReportsStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('waterQualityTests')) {
          const testsStore = db.createObjectStore('waterQualityTests', { keyPath: 'id' });
          testsStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('requestQueue')) {
          const queueStore = db.createObjectStore('requestQueue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('offlineData')) {
          db.createObjectStore('offlineData', { keyPath: 'key' });
        }
      };
    });
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processRequestQueue();
      this.dispatchEvent('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.dispatchEvent('offline');
    });

    // Periodic sync when online
    setInterval(() => {
      if (this.isOnline && this.requestQueue.length > 0) {
        this.processRequestQueue();
      }
    }, 30000); // Every 30 seconds
  }

  // Store data offline
  async storeOfflineData(storeName: string, data: any): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put({
        ...data,
        id: data.id || this.generateId(),
        timestamp: new Date().toISOString(),
        isOffline: true
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get offline data
  async getOfflineData(storeName: string): Promise<any[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Queue API request for later
  async queueRequest(method: string, url: string, data: any): Promise<string> {
    const requestId = this.generateId();
    const queuedRequest: QueuedRequest = {
      id: requestId,
      method,
      url,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    this.requestQueue.push(queuedRequest);
    await this.saveRequestQueue();
    
    // Also store the data locally based on the endpoint
    if (url.includes('/problem-reports')) {
      await this.storeOfflineData('problemReports', data);
    } else if (url.includes('/water-quality-tests')) {
      await this.storeOfflineData('waterQualityTests', data);
    }

    this.dispatchEvent('dataQueued', { requestId, data });
    return requestId;
  }

  // Process queued requests when online
  private async processRequestQueue(): Promise<void> {
    if (!this.isOnline || this.requestQueue.length === 0) return;

    const requestsToProcess = [...this.requestQueue];
    
    for (const request of requestsToProcess) {
      try {
        await this.executeRequest(request);
        
        // Remove from queue on success
        this.requestQueue = this.requestQueue.filter(r => r.id !== request.id);
        
        // Remove from offline storage
        await this.removeOfflineItem(request);
        
      } catch (error) {
        console.error('Failed to sync request:', error);
        
        // Increment retry count
        const requestIndex = this.requestQueue.findIndex(r => r.id === request.id);
        if (requestIndex !== -1) {
          this.requestQueue[requestIndex].retryCount++;
          
          // Remove if max retries exceeded
          if (this.requestQueue[requestIndex].retryCount >= this.maxRetries) {
            this.requestQueue.splice(requestIndex, 1);
            this.dispatchEvent('syncFailed', { request, error });
          }
        }
      }
    }

    await this.saveRequestQueue();
    this.dispatchEvent('syncComplete', { processedCount: requestsToProcess.length });
  }

  private async executeRequest(request: QueuedRequest): Promise<any> {
    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: request.data ? JSON.stringify(request.data) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async removeOfflineItem(request: QueuedRequest): Promise<void> {
    if (!this.db) return;

    let storeName = '';
    if (request.url.includes('/problem-reports')) {
      storeName = 'problemReports';
    } else if (request.url.includes('/water-quality-tests')) {
      storeName = 'waterQualityTests';
    }

    if (!storeName) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Find and remove the item with matching data
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const items = getAllRequest.result;
        const itemToRemove = items.find(item => 
          item.isOffline && 
          JSON.stringify(item.data || item) === JSON.stringify(request.data)
        );
        
        if (itemToRemove) {
          const deleteRequest = store.delete(itemToRemove.id);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          resolve();
        }
      };
      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  }

  private async saveRequestQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['requestQueue'], 'readwrite');
      const store = transaction.objectStore('requestQueue');
      
      // Clear existing queue
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        // Add all current queue items
        let pending = this.requestQueue.length;
        if (pending === 0) {
          resolve();
          return;
        }

        this.requestQueue.forEach(request => {
          const addRequest = store.add(request);
          addRequest.onsuccess = () => {
            pending--;
            if (pending === 0) resolve();
          };
          addRequest.onerror = () => reject(addRequest.error);
        });
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  private async loadRequestQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['requestQueue'], 'readonly');
      const store = transaction.objectStore('requestQueue');
      const request = store.getAll();

      request.onsuccess = () => {
        this.requestQueue = request.result || [];
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get offline statistics
  async getOfflineStats(): Promise<{
    queuedRequests: number;
    offlineReports: number;
    offlineTests: number;
    lastSync: string | null;
  }> {
    const reports = await this.getOfflineData('problemReports');
    const tests = await this.getOfflineData('waterQualityTests');
    
    // Get last sync time
    const lastSync = localStorage.getItem('water-guard-last-sync');

    return {
      queuedRequests: this.requestQueue.length,
      offlineReports: reports.filter(r => r.isOffline).length,
      offlineTests: tests.filter(t => t.isOffline).length,
      lastSync
    };
  }

  // Force sync
  async forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    await this.processRequestQueue();
    localStorage.setItem('water-guard-last-sync', new Date().toISOString());
  }

  // Check if online
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Get connection info
  getConnectionInfo(): { type: string; downlink?: number; effectiveType?: string } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        type: connection.type || 'unknown',
        downlink: connection.downlink,
        effectiveType: connection.effectiveType
      };
    }

    return { type: 'unknown' };
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private dispatchEvent(type: string, detail?: any): void {
    window.dispatchEvent(new CustomEvent(`offline:${type}`, { detail }));
  }

  // Clean up old offline data
  async cleanupOldData(daysOld: number = 30): Promise<void> {
    if (!this.db) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffTime = cutoffDate.toISOString();

    const stores = ['problemReports', 'waterQualityTests'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoffTime);
        
        const deleteRequest = index.openCursor(range);
        deleteRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        deleteRequest.onerror = () => reject(deleteRequest.error);
      });
    }
  }
}

// Create singleton instance
const offlineManager = new OfflineManager();

// Export functions for use in components
export const storeOfflineData = (storeName: string, data: any) => 
  offlineManager.storeOfflineData(storeName, data);

export const getOfflineData = (storeName: string) => 
  offlineManager.getOfflineData(storeName);

export const queueRequest = (method: string, url: string, data: any) => 
  offlineManager.queueRequest(method, url, data);

export const getOfflineStats = () => 
  offlineManager.getOfflineStats();

export const forceSync = () => 
  offlineManager.forceSync();

export const isOnline = () => 
  offlineManager.isOnlineStatus();

export const getConnectionInfo = () => 
  offlineManager.getConnectionInfo();

export const cleanupOldData = (daysOld?: number) => 
  offlineManager.cleanupOldData(daysOld);

import { useState, useEffect } from "react";

// React hook for offline functionality
export const useOffline = () => {
  const [isOnlineStatus, setIsOnlineStatus] = useState(offlineManager.isOnlineStatus());
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnlineStatus(true);
    const handleOffline = () => setIsOnlineStatus(false);
    const handleSyncComplete = () => updateStats();
    const handleDataQueued = () => updateStats();

    window.addEventListener('offline:online', handleOnline);
    window.addEventListener('offline:offline', handleOffline);
    window.addEventListener('offline:syncComplete', handleSyncComplete);
    window.addEventListener('offline:dataQueued', handleDataQueued);

    // Initial stats load
    updateStats();

    return () => {
      window.removeEventListener('offline:online', handleOnline);
      window.removeEventListener('offline:offline', handleOffline);
      window.removeEventListener('offline:syncComplete', handleSyncComplete);
      window.removeEventListener('offline:dataQueued', handleDataQueued);
    };
  }, []);

  const updateStats = async () => {
    try {
      const newStats = await getOfflineStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to get offline stats:', error);
    }
  };

  const syncNow = async () => {
    setIsLoading(true);
    try {
      await forceSync();
      await updateStats();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOnline: isOnlineStatus,
    stats,
    syncNow,
    isLoading,
    storeOfflineData,
    getOfflineData,
    queueRequest,
    getConnectionInfo,
  };
};

export default offlineManager;

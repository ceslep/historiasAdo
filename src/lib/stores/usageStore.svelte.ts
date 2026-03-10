export interface UsageStats {
  searchCount: number;
  pdfExportCount: number;
  historyViewCount: number;
  lastActive: number | null;
}

const defaultStats: UsageStats = {
  searchCount: 0,
  pdfExportCount: 0,
  historyViewCount: 0,
  lastActive: null,
};

// Use the base URL for the API
const API_URL = 'https://app.iedeoccidente.com/ado/usage.php';

let statsState = $state<UsageStats>(defaultStats);
let isInitializing = false;

async function loadStats() {
  if (isInitializing) return;
  isInitializing = true;
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const data = await response.json();
      statsState = { ...defaultStats, ...data };
    }
  } catch (err) {
    console.error('Error loading usage stats from API', err);
  } finally {
    isInitializing = false;
  }
}

async function sendAction(action: 'trackSearch' | 'trackPdfExport' | 'trackHistoryView' | 'resetStats') {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });
    
    if (response.ok) {
        const data = await response.json();
        statsState = { ...defaultStats, ...data };
    }
  } catch (err) {
    console.error('Error sending usage action to API', err);
  }
}

// Initial load
loadStats();

export const usageStore = {
  get stats() {
    return statsState;
  },

  trackSearch() {
    // Optimistic UI update
    statsState.searchCount++;
    statsState.lastActive = Date.now();
    sendAction('trackSearch');
  },

  trackPdfExport() {
    statsState.pdfExportCount++;
    statsState.lastActive = Date.now();
    sendAction('trackPdfExport');
  },

  trackHistoryView() {
    statsState.historyViewCount++;
    statsState.lastActive = Date.now();
    sendAction('trackHistoryView');
  },

  resetStats() {
    statsState = { ...defaultStats, lastActive: Date.now() };
    sendAction('resetStats');
  },
  
  refresh() {
    loadStats();
  }
};

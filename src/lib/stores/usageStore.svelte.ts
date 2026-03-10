export interface UsageStats {
  searchCount: number;
  pdfExportCount: number;
  historyViewCount: number;
  lastActive: number | null;
}

const STORAGE_KEY = 'historiasado_usage_stats';

const defaultStats: UsageStats = {
  searchCount: 0,
  pdfExportCount: 0,
  historyViewCount: 0,
  lastActive: null,
};

function loadStats(): UsageStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultStats;
    const parsed = JSON.parse(stored);
    return { ...defaultStats, ...parsed };
  } catch (err) {
    console.error('Error loading usage stats from localStorage', err);
    return defaultStats;
  }
}

function saveStats(stats: UsageStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Error saving usage stats to localStorage', err);
  }
}

let statsState = $state<UsageStats>(loadStats());

function updateStats(updater: (stats: UsageStats) => Partial<UsageStats>) {
  const updates = updater(statsState);
  statsState = { ...statsState, ...updates, lastActive: Date.now() };
  saveStats(statsState);
}

export const usageStore = {
  get stats() {
    return statsState;
  },

  trackSearch() {
    updateStats((s) => ({ searchCount: s.searchCount + 1 }));
  },

  trackPdfExport() {
    updateStats((s) => ({ pdfExportCount: s.pdfExportCount + 1 }));
  },

  trackHistoryView() {
    updateStats((s) => ({ historyViewCount: s.historyViewCount + 1 }));
  },

  resetStats() {
    statsState = { ...defaultStats, lastActive: Date.now() };
    saveStats(statsState);
  }
};

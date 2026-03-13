export interface ClientSession {
  timestamp: number;
  date: string;
  ip: string;
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  device: string;
  acceptLanguage: string;
  referer: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  devicePixelRatio: number | null;
  colorDepth: number | null;
  timezone: string | null;
  language: string | null;
  languages: string[] | null;
  platform: string | null;
  cookiesEnabled: boolean | null;
  online: boolean | null;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  maxTouchPoints: number | null;
  connection: string | null;
  standalone: boolean | null;
  // Client geolocation
  geoLat: number | null;
  geoLon: number | null;
  geoAccuracy: number | null;
  // Server IP geolocation
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  ipLat: number | null;
  ipLon: number | null;
  isp: string | null;
  org: string | null;
  as: string | null;
  zipCode: string | null;
  ipTimezone: string | null;
  mobile: boolean | null;
  proxy: boolean | null;
  hosting: boolean | null;
}

export interface UsageStats {
  searchCount: number;
  pdfExportCount: number;
  historyViewCount: number;
  appOpenCount: number;
  lastActive: number | null;
  sessions?: ClientSession[];
}

const defaultStats: UsageStats = {
  searchCount: 0,
  pdfExportCount: 0,
  historyViewCount: 0,
  appOpenCount: 0,
  lastActive: null,
};

// Use the base URL for the API
const API_URL = 'https://app.iedeoccidente.com/ado/usage.php';

let statsState = $state<UsageStats>(defaultStats);
let sessionsState = $state<ClientSession[]>([]);
let isInitializing = false;

async function loadStats(includeSessions = false) {
  if (isInitializing) return;
  isInitializing = true;
  try {
    const url = includeSessions ? `${API_URL}?sessions` : API_URL;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const { sessions, ...rest } = data;
      statsState = { ...defaultStats, ...rest };
      if (sessions) {
        sessionsState = sessions;
      }
    }
  } catch (err) {
    console.error('Error loading usage stats from API', err);
  } finally {
    isInitializing = false;
  }
}

function collectClientInfo(): Record<string, unknown> {
  const nav = navigator as Record<string, unknown>;
  const conn = (nav.connection || nav.mozConnection || nav.webkitConnection) as
    Record<string, unknown> | undefined;

  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    languages: [...navigator.languages],
    platform: navigator.userAgent.includes('Win') ? 'Windows'
      : navigator.userAgent.includes('Mac') ? 'macOS'
      : navigator.userAgent.includes('Linux') ? 'Linux'
      : navigator.userAgent.includes('Android') ? 'Android'
      : navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? 'iOS'
      : 'Otro',
    cookiesEnabled: navigator.cookieEnabled,
    online: navigator.onLine,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemory: (nav.deviceMemory as number) || null,
    maxTouchPoints: navigator.maxTouchPoints,
    connection: conn ? `${conn.effectiveType || 'unknown'}` +
      (conn.downlink ? ` ${conn.downlink}Mbps` : '') +
      (conn.rtt ? ` ${conn.rtt}ms` : '') : null,
    standalone: window.matchMedia('(display-mode: standalone)').matches
      || (nav as Record<string, unknown>).standalone === true,
  };
}

/**
 * Try to get browser geolocation (requires user permission).
 * Returns quickly with null if denied or unavailable.
 */
function getBrowserGeolocation(): Promise<{
  geoLat: number; geoLon: number; geoAccuracy: number;
} | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    // Timeout after 5s so we don't block the request
    const timer = setTimeout(() => resolve(null), 5000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({
          geoLat: pos.coords.latitude,
          geoLon: pos.coords.longitude,
          geoAccuracy: pos.coords.accuracy,
        });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 300000 }
    );
  });
}

type ActionType = 'trackSearch' | 'trackPdfExport' | 'trackHistoryView' | 'trackAppOpen' | 'resetStats';

async function sendAction(action: ActionType, extra?: Record<string, unknown>) {
  try {
    const body: Record<string, unknown> = { action, ...extra };
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      statsState = { ...defaultStats, ...data };
    }
  } catch (err) {
    console.error('Error sending usage action to API', err);
  }
}

// Initial load (without sessions for speed)
loadStats();

export const usageStore = {
  get stats() {
    return statsState;
  },

  get sessions() {
    return sessionsState;
  },

  trackSearch() {
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

  async trackAppOpen() {
    statsState.appOpenCount++;
    statsState.lastActive = Date.now();
    const clientInfo = collectClientInfo();
    // Try to get browser geolocation (non-blocking, 5s max)
    const geo = await getBrowserGeolocation();
    if (geo) {
      clientInfo.geoLat = geo.geoLat;
      clientInfo.geoLon = geo.geoLon;
      clientInfo.geoAccuracy = geo.geoAccuracy;
    }
    sendAction('trackAppOpen', { clientInfo });
  },

  resetStats() {
    statsState = { ...defaultStats, lastActive: Date.now() };
    sessionsState = [];
    sendAction('resetStats');
  },

  refresh() {
    loadStats();
  },

  loadSessions() {
    loadStats(true);
  },
};

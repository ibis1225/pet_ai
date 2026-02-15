// Analytics event tracking for PetAI
// Tracks business recommendations, clicks, and user interactions

export interface AnalyticsEvent {
  id: string;
  type: 'chat_recommendation' | 'business_click' | 'business_map_click' | 'business_call_click' | 'business_direction_click';
  category?: string; // business category: veterinary, grooming, etc.
  businessName?: string;
  source: 'chat' | 'business_page' | 'home';
  timestamp: string;
}

const STORAGE_KEY = 'petai_analytics';

function getEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveEvents(events: AnalyticsEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
  const events = getEvents();
  events.push({
    ...event,
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
  });
  saveEvents(events);
}

// Statistics helpers
export interface BusinessStats {
  category: string;
  categoryLabel: string;
  chatRecommendations: number;
  pageClicks: number;
  mapClicks: number;
  callClicks: number;
  directionClicks: number;
  totalInteractions: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  veterinary: '동물병원',
  grooming: '미용실',
  training: '훈련소',
  hotel: '호텔',
  daycare: '유치원',
  cafe: '카페',
  insurance: '보험',
  pet_shop: '펫샵',
  funeral: '장례',
};

export function getStats(): {
  totalEvents: number;
  byCategory: BusinessStats[];
  recentEvents: AnalyticsEvent[];
  dailyCounts: { date: string; count: number }[];
} {
  const events = getEvents();

  // By category
  const categories = new Set(events.map((e) => e.category).filter(Boolean));
  const byCategory: BusinessStats[] = Array.from(categories).map((cat) => {
    const catEvents = events.filter((e) => e.category === cat);
    return {
      category: cat!,
      categoryLabel: CATEGORY_LABELS[cat!] || cat!,
      chatRecommendations: catEvents.filter((e) => e.type === 'chat_recommendation').length,
      pageClicks: catEvents.filter((e) => e.type === 'business_click').length,
      mapClicks: catEvents.filter((e) => e.type === 'business_map_click').length,
      callClicks: catEvents.filter((e) => e.type === 'business_call_click').length,
      directionClicks: catEvents.filter((e) => e.type === 'business_direction_click').length,
      totalInteractions: catEvents.length,
    };
  }).sort((a, b) => b.totalInteractions - a.totalInteractions);

  // Daily counts (last 30 days)
  const dailyMap: Record<string, number> = {};
  events.forEach((e) => {
    const date = e.timestamp.slice(0, 10);
    dailyMap[date] = (dailyMap[date] || 0) + 1;
  });
  const dailyCounts = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  return {
    totalEvents: events.length,
    byCategory,
    recentEvents: events.slice(-50).reverse(),
    dailyCounts,
  };
}

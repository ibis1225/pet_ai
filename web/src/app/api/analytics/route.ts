import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'analytics-data.json');

interface AnalyticsEvent {
  id: string;
  type: string;
  category?: string;
  businessName?: string;
  source: string;
  timestamp: string;
}

async function readEvents(): Promise<AnalyticsEvent[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeEvents(events: AnalyticsEvent[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2));
}

// POST: Track new event
export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const events = await readEvents();

    events.push({
      ...event,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
    });

    await writeEvents(events);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Return stats (with CORS for admin site)
export async function GET() {
  const events = await readEvents();

  const CATEGORY_LABELS: Record<string, string> = {
    veterinary: '동물병원', grooming: '미용실', training: '훈련소',
    hotel: '호텔', daycare: '유치원', cafe: '카페',
    insurance: '보험', pet_shop: '펫샵', funeral: '장례',
  };

  // By category
  const categories = [...new Set(events.map((e) => e.category).filter(Boolean))];
  const byCategory = categories.map((cat) => {
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

  // Daily counts
  const dailyMap: Record<string, number> = {};
  events.forEach((e) => {
    const date = e.timestamp.slice(0, 10);
    dailyMap[date] = (dailyMap[date] || 0) + 1;
  });
  const dailyCounts = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const response = NextResponse.json({
    totalEvents: events.length,
    byCategory,
    recentEvents: events.slice(-50).reverse(),
    dailyCounts,
  });

  // Allow admin site (port 3000) to access
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST');

  return response;
}

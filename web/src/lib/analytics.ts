// Analytics event tracking for PetAI
// Sends events to /api/analytics (server-side storage)

export function trackEvent(event: {
  type: 'chat_recommendation' | 'business_click' | 'business_map_click' | 'business_call_click' | 'business_direction_click';
  category?: string;
  businessName?: string;
  source: string;
}) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {});
}

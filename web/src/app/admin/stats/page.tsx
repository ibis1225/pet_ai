'use client';
import { useState, useEffect } from 'react';
import { getStats, type BusinessStats, type AnalyticsEvent } from '@/lib/analytics';

const EVENT_TYPE_LABELS: Record<string, string> = {
  chat_recommendation: 'AI 채팅 추천',
  business_click: '업체 클릭',
  business_map_click: '지도 클릭',
  business_call_click: '전화 클릭',
  business_direction_click: '길찾기 클릭',
};

export default function StatsPage() {
  const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">PetAI 매칭 통계</h1>
          <p className="text-sm text-gray-500 mt-1">업체 추천 및 고객 매칭 현황</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryCard label="총 이벤트" value={stats.totalEvents} icon="📊" color="bg-blue-50 text-blue-600" />
          <SummaryCard label="AI 추천" value={stats.byCategory.reduce((s, c) => s + c.chatRecommendations, 0)} icon="🤖" color="bg-purple-50 text-purple-600" />
          <SummaryCard label="업체 클릭" value={stats.byCategory.reduce((s, c) => s + c.pageClicks, 0)} icon="🏪" color="bg-orange-50 text-[#FF6B35]" />
          <SummaryCard label="전화/길찾기" value={stats.byCategory.reduce((s, c) => s + c.callClicks + c.directionClicks, 0)} icon="📞" color="bg-green-50 text-green-600" />
        </div>

        {/* Category Stats Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">카테고리별 매칭 현황</h2>
          </div>
          {stats.byCategory.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              아직 데이터가 없습니다. AI 채팅에서 상담하면 통계가 쌓입니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">카테고리</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600">AI 추천</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600">업체 클릭</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600">지도 클릭</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600">전화</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600">길찾기</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600 text-[#FF6B35]">총 매칭</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byCategory.map((cat) => (
                    <tr key={cat.category} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{cat.categoryLabel}</td>
                      <td className="text-center px-3 py-3">{cat.chatRecommendations}</td>
                      <td className="text-center px-3 py-3">{cat.pageClicks}</td>
                      <td className="text-center px-3 py-3">{cat.mapClicks}</td>
                      <td className="text-center px-3 py-3">{cat.callClicks}</td>
                      <td className="text-center px-3 py-3">{cat.directionClicks}</td>
                      <td className="text-center px-3 py-3 font-bold text-[#FF6B35]">{cat.totalInteractions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Daily Chart (simple bar) */}
        {stats.dailyCounts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">일별 이벤트 수</h2>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-1 h-32">
                {stats.dailyCounts.map((day) => {
                  const max = Math.max(...stats.dailyCounts.map((d) => d.count));
                  const height = max > 0 ? (day.count / max) * 100 : 0;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-500">{day.count}</span>
                      <div
                        className="w-full bg-[#FF6B35] rounded-t-sm min-h-[2px]"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[9px] text-gray-400 -rotate-45 origin-center whitespace-nowrap">
                        {day.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">최근 이벤트</h2>
            <span className="text-xs text-gray-400">최근 50개</span>
          </div>
          {stats.recentEvents.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">이벤트가 없습니다</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {stats.recentEvents.map((event) => (
                <div key={event.id} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-lg">
                    {event.type === 'chat_recommendation' ? '🤖' :
                     event.type === 'business_click' ? '🏪' :
                     event.type === 'business_map_click' ? '🗺️' :
                     event.type === 'business_call_click' ? '📞' : '🧭'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {EVENT_TYPE_LABELS[event.type] || event.type}
                      {event.businessName && ` - ${event.businessName}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {event.category && `${event.category} · `}
                      {new Date(event.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

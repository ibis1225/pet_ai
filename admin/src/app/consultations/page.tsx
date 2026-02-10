"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  Consultation,
  ConsultationStats,
  ConsultationStatus,
  ConsultationCategory,
  ConsultationUrgency,
  PaginatedResponse,
} from "@/types";

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  in_progress: "진행중",
  pending: "대기중",
  assigned: "배정됨",
  completed: "완료",
  cancelled: "취소됨",
};

const STATUS_COLORS: Record<ConsultationStatus, string> = {
  in_progress: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const CATEGORY_LABELS: Record<ConsultationCategory, string> = {
  health: "건강 상담",
  behavior: "행동 상담",
  nutrition: "영양/사료 상담",
  grooming: "미용 상담",
  training: "훈련 상담",
  emergency: "응급 상담",
  insurance: "보험 상담",
  other: "기타 상담",
};

const URGENCY_LABELS: Record<ConsultationUrgency, string> = {
  normal: "일반",
  urgent: "긴급",
  emergency: "응급",
};

const URGENCY_COLORS: Record<ConsultationUrgency, string> = {
  normal: "bg-green-100 text-green-800",
  urgent: "bg-yellow-100 text-yellow-800",
  emergency: "bg-red-100 text-red-800",
};

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ConsultationStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<ConsultationCategory | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchConsultations();
  }, [page, statusFilter, categoryFilter]);

  const fetchStats = async () => {
    try {
      const response = await api.get<ConsultationStats>("/consultations/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        page_size: 20,
      };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await api.get<PaginatedResponse<Consultation> & { total_pages: number }>(
        "/consultations",
        { params }
      );
      setConsultations(response.data.items);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Failed to fetch consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchConsultations();
  };

  const handleStatusChange = async (id: string, newStatus: ConsultationStatus) => {
    try {
      await api.patch(`/consultations/${id}`, { status: newStatus });
      fetchConsultations();
      fetchStats();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">상담 관리</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">전체</p>
            <p className="text-2xl font-bold">{stats.total_consultations}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <p className="text-sm text-yellow-600">대기중</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-blue-600">진행중</p>
            <p className="text-2xl font-bold text-blue-700">{stats.in_progress}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <p className="text-sm text-purple-600">배정됨</p>
            <p className="text-2xl font-bold text-purple-700">{stats.assigned}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-green-600">완료</p>
            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-4">
            <p className="text-sm text-orange-600">오늘</p>
            <p className="text-2xl font-bold text-orange-700">{stats.today_count}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="검색 (이름, 전화번호, 상담번호)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ConsultationStatus | "");
              setPage(1);
            }}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 상태</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as ConsultationCategory | "");
              setPage(1);
            }}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 카테고리</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            검색
          </button>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상담번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                보호자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                반려동물
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                긴급도
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                신청일시
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  로딩 중...
                </td>
              </tr>
            ) : consultations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  상담 내역이 없습니다.
                </td>
              </tr>
            ) : (
              consultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">
                      {consultation.consultation_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{consultation.guardian_name || "-"}</div>
                    <div className="text-sm text-gray-500">{consultation.guardian_phone || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{consultation.pet_name || "-"}</div>
                    <div className="text-sm text-gray-500">
                      {consultation.pet_type === "dog"
                        ? "강아지"
                        : consultation.pet_type === "cat"
                        ? "고양이"
                        : "-"}
                      {consultation.pet_age && ` / ${consultation.pet_age}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {consultation.category
                        ? CATEGORY_LABELS[consultation.category]
                        : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {consultation.urgency && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          URGENCY_COLORS[consultation.urgency]
                        }`}
                      >
                        {URGENCY_LABELS[consultation.urgency]}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_COLORS[consultation.status]
                      }`}
                    >
                      {STATUS_LABELS[consultation.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(consultation.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedConsultation(consultation)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      상세
                    </button>
                    {consultation.status === "pending" && (
                      <button
                        onClick={() => handleStatusChange(consultation.id, "assigned")}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        배정
                      </button>
                    )}
                    {(consultation.status === "assigned" ||
                      consultation.status === "pending") && (
                      <button
                        onClick={() => handleStatusChange(consultation.id, "completed")}
                        className="text-green-600 hover:text-green-900"
                      >
                        완료
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages} 페이지
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  상담 상세 - {selectedConsultation.consultation_number}
                </h2>
                <button
                  onClick={() => setSelectedConsultation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">보호자 이름</p>
                    <p className="font-medium">
                      {selectedConsultation.guardian_name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">연락처</p>
                    <p className="font-medium">
                      {selectedConsultation.guardian_phone || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">반려동물 이름</p>
                    <p className="font-medium">
                      {selectedConsultation.pet_name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">반려동물 종류/나이</p>
                    <p className="font-medium">
                      {selectedConsultation.pet_type === "dog"
                        ? "강아지"
                        : selectedConsultation.pet_type === "cat"
                        ? "고양이"
                        : "-"}{" "}
                      / {selectedConsultation.pet_age || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">상담 분야</p>
                    <p className="font-medium">
                      {selectedConsultation.category
                        ? CATEGORY_LABELS[selectedConsultation.category]
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">긴급도</p>
                    {selectedConsultation.urgency && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          URGENCY_COLORS[selectedConsultation.urgency]
                        }`}
                      >
                        {URGENCY_LABELS[selectedConsultation.urgency]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">희망 상담 시간</p>
                    <p className="font-medium">
                      {selectedConsultation.preferred_time || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">상태</p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        STATUS_COLORS[selectedConsultation.status]
                      }`}
                    >
                      {STATUS_LABELS[selectedConsultation.status]}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">상담 내용</p>
                  <p className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {selectedConsultation.description || "내용 없음"}
                  </p>
                </div>

                {selectedConsultation.admin_notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">관리자 메모</p>
                    <p className="p-3 bg-yellow-50 rounded-lg whitespace-pre-wrap">
                      {selectedConsultation.admin_notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => setSelectedConsultation(null)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    닫기
                  </button>
                  {selectedConsultation.status !== "completed" &&
                    selectedConsultation.status !== "cancelled" && (
                      <button
                        onClick={() => {
                          handleStatusChange(selectedConsultation.id, "completed");
                          setSelectedConsultation(null);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        상담 완료
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
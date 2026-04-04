/**
 * DashboardService — dashboard API calls.
 * Constitution: CLAUDE.md #66
 */
import apiClient from '@/shared/lib/apiClient';

export async function fetchSummary(dateFrom = null, dateTo = null) {
  const params = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo)   params.date_to   = dateTo;
  const response = await apiClient.get('/v1/dashboard/summary', { params });
  return response.data.data;
}

export async function fetchInsights(dateFrom = null, dateTo = null) {
  const params = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo)   params.date_to   = dateTo;
  const response = await apiClient.get('/v1/dashboard/insights', { params });
  return response.data.data;
}

export function connectLiveStream(onUpdate) {
  // TODO(session-12): fetch-based SSE (EventSource lacks auth header support)
  return () => {};
}

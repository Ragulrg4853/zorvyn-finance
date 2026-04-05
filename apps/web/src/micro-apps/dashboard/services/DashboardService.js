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
  const controller = new AbortController();
  const token = typeof window !== 'undefined' ? window.__zorvyn_token : null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

  if (!token) return () => {};

  fetch(`${baseUrl}/v1/dashboard/live`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    signal: controller.signal
  })
    .then(async (response) => {
      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr) {
              try {
                onUpdate(JSON.parse(dataStr));
              } catch (e) {
                console.error("SSE parse error", e);
              }
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') console.error('SSE Error:', err);
    });

  return () => controller.abort();
}

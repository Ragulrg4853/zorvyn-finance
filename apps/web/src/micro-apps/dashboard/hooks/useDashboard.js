import { useState, useEffect, useCallback } from 'react';
import { fetchSummary, fetchInsights, connectLiveStream } from '../services/DashboardService';
import { getErrorMessage } from '@/shared/lib/errorHandler';

export function useDashboard({ dateFrom, dateTo, hasInsightsPermission }) {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summaryData = await fetchSummary(dateFrom, dateTo);
      setSummary(summaryData);

      if (hasInsightsPermission) {
        const insightsData = await fetchInsights(dateFrom, dateTo);
        setInsights(insightsData);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, hasInsightsPermission]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const cleanup = connectLiveStream((data) => {
      setSummary(data);
    });

    return () => {
      cleanup();
    };
  }, []);

  return { summary, insights, loading, error, refetch: fetchDashboardData };
}

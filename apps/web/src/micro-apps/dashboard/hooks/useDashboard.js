import { useState, useEffect, useCallback } from 'react';
import * as DashboardService from '../services/DashboardService';
import { getErrorMessage } from '@/shared/lib/errorHandler';

function toAPIDate(dateStr) {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
}

export function useDashboard({ dateFrom, dateTo, hasInsightsPermission }) {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (dateFrom) params.date_from = toAPIDate(dateFrom);
      if (dateTo)   params.date_to   = toAPIDate(dateTo);

      const [summaryData, insightsData] = await Promise.all([
        DashboardService.fetchSummary(params),
        hasInsightsPermission ? DashboardService.fetchInsights(params) : Promise.resolve(null)
      ]);
      
      setSummary(summaryData);
      if (hasInsightsPermission) {
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

  return { summary, insights, loading, error, refetch: fetchDashboardData };
}

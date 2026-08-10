import { useState, useEffect, useCallback } from 'react';
import { fetchResults, fetchLatestEval } from '../api/client';

export function useTriageData() {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    needsHuman: '',
    category: 'all',
    priority: 'all',
  });

  const [evalData, setEvalData] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResults(filters);
      setResults(data.results || []);
      setTotal(data.total || 0);

      const latestEval = await fetchLatestEval();
      if (latestEval && latestEval.evalRun) {
        setEvalData(latestEval.evalRun);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    results,
    total,
    loading,
    error,
    filters,
    updateFilters,
    evalData,
    refresh: loadData,
  };
}

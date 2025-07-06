import { useState, useEffect, useCallback } from 'react';
import { getHomeworkList, type HomeworkItem, type HomeworkQueryParams } from '../services/homework';

export const useHomeworkList = (initialParams: HomeworkQueryParams = {}) => {
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pageNo: 1,
    pageSize: 10
  });

  const fetchHomeworks = useCallback(async (params: HomeworkQueryParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedParams = { ...initialParams, ...params };
      const data = await getHomeworkList(mergedParams);
      
      setHomeworks(data.list || []);
      setPagination({
        total: data.total || 0,
        pageNo: data.pageNo || 1,
        pageSize: data.pageSize || 10
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取作业列表失败');
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    fetchHomeworks();
  }, [fetchHomeworks]);

  const refetch = useCallback((params?: HomeworkQueryParams) => {
    return fetchHomeworks(params);
  }, [fetchHomeworks]);

  const changePage = useCallback((pageNo: number) => {
    return fetchHomeworks({ pageNo });
  }, [fetchHomeworks]);

  return {
    homeworks,
    loading,
    error,
    pagination,
    refetch,
    changePage
  };
};
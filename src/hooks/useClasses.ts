import { useState, useEffect } from 'react';
import { getClassList, getClassOptions, getClassSelectOptions, type ClassItem } from '../services/classes';

// 班级列表Hook
export const useClassList = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchClasses = async () => {
    if (dataLoaded) return; // 防止重复请求
    
    try {
      setLoading(true);
      setError(null);
      const data = await getClassList();
      setClasses(data);
      setDataLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取班级列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []); // 移除依赖，只在组件挂载时执行一次

  return {
    classes,
    loading,
    error,
    refetch: () => {
      setDataLoaded(false);
      fetchClasses();
    }
  };
};

// 班级选项Hook
const useClassOptions = () => {
  const [options, setOptions] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchOptions = async () => {
    if (dataLoaded) return; // 防止重复请求
    
    try {
      setLoading(true);
      setError(null);
      const data = await getClassOptions();
      setOptions(data);
      setDataLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取班级选项失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []); // 移除依赖，只在组件挂载时执行一次

  return {
    options,
    loading,
    error,
    refetch: () => {
      setDataLoaded(false);
      fetchOptions();
    }
  };
};

// 班级Select选项Hook
export const useClassSelectOptions = () => {
  const [selectOptions, setSelectOptions] = useState<Array<{value: number, label: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchSelectOptions = async () => {
    if (dataLoaded) return; // 防止重复请求
    
    try {
      setLoading(true);
      setError(null);
      const data = await getClassSelectOptions();
      setSelectOptions(data);
      setDataLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取班级选项失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectOptions();
  }, []); // 移除依赖，只在组件挂载时执行一次

  return {
    selectOptions,
    loading,
    error,
    refetch: () => {
      setDataLoaded(false);
      fetchSelectOptions();
    }
  };
};
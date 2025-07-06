import { useState, useEffect } from 'react';
import { getClassList, getClassOptions, getClassSelectOptions, type ClassItem } from '../services/classes';

// 班级列表Hook
export const useClassList = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClassList();
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取班级列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return {
    classes,
    loading,
    error,
    refetch: fetchClasses
  };
};

// 班级选项Hook
export const useClassOptions = () => {
  const [options, setOptions] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClassOptions();
      setOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取班级选项失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions
  };
};

// 班级Select选项Hook
export const useClassSelectOptions = () => {
  const [selectOptions, setSelectOptions] = useState<Array<{value: number, label: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSelectOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClassSelectOptions();
      setSelectOptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取班级选项失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelectOptions();
  }, []);

  return {
    selectOptions,
    loading,
    error,
    refetch: fetchSelectOptions
  };
};
import { authenticatedFetch, handleApiResponse } from '../utils/request';

// 班级接口定义
export interface ClassItem {
  id: number;
  name: string;
  className: string;
  code: string;
  gradeName: string;
  parentId: number;
  status: number;
  type: string;
  sort: number;
  createTime: number;
  updateTime: number;
}

export interface ClassListResponse {
  code: number;
  data: ClassItem[];
  msg: string;
}

/**
 * 获取班级列表
 * @param params 查询参数
 * @returns Promise<ClassItem[]>
 */
export const getClassList = async (params?: {
  status?: string;
  type?: string;
}): Promise<ClassItem[]> => {
  try {
    const queryParams = new URLSearchParams({
      status: '0',
      type: 'class',
      ...params
    });

    const response = await authenticatedFetch(
      `http://localhost:48080/admin-api/system/dept/list?${queryParams}`,
      {
        method: 'GET',
      }
    );

    const result: ClassListResponse = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '获取班级列表失败');
    }

    return result.data || [];
  } catch (error) {
    console.error('获取班级列表失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败，请检查网络连接');
  }
};

/**
 * 获取班级选项（用于下拉框）
 * @returns Promise<Record<number, string>> 返回班级id和className的键值对
 */
export const getClassOptions = async (): Promise<Record<number, string>> => {
  try {
    const classList = await getClassList();
    
    return classList.reduce((acc, item) => {
      acc[item.id] = item.className;
      return acc;
    }, {} as Record<number, string>);
  } catch (error) {
    console.error('获取班级选项失败:', error);
    throw error;
  }
};

/**
 * 获取班级选项数组（用于Select组件）
 * @returns Promise<Array<{value: number, label: string}>>
 */
export const getClassSelectOptions = async (): Promise<Array<{value: number, label: string}>> => {
  try {
    const classList = await getClassList();
    
    return classList.map(item => ({
      value: item.id,
      label: item.className
    }));
  } catch (error) {
    console.error('获取班级选项失败:', error);
    throw error;
  }
};

/**
 * 根据班级ID获取班级信息
 * @param classId 班级ID
 * @returns Promise<ClassItem | null>
 */
export const getClassById = async (classId: number): Promise<ClassItem | null> => {
  try {
    const classList = await getClassList();
    return classList.find(item => item.id === classId) || null;
  } catch (error) {
    console.error('获取班级信息失败:', error);
    throw error;
  }
};
import { authenticatedFetch, handleApiResponse } from '../utils/request';

// 作业接口定义
export interface TaskItem {
  taskTitle: string;
  taskDescription: string;
  taskQuestion: string;
  taskAnswer: string;
}

export interface HomeworkItem {
  id: string;
  title: string;
  deptId: string;
  subject: string;
  assignedDate: string;
  publishTime: string;
  ddlTime: string;
  description: string;
  taskList: TaskItem[];
  status?: string;
}

export interface HomeworkListResponse {
  code: number;
  data: {
    list: HomeworkItem[];
    total: number;
    pageNo: number;
    pageSize: number;
  };
  msg: string;
}

export interface HomeworkQueryParams {
  deptIds?: string;
  subject?: string;
  pageNo?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

/**
 * 获取作业列表（分页查询）
 */
export const getHomeworkList = async (params: HomeworkQueryParams = {}): Promise<HomeworkListResponse['data']> => {
  try {
    const queryParams = new URLSearchParams();
    
    // 添加查询参数
    if (params.deptIds) queryParams.append('deptIds', params.deptIds);
    if (params.subject) queryParams.append('subject', params.subject);
    queryParams.append('pageNo', (params.pageNo || 1).toString());
    queryParams.append('pageSize', (params.pageSize || 10).toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.status) queryParams.append('status', params.status);

    const response = await authenticatedFetch(
      `http://localhost:48080/admin-api/homework/homework-tasks/page?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    const result: HomeworkListResponse = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '获取作业列表失败');
    }

    return result.data;
  } catch (error) {
    console.error('获取作业列表失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败，请检查网络连接');
  }
};

/**
 * 创建作业
 */
export const createHomework = async (data: Partial<HomeworkItem>): Promise<any> => {
  try {
    const response = await authenticatedFetch(
      'http://localhost:48080/admin-api/homework/homework-tasks',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      }
    );

    const result = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '创建作业失败');
    }

    return result.data;
  } catch (error) {
    console.error('创建作业失败:', error);
    throw error;
  }
};

/**
 * 更新作业
 */
export const updateHomework = async (id: string, data: Partial<HomeworkItem>): Promise<any> => {
  try {
    const response = await authenticatedFetch(
      `http://localhost:48080/admin-api/homework/homework-tasks/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      }
    );

    const result = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '更新作业失败');
    }

    return result.data;
  } catch (error) {
    console.error('更新作业失败:', error);
    throw error;
  }
};

/**
 * 删除作业
 */
export const deleteHomework = async (id: string): Promise<any> => {
  try {
    const response = await authenticatedFetch(
      `http://localhost:48080/admin-api/homework/homework-tasks/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    const result = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '删除作业失败');
    }

    return result.data;
  } catch (error) {
    console.error('删除作业失败:', error);
    throw error;
  }
};
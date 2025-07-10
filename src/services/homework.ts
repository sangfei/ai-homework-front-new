import { authenticatedFetch, handleApiResponse } from '../utils/request';

// 作业接口定义
interface TaskItem {
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

interface HomeworkListResponse {
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

// 创建作业请求参数
export interface CreateHomeworkRequest {
  title: string;
  deptId: number;
  subject: string;
  assignedDate: number;
  publishTime: number;
  ddlTime: number;
  taskList: {
    taskTitle: string;
    taskDescription: string;
    taskQuestion: any[];
    taskAnswer: any[];
  }[];
}

// 创建作业响应
interface CreateHomeworkResponse {
  code: number;
  data: number; // 作业ID
  msg: string;
}

// 作业详情响应
interface HomeworkDetailResponse {
  code: number;
  data: {
    id: number;
    title: string;
    deptId: number;
    subject: string;
    assignedDate: number;
    publishTime: number;
    ddlTime: number;
    description?: string;
    taskList: {
      id?: number;
      taskTitle: string;
      taskDescription: string;
      taskQuestion: any[];
      taskAnswer: any[];
    }[];
    status?: string;
    createTime?: number;
    updateTime?: number;
  };
  msg: string;
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
export const createHomework = async (data: CreateHomeworkRequest): Promise<number> => {
  try {
    console.log('📤 发送创建作业请求:', data);
    
    const response = await authenticatedFetch(
      'http://localhost:48080/admin-api/homework/homework-tasks/create',
      {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }
    );

    console.log('📡 收到创建作业响应:', response.status, response.statusText);
    
    const result: CreateHomeworkResponse = await response.json();
    console.log('📋 创建作业响应数据:', result);
    
    if (result.code !== 0) {
      console.error('❌ 创建作业失败 - 服务器返回错误:', result);
      throw new Error(result.msg || '创建作业失败');
    }

    if (!result.data || typeof result.data !== 'number') {
      console.error('❌ 创建作业失败 - 无效的作业ID:', result.data);
      throw new Error('服务器返回的作业ID无效');
    }

    console.log('✅ 创建作业成功，作业ID:', result.data);
    return result.data;
  } catch (error) {
    console.error('创建作业失败:', error);
    throw error;
  }
};

/**
 * 获取作业详情
 */
export const getHomeworkDetail = async (homeworkId: number): Promise<HomeworkDetailResponse['data']> => {
  try {
    const response = await authenticatedFetch(
      `http://localhost:48080/admin-api/homework/homework-tasks/get?id=${homeworkId}`,
      {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const result: HomeworkDetailResponse = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '获取作业详情失败');
    }

    return result.data;
  } catch (error) {
    console.error('获取作业详情失败:', error);
    throw error;
  }
};

/**
 * 更新作业
 */
const updateHomework = async (id: string, data: Partial<HomeworkItem>): Promise<any> => {
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
 * 更新作业详情（使用homework_detail_for_update数据）
 */
export const updateHomeworkDetail = async (homeworkDetail: any): Promise<any> => {
  try {
    console.log('📤 发送作业更新请求:', homeworkDetail);
    
    const response = await authenticatedFetch(
      'http://localhost:48084/admin-api/homework/homework-tasks/update',
      {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(homeworkDetail)
      }
    );

    console.log('📡 收到作业更新响应:', response.status, response.statusText);
    
    const result = await response.json();
    console.log('📋 作业更新响应数据:', result);
    
    if (result.code !== 0) {
      console.error('❌ 作业更新失败 - 服务器返回错误:', result);
      throw new Error(result.msg || '作业更新失败');
    }

    console.log('✅ 作业更新成功');
    return result.data;
  } catch (error) {
    console.error('作业更新失败:', error);
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
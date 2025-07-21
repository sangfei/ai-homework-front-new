import { authenticatedFetch, handleApiResponse } from '../utils/request';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// 班级作业列表接口定义（学生作业信息）
export interface MyTaskDetailVO {
  myHomeworkDetailId: number;
  homeworkTaskDetailId: number;
  taskName: string;
  submissions: string[];
}

export interface StudentHomeworkVO {
  creator: number; // 学生ID
  myTaskList: MyTaskDetailVO[];
}

export interface ClassHomeworkListResponse {
  code: number;
  data: {
    pageNum: number;
    pageSize: number;
    total: number;
    myHomework: StudentHomeworkVO[];
  };
  msg: string;
}

export interface ClassHomeworkQueryParams {
  homeworkId: number;
  deptId: number;
  page?: number;
  offset?: number;
}

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
  status?: number;
  createTime?: number;
  updateTime?: number;
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
      `${buildApiUrl(API_ENDPOINTS.HOMEWORK_PAGE)}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    return await handleApiResponse<HomeworkListResponse['data']>(response);
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
      buildApiUrl(API_ENDPOINTS.HOMEWORK_CREATE),
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
    
    const result = await handleApiResponse<number>(response);
    console.log('✅ 创建作业成功，作业ID:', result);
    return result;
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
      `${buildApiUrl(API_ENDPOINTS.HOMEWORK_GET)}?id=${homeworkId}`,
      {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    return await handleApiResponse<HomeworkDetailResponse['data']>(response);
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
      `${buildApiUrl(`/admin-api/homework/homework-tasks/${id}`)}`,
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
      buildApiUrl(API_ENDPOINTS.HOMEWORK_UPDATE),
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
    
    const result = await handleApiResponse<any>(response);
    console.log('✅ 作业更新成功');
    return result;
  } catch (error) {
    console.error('作业更新失败:', error);
    throw error;
  }
};
/**
 * 删除作业
 */
export const deleteHomework = async (id: string | number): Promise<any> => {
  try {
    console.log('🗑️ 开始删除作业，ID:', id);
    
    const response = await authenticatedFetch(
      `${buildApiUrl('/admin-api/homework/homework-tasks/delete')}?id=${id}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const result = await handleApiResponse<any>(response);
    console.log('✅ 作业删除成功');
    return result;
  } catch (error) {
    console.error('❌ 删除作业失败:', error);
    throw error;
  }
};

/**
 * 发布作业
 */
export const publishHomework = async (homeworkId: number): Promise<any> => {
  try {
    console.log('📤 开始发布作业，ID:', homeworkId);
    
    // 先获取作业详情
    const homeworkDetail = await getHomeworkDetail(homeworkId);
    
    // 更新状态为已发布
    const updateData = {
      ...homeworkDetail,
      status: 1 // 设置为已发布状态
    };
    
    // 调用更新接口
    const result = await updateHomeworkDetail(updateData);
    console.log('✅ 作业发布成功');
    return result;
  } catch (error) {
    console.error('❌ 发布作业失败:', error);
    throw error;
  }
};

/**
 * 获取班级作业列表（学生作业信息）
 */
export const getClassHomeworkList = async (params: ClassHomeworkQueryParams): Promise<ClassHomeworkListResponse['data']> => {
  try {
    const queryParams = new URLSearchParams();
    
    // 添加查询参数
    queryParams.append('homeworkId', params.homeworkId.toString());
    queryParams.append('deptId', params.deptId.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());

    const response = await authenticatedFetch(
      `${buildApiUrl(API_ENDPOINTS.CLASS_HOMEWORK_LIST)}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    return await handleApiResponse<ClassHomeworkListResponse['data']>(response);
  } catch (error) {
    console.error('获取班级作业列表失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败，请检查网络连接');
  }
};
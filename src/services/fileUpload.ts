import { authenticatedFetch, handleApiResponse } from '../utils/request';
import { getTenantId, getUserProfile as getStoredUserProfile } from './auth';
import { getUserProfile as getUserProfileFromService } from './user';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// 文件上传请求参数
interface FileUploadRequest {
  type: 1 | 2; // 1: 作业题目, 2: 作业答案
  tenantId: string;
  className: string;
  userId: string;
  subject: string;
  assignedDate: string;
  homeworkId: number;
  taskId: number;
  file: File;
}

// 文件上传响应
interface FileUploadResponse {
  code: number;
  data: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
  };
  msg: string;
}

/**
 * 获取当前用户ID
 */
const getCurrentUserId = (): string => {
  // 优先从存储的用户信息中获取
  const storedProfile = getStoredUserProfile();
  if (storedProfile && storedProfile.id) {
    return storedProfile.id.toString();
  }
  
  // 如果没有存储的用户信息，返回默认值
  console.warn('⚠️ 未找到用户ID，使用默认值');
  return '144'; // 默认用户ID
};

/**
 * 验证上传参数
 */
const validateUploadParams = (params: FileUploadRequest): string[] => {
  const errors: string[] = [];
  
  if (!params.tenantId) errors.push('租户ID不能为空');
  if (!params.className) errors.push('班级名称不能为空');
  if (!params.userId) errors.push('用户ID不能为空');
  if (!params.subject) errors.push('科目不能为空');
  if (!params.assignedDate) errors.push('作业日期不能为空');
  if (!params.homeworkId) errors.push('作业ID不能为空');
  if (!params.taskId) errors.push('任务ID不能为空');
  if (!params.file) errors.push('文件不能为空');
  if (![1, 2].includes(params.type)) errors.push('类型必须为1或2');
  
  return errors;
};
/**
 * 上传作业附件
 */
export const uploadHomeworkAttachment = async (params: FileUploadRequest): Promise<string> => {
  try {
    // 参数验证
    const validationErrors = validateUploadParams(params);
    if (validationErrors.length > 0) {
      throw new Error(`参数验证失败: ${validationErrors.join(', ')}`);
    }
    
    console.log('📤 开始上传文件:', {
      fileName: params.file.name,
      type: params.type === 1 ? '作业题目' : '作业答案',
      taskId: params.taskId,
      homeworkId: params.homeworkId,
      tenantId: params.tenantId,
      className: params.className,
      userId: params.userId,
      subject: params.subject,
      assignedDate: params.assignedDate
    });

    // 构建FormData
    const formData = new FormData();
    formData.append('type', params.type.toString());
    formData.append('tenantId', params.tenantId);
    formData.append('className', params.className);
    formData.append('userId', params.userId);
    formData.append('subject', params.subject);
    formData.append('assignedDate', params.assignedDate);
    formData.append('homeworkId', params.homeworkId.toString());
    formData.append('taskId', params.taskId.toString());
    formData.append('file', params.file);

    // 获取访问令牌
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('未找到访问令牌，请重新登录');
    }

    // 发送请求 - 注意：文件上传不需要设置Content-Type，让浏览器自动设置
    const response = await fetch(buildApiUrl(API_ENDPOINTS.HOMEWORK_UPLOAD_ATTACHMENT), {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'tenant-id': params.tenantId,
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const result = await handleApiResponse<FileUploadResponse['data']>(response);

    if (!result || !result.fileUrl) {
      throw new Error('上传失败：未获取到文件URL');
    }

    console.log('✅ 文件上传成功:', {
      fileName: params.file.name,
      fileUrl: result.fileUrl,
      type: params.type === 1 ? '作业题目' : '作业答案'
    });

    return result.fileUrl;
  } catch (error) {
    console.error('❌ 文件上传失败:', error);
    throw error;
  }
};
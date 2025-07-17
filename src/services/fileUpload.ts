import { authenticatedFetch, handleApiResponse } from '../utils/request';
import { getTenantId } from './auth';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// 文件上传请求参数
interface FileUploadRequest {
  type: 1 | 2; // 1: 作业题目, 2: 作业答案
  tenantId: string;
  className: string;
  userId: number;
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
 * 上传作业附件
 */
export const uploadHomeworkAttachment = async (params: FileUploadRequest): Promise<string> => {
  try {
    console.log('📤 开始上传文件:', {
      fileName: params.file.name,
      type: params.type === 1 ? '作业题目' : '作业答案',
      taskId: params.taskId,
      homeworkId: params.homeworkId
    });

    // 构建FormData
    const formData = new FormData();
    formData.append('type', params.type.toString());
    formData.append('tenantId', params.tenantId);
    formData.append('className', params.className);
    formData.append('userId', params.userId.toString());
    formData.append('subject', params.subject);
    formData.append('assignedDate', params.assignedDate);
    formData.append('homeworkId', params.homeworkId.toString());
    formData.append('taskId', params.taskId.toString());
    formData.append('file', params.file);

    // 发送请求 - 注意：文件上传不需要设置Content-Type，让浏览器自动设置
    const response = await fetch(buildApiUrl(API_ENDPOINTS.HOMEWORK_UPLOAD_ATTACHMENT), {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'tenant-id': params.tenantId,
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
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
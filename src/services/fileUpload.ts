import { authenticatedFetch } from '../utils/request';
import { getTenantId } from './auth';

// 文件上传请求参数
export interface FileUploadRequest {
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
export interface FileUploadResponse {
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
    const response = await fetch('/admin-api/homework/homework-tasks/upload-independent-attachment', {
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

    const result: FileUploadResponse = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '文件上传失败');
    }

    if (!result.data || !result.data.fileUrl) {
      throw new Error('服务器返回的文件URL无效');
    }

    console.log('✅ 文件上传成功:', {
      fileName: params.file.name,
      fileUrl: result.data.fileUrl,
      type: params.type === 1 ? '作业题目' : '作业答案'
    });

    return result.data.fileUrl;
  } catch (error) {
    console.error('❌ 文件上传失败:', error);
    throw error;
  }
};
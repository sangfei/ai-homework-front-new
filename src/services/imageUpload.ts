import { authenticatedFetch } from '../utils/request';
import { getTenantId } from './auth';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// 图片上传请求参数
export interface ImageUploadRequest {
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

// 图片上传响应
export interface ImageUploadResponse {
  code: number;
  data: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
  };
  msg: string;
}

/**
 * 上传单张图片
 */
export const uploadImage = async (params: ImageUploadRequest): Promise<string> => {
  try {
    console.log('📤 开始上传图片:', {
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

    // 发送请求
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

    const result: ImageUploadResponse = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '图片上传失败');
    }

    if (!result.data || !result.data.fileUrl) {
      throw new Error('服务器返回的图片URL无效');
    }

    console.log('✅ 图片上传成功:', {
      fileName: params.file.name,
      fileUrl: result.data.fileUrl,
      type: params.type === 1 ? '作业题目' : '作业答案'
    });

    return result.data.fileUrl;
  } catch (error) {
    console.error('❌ 图片上传失败:', error);
    throw error;
  }
};

/**
 * 批量上传图片
 */
export const uploadMultipleImages = async (
  images: File[],
  baseParams: Omit<ImageUploadRequest, 'file'>
): Promise<string[]> => {
  const uploadPromises = images.map(file => 
    uploadImage({ ...baseParams, file })
  );
  
  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('❌ 批量上传图片失败:', error);
    throw error;
  }
};

/**
 * 压缩图片（可选功能）
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    img.src = URL.createObjectURL(file);
  });
};
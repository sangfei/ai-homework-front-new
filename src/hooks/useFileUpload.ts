import { useState, useCallback } from 'react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  url?: string;
}

export interface UseFileUploadOptions {
  maxFiles?: number;
  maxSize?: number; // MB
  acceptedTypes?: string[];
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (file: UploadedFile, error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxFiles = 5,
    maxSize = 20,
    acceptedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
    onUploadComplete,
    onUploadError
  } = options;

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 验证文件
  const validateFile = useCallback((file: File): string | null => {
    // 检查文件类型
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `不支持的文件格式，仅支持：${acceptedTypes.join(', ')}`;
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return `文件大小不能超过 ${maxSize}MB`;
    }

    // 检查文件数量
    if (files.length >= maxFiles) {
      return `最多只能上传 ${maxFiles} 个文件`;
    }

    return null;
  }, [files.length, maxFiles, maxSize, acceptedTypes]);

  // 模拟文件上传API
  const uploadFileToServer = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 模拟上传延迟
      setTimeout(() => {
        // 90% 成功率
        if (Math.random() > 0.1) {
          resolve(`https://example.com/uploads/${file.name}`);
        } else {
          reject(new Error('服务器错误，上传失败'));
        }
      }, 1000 + Math.random() * 2000);
    });
  };

  // 上传单个文件
  const uploadFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const uploadedFile: UploadedFile = {
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    };

    // 添加到文件列表
    setFiles(prev => [...prev, uploadedFile]);

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, progress: Math.min(f.progress + Math.random() * 30, 95) }
            : f
        ));
      }, 200);

      // 上传文件
      const url = await uploadFileToServer(file);

      // 清除进度更新
      clearInterval(progressInterval);

      // 更新文件状态
      const completedFile = {
        ...uploadedFile,
        status: 'success' as const,
        progress: 100,
        url
      };

      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? completedFile : f
      ));

      onUploadComplete?.(completedFile);
      return completedFile;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      
      const errorFile = {
        ...uploadedFile,
        status: 'error' as const,
        progress: 0,
        error: errorMessage
      };

      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? errorFile : f
      ));

      onUploadError?.(errorFile, errorMessage);
      throw error;
    }
  }, [onUploadComplete, onUploadError]);

  // 批量上传文件
  const uploadFiles = useCallback(async (fileList: FileList | File[]): Promise<UploadedFile[]> => {
    const filesToUpload = Array.from(fileList);
    const validFiles: File[] = [];
    
    // 验证所有文件
    for (const file of filesToUpload) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return [];
    }

    setIsUploading(true);

    try {
      // 并发上传所有文件
      const uploadPromises = validFiles.map(file => uploadFile(file));
      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads: UploadedFile[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulUploads.push(result.value);
        } else {
          console.error(`文件 ${validFiles[index].name} 上传失败:`, result.reason);
        }
      });

      return successfulUploads;
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, uploadFile]);

  // 删除文件
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // 重试上传
  const retryUpload = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file || file.status !== 'error') {
      return;
    }

    // 重置文件状态
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'uploading', progress: 0, error: undefined }
        : f
    ));

    try {
      // 这里需要重新创建File对象，实际项目中可能需要保存原始File对象
      // 暂时跳过重试功能的完整实现
      console.log('重试上传功能需要保存原始File对象');
    } catch (error) {
      console.error('重试上传失败:', error);
    }
  }, [files]);

  // 清空所有文件
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  // 获取成功上传的文件
  const getSuccessfulFiles = useCallback(() => {
    return files.filter(f => f.status === 'success');
  }, [files]);

  // 获取上传中的文件数量
  const getUploadingCount = useCallback(() => {
    return files.filter(f => f.status === 'uploading').length;
  }, [files]);

  return {
    files,
    isUploading,
    uploadFiles,
    uploadFile,
    removeFile,
    retryUpload,
    clearFiles,
    validateFile,
    getSuccessfulFiles,
    getUploadingCount
  };
};
import { useState, useCallback } from 'react';

export interface UploadedImage {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  url?: string;
  file?: File;
  preview?: string;
}

export interface UseImageUploadOptions {
  maxFiles?: number;
  maxSize?: number; // MB
  onUploadComplete?: (image: UploadedImage) => void;
  onUploadError?: (image: UploadedImage, error: string) => void;
  onUploadProgress?: (image: UploadedImage, progress: number) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    maxFiles = 5,
    maxSize = 5,
    onUploadComplete,
    onUploadError,
    onUploadProgress
  } = options;

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 验证图片文件
  const validateImage = useCallback((file: File): string | null => {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return '仅支持 JPG、PNG、GIF、WebP 格式的图片';
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return `图片大小不能超过 ${maxSize}MB`;
    }

    // 检查文件数量
    if (images.length >= maxFiles) {
      return `最多只能上传 ${maxFiles} 张图片`;
    }

    return null;
  }, [images.length, maxFiles, maxSize]);

  // 模拟上传进度
  const simulateUploadProgress = useCallback((image: UploadedImage): Promise<string> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // 模拟上传成功/失败
          const isSuccess = Math.random() > 0.1; // 90% 成功率
          
          setImages(prev => prev.map(img => 
            img.id === image.id 
              ? { 
                  ...img, 
                  progress: 100, 
                  status: isSuccess ? 'success' : 'error',
                  error: isSuccess ? undefined : '上传失败，请重试',
                  url: isSuccess ? `https://example.com/uploads/${image.name}` : undefined
                }
              : img
          ));
          
          if (isSuccess) {
            const updatedImage = { ...image, status: 'success' as const, url: `https://example.com/uploads/${image.name}` };
            onUploadComplete?.(updatedImage);
            resolve(updatedImage.url!);
          } else {
            const errorImage = { ...image, status: 'error' as const, error: '上传失败，请重试' };
            onUploadError?.(errorImage, '上传失败，请重试');
            reject(new Error('上传失败'));
          }
        } else {
          setImages(prev => prev.map(img => 
            img.id === image.id ? { ...img, progress } : img
          ));
          onUploadProgress?.(image, progress);
        }
      }, 100);
    });
  }, [onUploadComplete, onUploadError, onUploadProgress]);

  // 上传单张图片
  const uploadImage = useCallback(async (file: File): Promise<UploadedImage> => {
    const error = validateImage(file);
    if (error) {
      throw new Error(error);
    }

    const uploadedImage: UploadedImage = {
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0,
      file: file,
      preview: URL.createObjectURL(file)
    };

    // 添加到图片列表
    setImages(prev => [...prev, uploadedImage]);
    setIsUploading(true);

    try {
      await simulateUploadProgress(uploadedImage);
      return uploadedImage;
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [validateImage, simulateUploadProgress]);

  // 批量上传图片
  const uploadImages = useCallback(async (files: FileList | File[]): Promise<UploadedImage[]> => {
    const filesToUpload = Array.from(files);
    const validFiles: File[] = [];
    
    // 验证所有文件
    for (const file of filesToUpload) {
      const error = validateImage(file);
      if (error) {
        console.warn(`跳过文件 ${file.name}: ${error}`);
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
      const uploadPromises = validFiles.map(file => uploadImage(file));
      const results = await Promise.allSettled(uploadPromises);
      
      const successfulUploads: UploadedImage[] = [];
      
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
  }, [validateImage, uploadImage]);

  // 删除图片
  const removeImage = useCallback((imageId: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  }, []);

  // 重试上传
  const retryUpload = useCallback(async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || image.status !== 'error' || !image.file) {
      return;
    }

    // 重置图片状态
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, status: 'uploading', progress: 0, error: undefined }
        : img
    ));

    try {
      await simulateUploadProgress(image);
    } catch (error) {
      console.error('重试上传失败:', error);
    }
  }, [images, simulateUploadProgress]);

  // 清空所有图片
  const clearImages = useCallback(() => {
    // 释放所有预览URL
    images.forEach(image => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setImages([]);
  }, [images]);

  // 获取成功上传的图片
  const getSuccessfulImages = useCallback(() => {
    return images.filter(img => img.status === 'success');
  }, [images]);

  // 获取上传中的图片数量
  const getUploadingCount = useCallback(() => {
    return images.filter(img => img.status === 'uploading').length;
  }, [images]);

  return {
    images,
    isUploading,
    uploadImage,
    uploadImages,
    removeImage,
    retryUpload,
    clearImages,
    validateImage,
    getSuccessfulImages,
    getUploadingCount
  };
};
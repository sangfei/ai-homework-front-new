// 文件处理工具函数

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名（包含点号）
 */
export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';
};

/**
 * 检查文件类型是否被支持
 * @param filename 文件名
 * @param acceptedTypes 支持的文件类型数组
 * @returns 是否支持
 */
export const isFileTypeAccepted = (filename: string, acceptedTypes: string[]): boolean => {
  const extension = getFileExtension(filename).toLowerCase();
  return acceptedTypes.includes(extension);
};

/**
 * 验证文件大小
 * @param fileSize 文件大小（字节）
 * @param maxSizeMB 最大大小（MB）
 * @returns 是否符合大小限制
 */
export const isFileSizeValid = (fileSize: number, maxSizeMB: number): boolean => {
  return fileSize <= maxSizeMB * 1024 * 1024;
};

/**
 * 生成唯一的文件ID
 * @returns 唯一ID字符串
 */
export const generateFileId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * 获取文件类型图标类名
 * @param filename 文件名
 * @returns 图标类型
 */
export const getFileTypeIcon = (filename: string): string => {
  const extension = getFileExtension(filename).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return 'file-pdf';
    case '.doc':
    case '.docx':
      return 'file-text';
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.bmp':
    case '.webp':
      return 'file-image';
    case '.mp4':
    case '.avi':
    case '.mov':
    case '.wmv':
      return 'file-video';
    case '.mp3':
    case '.wav':
    case '.flac':
      return 'file-audio';
    case '.zip':
    case '.rar':
    case '.7z':
      return 'file-archive';
    case '.xls':
    case '.xlsx':
      return 'file-spreadsheet';
    case '.ppt':
    case '.pptx':
      return 'file-presentation';
    default:
      return 'file';
  }
};

/**
 * 创建文件预览URL
 * @param file File对象
 * @returns 预览URL
 */
export const createFilePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * 释放文件预览URL
 * @param url 预览URL
 */
export const revokeFilePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * 检查是否为图片文件
 * @param filename 文件名
 * @returns 是否为图片
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

/**
 * 检查是否为文档文件
 * @param filename 文件名
 * @returns 是否为文档
 */
export const isDocumentFile = (filename: string): boolean => {
  const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
  const extension = getFileExtension(filename).toLowerCase();
  return documentExtensions.includes(extension);
};

/**
 * 压缩图片文件
 * @param file 图片文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 压缩质量 (0-1)
 * @returns Promise<Blob>
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> => {
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
            resolve(blob);
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

    img.src = createFilePreviewUrl(file);
  });
};
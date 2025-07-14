import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Plus, Eye, Trash2, AlertCircle, Check, RefreshCw } from 'lucide-react';

interface UploadedImage {
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

interface ImageUploadProps {
  type: 'homework' | 'answer';
  existingImages?: string[];
  onImagesChange?: (images: UploadedImage[], taskId?: string) => void;
  onExistingImageDelete?: (index: number) => void;
  maxFiles?: number;
  maxSize?: number; // MB
  className?: string;
  disabled?: boolean;
  taskId?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  type,
  existingImages = [],
  onImagesChange,
  onExistingImageDelete,
  maxFiles = 5,
  maxSize = 5,
  className = '',
  disabled = false,
  taskId
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
const [isDragOver, setIsDragOver] = useState(false);
const [showPreview, setShowPreview] = useState<string | null>(null);
const [scale, setScale] = useState(1);
const [position, setPosition] = useState({ x: 0, y: 0 });
const [isDragging, setIsDragging] = useState(false);
const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
const fileInputRef = useRef<HTMLInputElement>(null);

  const buttonConfig = {
    homework: {
      text: '上传作业附件',
      buttonClassName: 'bg-blue-600 text-white hover:bg-blue-700',
      icon: Upload
    },
    answer: {
      text: '上传答案附件',
      buttonClassName: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
      icon: Upload
    }
  };

  const config = buttonConfig[type] || buttonConfig.homework;

  // 文件大小格式化
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 验证文件
  const validateFile = (file: File): string | null => {
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
    const totalImages = existingImages.length + images.length;
    if (totalImages >= maxFiles) {
      return `最多只能上传 ${maxFiles} 张图片`;
    }

    return null;
  };

  // 创建图片预览URL
  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // 模拟图片上传
  const simulateUpload = (image: UploadedImage): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // 模拟上传成功/失败
          const isSuccess = Math.random() > 0.1; // 90% 成功率
          
          setImages(prev => {
            const updated = prev.map(img => 
              img.id === image.id 
                ? { 
                    ...img, 
                    progress: 100, 
                    status: isSuccess ? ('success' as const) : ('error' as const),
                    error: isSuccess ? undefined : '上传失败，请重试',
                    url: isSuccess ? `https://example.com/uploads/${image.name}` : undefined
                  }
                : img
            );
            onImagesChange?.(updated);
            return updated;
          });
          
          if (isSuccess) {
            resolve();
          } else {
            reject(new Error('上传失败'));
          }
        } else {
          setImages(prev => prev.map(img => 
            img.id === image.id ? { ...img, progress } : img
          ));
        }
      }, 100);
    });
  };

  // 处理文件选择
  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const newImages: UploadedImage[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const error = validateFile(file);
      
      if (error) {
        alert(error);
        continue;
      }

      const uploadImage: UploadedImage = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        status: 'uploading' as const,
        progress: 0,
        file: file,
        preview: createPreviewUrl(file)
      };

      newImages.push(uploadImage);
    }

    if (newImages.length > 0) {
      setImages(prev => {
        const updated = [...prev, ...newImages];
        onImagesChange?.(updated, taskId);
        return updated;
      });

      // 开始上传
      for (const image of newImages) {
        try {
          await simulateUpload(image);
        } catch (error) {
          console.error('上传失败:', error);
        }
      }
    }
  }, [images.length, maxFiles, maxSize, existingImages.length, onImagesChange]);

  // 点击上传
  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  // 删除新上传的图片
  const handleDeleteImage = (imageId: string) => {
    if (window.confirm('确定要删除这张图片吗？')) {
      setImages(prev => {
        const imageToDelete = prev.find(img => img.id === imageId);
        if (imageToDelete?.preview) {
          URL.revokeObjectURL(imageToDelete.preview);
        }
        
        const updated = prev.filter(img => img.id !== imageId);
        onImagesChange?.(updated, taskId);
        return updated;
      });
    }
  };

  // 删除现有图片
  const handleDeleteExistingImage = (index: number) => {
    if (window.confirm('确定要删除这张图片吗？删除后将无法恢复。')) {
      onExistingImageDelete?.(index);
    }
  };

  // 预览图片
  const handlePreviewImage = (url: string) => {
  setShowPreview(url);
  setScale(1);
  setPosition({ x: 0, y: 0 });
};

const handleWheel = (e: React.WheelEvent) => {
  e.preventDefault();
  const newScale = scale - e.deltaY * 0.01;
  setScale(Math.min(Math.max(0.1, newScale), 5)); // Clamp scale between 0.1 and 5
};

const handleMouseDown = (e: React.MouseEvent) => {
  setIsDragging(true);
  setStartDrag({
    x: e.clientX - position.x,
    y: e.clientY - position.y
  });
};

useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition(prev => ({
        x: e.clientX - startDrag.x,
        y: e.clientY - startDrag.y
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startDrag]);

const handleMouseLeave = () => {
  setIsDragging(false);
};

  // 获取状态图标
  const getStatusIcon = (image: UploadedImage) => {
    switch (image.status) {
      case 'uploading':
        return (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const totalImages = existingImages.length + images.length;
  const canUploadMore = totalImages < maxFiles && !disabled;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上传按钮和拖拽区域 */}
      {canUploadMore && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${config?.buttonClassName || 'bg-blue-600 text-white hover:bg-blue-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <config.icon className="w-4 h-4" />
            <span>{config?.text || '上传图片'}</span>
          </button>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={handleUploadClick}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              拖拽图片到此处，或 
              <span className="text-blue-600 hover:text-blue-800 underline ml-1">
                点击选择图片
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              支持 JPG、PNG、GIF、WebP 格式，单张≤{maxSize}MB，最多{maxFiles}张
            </p>
          </div>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* 现有图片展示 */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">现有图片</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {existingImages.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={url}
                    alt={`现有图片 ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handlePreviewImage(url)}
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3lpLHotKU8L3RleHQ+Cjwvc3ZnPg==';
                    }}
                  />
                </div>
                
                {/* 操作按钮 */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handlePreviewImage(url)}
                    className="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(index)}
                      className="p-1 bg-red-500 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 新上传的图片展示 */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">新上传图片</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {image.preview && (
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => image.preview && handlePreviewImage(image.preview)}
                    />
                  )}
                  
                  {/* 上传进度覆盖层 */}
                  {image.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <div className="text-xs">{Math.round(image.progress)}%</div>
                      </div>
                    </div>
                  )}
                  
                  {/* 错误状态覆盖层 */}
                  {image.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center">
                      <div className="text-center text-white">
                        <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                        <div className="text-xs">上传失败</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 状态和操作按钮 */}
                <div className="absolute top-2 left-2">
                  {getStatusIcon(image)}
                </div>
                
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.preview && image.status !== 'uploading' && (
                    <button
                      type="button"
                      onClick={() => handlePreviewImage(image.preview!)}
                      className="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    className="p-1 bg-red-500 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                
                {/* 图片信息 */}
                <div className="mt-1 text-xs text-gray-500 truncate">
                  {image.name} ({formatFileSize(image.size)})
                </div>
                
                {/* 错误信息 */}
                {image.status === 'error' && image.error && (
                  <div className="mt-1 text-xs text-red-600">
                    {image.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 图片预览模态框 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowPreview(null)}>
          <div className="relative max-w-4xl max-h-4xl p-4">
            <img
              src={showPreview}
              alt="预览"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: 'cursor 0.2s ease'
              }}
            />
            <button
              onClick={() => setShowPreview(null)}
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* 上传限制提示 */}
      {totalImages >= maxFiles && (
        <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
          已达到最大上传数量限制（{maxFiles}张）
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
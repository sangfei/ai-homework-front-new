import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Check, AlertCircle, File, Trash2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  file?: File; // 保存原始文件对象
}

interface FileUploadProps {
  type: 'homework' | 'answer';
  onFilesChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // MB
  acceptedTypes?: string[];
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  type,
  onFilesChange,
  maxFiles = 5,
  maxSize = 20,
  acceptedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
  className = ''
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buttonConfig = {
    homework: {
      text: '上传作业附件',
      className: 'bg-blue-600 text-white hover:bg-blue-700',
      icon: Upload
    },
    answer: {
      text: '上传答案附件',
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
      icon: Upload
    }
  };

  const config = buttonConfig[type];

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
  };

  // 模拟文件上传
  const simulateUpload = (file: UploadedFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // 模拟上传成功/失败
          const isSuccess = Math.random() > 0.1; // 90% 成功率
          
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  progress: 100, 
                  status: isSuccess ? 'success' : 'error',
                  error: isSuccess ? undefined : '上传失败，请重试'
                }
              : f
          ));
          
          if (isSuccess) {
            resolve();
          } else {
            reject(new Error('上传失败'));
          }
        } else {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress } : f
          ));
        }
      }, 100);
    });
  };

  // 处理文件选择
  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const error = validateFile(file);
      
      if (error) {
        alert(error);
        continue;
      }

      const uploadFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
        file: file // 保存原始文件对象
      };

      newFiles.push(uploadFile);
    }

    if (newFiles.length > 0) {
      setFiles(prev => {
        const updated = [...prev, ...newFiles];
        console.log('📁 文件列表更新:', {
          component: type,
          newFilesCount: newFiles.length,
          totalFilesCount: updated.length,
          files: updated.map(f => ({ name: f.name, status: f.status, hasFile: !!f.file }))
        });
        onFilesChange?.(updated);
        return updated;
      });

      // 开始上传
      for (const file of newFiles) {
        try {
          await simulateUpload(file);
          // 上传成功后再次触发回调，确保状态同步
          setFiles(prev => {
            onFilesChange?.(prev);
            return prev;
          });
        } catch (error) {
          console.error('上传失败:', error);
        }
      }
    }
  }, [files.length, maxFiles, maxSize, acceptedTypes, onFilesChange]);

  // 点击上传
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  // 删除文件
  const handleDeleteFile = (fileId: string) => {
    if (window.confirm('确定要删除这个文件吗？')) {
      setFiles(prev => {
        const updated = prev.filter(f => f.id !== fileId);
        console.log('🗑️ 文件删除:', {
          component: type,
          deletedFileId: fileId,
          remainingFilesCount: updated.length
        });
        onFilesChange?.(updated);
        return updated;
      });
    }
  };

  // 获取状态图标
  const getStatusIcon = (file: UploadedFile) => {
    switch (file.status) {
      case 'uploading':
        return (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      case 'success':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 上传按钮 */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={handleUploadClick}
          className={`w-30 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${config.className}`}
        >
          <config.icon className="w-4 h-4" />
          <span>{config.text}</span>
        </button>
        
        <div className="text-sm text-gray-500">
          支持 {acceptedTypes.join(', ')} 格式，单文件≤{maxSize}MB，最多{maxFiles}个
        </div>
      </div>

      {/* 拖拽上传区域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          拖拽文件到此处，或 
          <button
            type="button"
            onClick={handleUploadClick}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            点击选择文件
          </button>
        </p>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">已上传文件</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 group hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(file)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    
                    {/* 进度条 */}
                    {file.status === 'uploading' && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          上传中... {Math.round(file.progress)}%
                        </span>
                      </div>
                    )}
                    
                    {/* 错误信息 */}
                    {file.status === 'error' && file.error && (
                      <div className="mt-1 text-xs text-red-600">
                        {file.error}
                      </div>
                    )}
                    
                    {/* 成功提示 */}
                    {file.status === 'success' && (
                      <div className="mt-1 text-xs text-green-600">
                        上传成功
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 删除按钮 */}
                <button
                  type="button"
                  onClick={() => handleDeleteFile(file.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-800 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
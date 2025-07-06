import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "确认操作",
  message = "确定要执行此操作吗？",
  confirmText = "确认",
  cancelText = "取消",
  type = 'warning'
}) => {
  // 处理ESC键关闭弹窗
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 处理点击遮罩关闭
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理确认
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-500',
          iconBg: 'bg-red-50',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          confirmRing: 'focus:ring-red-500'
        };
      case 'info':
        return {
          iconColor: 'text-blue-500',
          iconBg: 'bg-blue-50',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          confirmRing: 'focus:ring-blue-500'
        };
      default: // warning
        return {
          iconColor: 'text-orange-500',
          iconBg: 'bg-orange-50',
          confirmBg: 'bg-orange-600 hover:bg-orange-700',
          confirmRing: 'focus:ring-orange-500'
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
        {/* 关闭按钮 */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="px-6 pb-6">
          {/* 图标和标题 */}
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 ${typeConfig.iconBg} rounded-full flex items-center justify-center`}>
              <AlertTriangle className={`w-8 h-8 ${typeConfig.iconColor}`} />
            </div>
          </div>
          
          {/* 标题 */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-3">
            {title}
          </h2>
          
          {/* 提示信息 */}
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            {message}
          </p>
          
          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-6 py-3 ${typeConfig.confirmBg} text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 ${typeConfig.confirmRing}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
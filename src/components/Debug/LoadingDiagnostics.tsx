import React, { useEffect, useState } from 'react';
import { runPageDiagnostics } from '../../utils/diagnostics';

interface LoadingDiagnosticsProps {
  isLoading: boolean;
  onDiagnosticsComplete?: () => void;
}

export const LoadingDiagnostics: React.FC<LoadingDiagnosticsProps> = ({ 
  isLoading, 
  onDiagnosticsComplete 
}) => {
  const [diagnosticsRun, setDiagnosticsRun] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isLoading && !diagnosticsRun) {
      const timer = setTimeout(async () => {
        console.log('🔍 页面加载超时，开始诊断...');
        await runPageDiagnostics();
        setDiagnosticsRun(true);
        onDiagnosticsComplete?.();
      }, 3000); // 3秒后开始诊断

      return () => clearTimeout(timer);
    }
  }, [isLoading, diagnosticsRun, onDiagnosticsComplete]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        {/* 加载动画 */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">智</span>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">正在加载应用...</h2>
          <p className="text-gray-600">请稍候，系统正在初始化</p>
        </div>
        
        {diagnosticsRun && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="font-medium text-yellow-800">加载时间较长</span>
            </div>
            <p className="text-yellow-700 text-sm mb-3">
              系统已运行诊断，请检查浏览器控制台查看详细信息
            </p>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-yellow-800 underline text-sm hover:text-yellow-900"
            >
              {showDetails ? '隐藏' : '显示'}故障排除建议
            </button>
            
            {showDetails && (
              <div className="mt-3 text-left space-y-2 text-sm text-yellow-800">
                <p>• 检查浏览器控制台是否有错误信息</p>
                <p>• 确认网络连接是否正常</p>
                <p>• 尝试刷新页面或清除浏览器缓存</p>
                <p>• 检查API服务是否正常运行</p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            刷新页面
          </button>
          <button
            onClick={async () => await runPageDiagnostics()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            运行诊断
          </button>
        </div>
      </div>
    </div>
  );
};
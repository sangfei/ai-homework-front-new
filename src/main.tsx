import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { runPageDiagnostics } from './utils/diagnostics';
import App from './App.tsx';
import './index.css';

// 页面加载完成后运行诊断
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM加载完成');
});

window.addEventListener('load', () => {
  console.log('🎯 页面完全加载');
  // 延迟运行诊断，确保React已经渲染
  setTimeout(() => {
    runPageDiagnostics();
  }, 1000);
});

// 捕获未处理的错误
window.addEventListener('error', (event) => {
  console.error('🚨 全局错误:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 未处理的Promise拒绝:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, GraduationCap, BarChart3, Settings, Edit, MessageSquare } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: '首页', icon: Home },
    { id: 'homework', label: '作业管理', icon: BookOpen },
    { id: 'classes', label: '班级管理', icon: Users },
    { id: 'students', label: '学生管理', icon: GraduationCap },
    { id: 'analytics', label: '数据分析', icon: BarChart3 },
    { id: 'reports', label: '学生个人报告', icon: MessageSquare },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  const tools = [
    { id: 'ai-correction', label: '智能批改', icon: Edit },
    { id: 'notifications', label: '精准通知', icon: MessageSquare },
  ];

  const handleNavigation = (itemId: string) => {
    onTabChange(itemId);
    
    // 根据菜单项ID导航到对应路由
    switch (itemId) {
      case 'dashboard':
        navigate('/');
        break;
      case 'homework':
        navigate('/homework');
        break;
      case 'classes':
        navigate('/classes');
        break;
      case 'students':
        navigate('/students');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  // 根据当前路由确定激活状态
  const getActiveState = (itemId: string) => {
    if (location.pathname === '/homework/create') {
      return itemId === 'homework';
    }
    
    const pathMap: Record<string, string> = {
      '/': 'dashboard',
      '/homework': 'homework',
      '/classes': 'classes',
      '/students': 'students',
      '/analytics': 'analytics',
      '/reports': 'reports',
      '/settings': 'settings'
    };
    
    return pathMap[location.pathname] === itemId;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">主导航</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = getActiveState(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <h2 className="text-sm font-medium text-gray-500 mb-3">智能工具</h2>
        <nav className="space-y-1">
          {tools.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
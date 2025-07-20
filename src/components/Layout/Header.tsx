import React, { useState, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { clearAccessToken, getUserProfile as getStoredUserProfile } from '../../services/auth';
import { getUserProfile, formatUserForDisplay, type UserProfile } from '../../services/user';

interface HeaderProps {
  currentUser: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // 获取用户详细信息
  useEffect(() => {
    const fetchUserProfile = async () => {
      // 先检查是否已有存储的用户信息
      const storedProfile = getStoredUserProfile();
      if (storedProfile) {
        setUserProfile(storedProfile);
        console.log('✅ 使用已存储的用户信息');
        return;
      }
      
      // 如果没有存储的信息，则从API获取
      try {
        setProfileLoading(true);
        const profile = await getUserProfile();
        setUserProfile(profile);
        console.log('✅ 用户信息获取成功:', profile);
      } catch (error) {
        console.error('❌ 获取用户信息失败:', error);
        // 如果获取失败，不影响页面正常显示
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // 使用获取到的用户信息，如果没有则使用传入的currentUser
  const displayUser = userProfile ? formatUserForDisplay(userProfile) : currentUser;
  
  // 处理头像显示
  const getAvatarDisplay = () => {
    const avatar = displayUser.avatar;
    
    if (avatar && avatar.trim() !== '') {
      return (
        <img
          src={avatar}
          alt={displayUser.name}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            // 如果头像加载失败，显示默认头像
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    
    // 默认头像
    return (
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <User className="w-5 h-5 text-blue-600" />
      </div>
    );
  };

  const handleLogout = () => {
    // 清除访问令牌
    clearAccessToken();
    // 调用父组件的登出回调
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">智</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">智飞学记</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
            >
              <div className="relative">
                {getAvatarDisplay()}
                {/* 默认头像备用 */}
                <div className="hidden w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                {profileLoading && (
                  <div className="absolute inset-0 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{displayUser.name}</div>
                <div className="text-gray-500">{displayUser.role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {/* 用户信息展示 */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {getAvatarDisplay()}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayUser.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {displayUser.role}
                      </p>
                      {userProfile && (
                        <p className="text-xs text-gray-400 truncate">
                          {userProfile.mobile}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  个人资料
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  系统设置
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
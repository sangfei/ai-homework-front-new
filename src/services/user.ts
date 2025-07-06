import { authenticatedFetch, handleApiResponse } from '../utils/request';
import { setUserProfile } from './auth';

// 用户信息接口定义
export interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  email: string;
  mobile: string;
  sex: number;
  avatar: string;
  loginIp: string;
  loginDate: number;
  createTime: number;
  roles: Array<{
    id: number;
    name: string;
  }>;
  dept: {
    id: number;
    name: string;
    code: string;
    gradeName: string;
    className: string;
    parentId: number;
  };
  posts: any;
}

export interface UserProfileResponse {
  code: number;
  data: UserProfile;
  msg: string;
}

/**
 * 获取用户个人信息
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await authenticatedFetch(
      'http://localhost:48080/admin-api/system/user/profile/get',
      {
        method: 'GET',
      }
    );

    const result: UserProfileResponse = await response.json();
    
    if (result.code !== 0) {
      throw new Error(result.msg || '获取用户信息失败');
    }

    if (!result.data) {
      throw new Error('用户信息数据为空');
    }

    // 保存用户信息到全局变量和存储
    setUserProfile(result.data);

    return result.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败，请检查网络连接');
  }
};

/**
 * 格式化用户信息用于显示
 */
export const formatUserForDisplay = (profile: UserProfile) => {
  return {
    id: profile.id,
    name: profile.nickname || profile.username,
    role: profile.dept?.className || '教师',
    avatar: profile.avatar || '', // 如果为空会使用默认头像
    email: profile.email,
    mobile: profile.mobile,
    department: profile.dept?.name,
    className: profile.dept?.className,
    gradeName: profile.dept?.gradeName,
    roles: profile.roles,
    loginDate: profile.loginDate
  };
};
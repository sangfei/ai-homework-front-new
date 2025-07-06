// 作业流程处理工具

import { createHomework, getHomeworkDetail, type CreateHomeworkRequest } from '../services/homework';

/**
 * 完整的作业创建流程
 * 1. 创建作业
 * 2. 提取作业ID
 * 3. 获取作业详情
 * 4. 保存到全局变量
 */
export const executeHomeworkCreationFlow = async (requestData: CreateHomeworkRequest) => {
  try {
    console.log('🚀 开始作业创建流程...');
    console.log('📤 请求数据:', requestData);

    // 步骤1: 创建作业
    console.log('📝 步骤1: 创建作业...');
    const createResponse = await createHomework(requestData);
    
    if (createResponse.code !== 0) {
      throw new Error(createResponse.msg || '创建作业失败');
    }
    
    console.log('✅ 步骤1完成 - 作业创建成功');
    console.log('📋 创建响应:', createResponse);

    // 步骤2: 提取作业ID
    console.log('🔍 步骤2: 提取作业ID...');
    const homeworkId = createResponse.data;
    
    if (!homeworkId || typeof homeworkId !== 'number') {
      throw new Error('作业ID无效或未返回');
    }
    
    console.log('✅ 步骤2完成 - 作业ID提取成功:', homeworkId);

    // 步骤3: 获取作业详情
    console.log('📖 步骤3: 获取作业详情...');
    const homeworkDetail = await getHomeworkDetail(homeworkId);
    
    console.log('✅ 步骤3完成 - 作业详情获取成功');
    console.log('📄 作业详情:', homeworkDetail);

    // 步骤4: 保存到全局变量
    console.log('💾 步骤4: 保存作业详情到全局变量...');
    
    // 保存到window对象的全局变量
    (window as any).homework_detail_for_update = homeworkDetail;
    
    // 同时保存到localStorage作为备份
    localStorage.setItem('homework_detail_for_update', JSON.stringify(homeworkDetail));
    
    console.log('✅ 步骤4完成 - 作业详情已保存到全局变量');
    console.log('🎉 作业创建流程全部完成！');

    return {
      success: true,
      homeworkId,
      homeworkDetail,
      createResponse
    };

  } catch (error) {
    console.error('❌ 作业创建流程失败:', error);
    
    // 清理可能的部分数据
    delete (window as any).homework_detail_for_update;
    localStorage.removeItem('homework_detail_for_update');
    
    throw error;
  }
};

/**
 * 获取保存的作业详情
 */
export const getSavedHomeworkDetail = () => {
  // 优先从window对象获取
  const windowData = (window as any).homework_detail_for_update;
  if (windowData) {
    return windowData;
  }
  
  // 从localStorage获取备份
  const localData = localStorage.getItem('homework_detail_for_update');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (error) {
      console.error('解析localStorage中的作业详情失败:', error);
    }
  }
  
  return null;
};

/**
 * 清理保存的作业详情
 */
export const clearSavedHomeworkDetail = () => {
  delete (window as any).homework_detail_for_update;
  localStorage.removeItem('homework_detail_for_update');
  console.log('🧹 已清理保存的作业详情');
};

/**
 * 验证全局变量是否正确设置
 */
export const validateGlobalVariables = (): { isValid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  // 检查认证相关的全局变量
  const tenantId = localStorage.getItem('tenantId');
  const accessToken = localStorage.getItem('accessToken');
  
  if (!tenantId) {
    missing.push('tenantId');
  }
  
  if (!accessToken) {
    missing.push('accessToken');
  }
  
  const isValid = missing.length === 0;
  
  if (!isValid) {
    console.warn('⚠️ 缺少必需的全局变量:', missing);
  } else {
    console.log('✅ 所有必需的全局变量都已正确设置');
  }
  
  return { isValid, missing };
};

/**
 * 调试信息输出
 */
export const debugHomeworkFlow = () => {
  console.group('🔧 作业流程调试信息');
  
  // 检查全局变量
  const validation = validateGlobalVariables();
  console.log('全局变量验证:', validation);
  
  // 检查保存的作业详情
  const savedDetail = getSavedHomeworkDetail();
  console.log('保存的作业详情:', savedDetail);
  
  // 检查认证状态
  const authInfo = {
    tenantId: localStorage.getItem('tenantId'),
    accessToken: localStorage.getItem('accessToken') ? '已设置' : '未设置',
    userId: localStorage.getItem('userId')
  };
  console.log('认证信息:', authInfo);
  
  console.groupEnd();
};
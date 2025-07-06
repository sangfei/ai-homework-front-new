// 作业提交完整流程处理

import { executeHomeworkCreationFlow } from './homeworkFlow';
import { uploadHomeworkAttachment } from '../services/fileUpload';
import { getTenantId } from '../services/auth';
import type { CreateHomeworkRequest } from '../services/homework';

// 附件信息接口
export interface AttachmentInfo {
  file: File;
  taskName: string;
  type: 1 | 2; // 1: 作业题目, 2: 作业答案
}

// 任务匹配结果
interface TaskMatch {
  taskName: string;
  taskId: number;
  attachments: AttachmentInfo[];
}

/**
 * 从任务名称匹配homework_detail_for_update中的taskId
 */
const matchTaskIdByName = (taskName: string, homeworkDetail: any): number | null => {
  console.log('🔍 开始匹配任务ID:', {
    taskName,
    hasHomeworkDetail: !!homeworkDetail,
    hasTaskList: !!(homeworkDetail && homeworkDetail.taskList)
  });

  if (!homeworkDetail || !homeworkDetail.taskList) {
    console.warn('⚠️ homework_detail_for_update中没有taskList');
    return null;
  }

  console.log('📋 可用任务列表:', homeworkDetail.taskList.map((t: any) => ({
    id: t.id,
    title: t.taskTitle
  })));
  // 更严格的匹配逻辑
  const matchedTask = homeworkDetail.taskList.find((task: any) => {
    const taskTitle = task.taskTitle || '';
    const inputName = taskName || '';
    
    // 精确匹配
    if (taskTitle === inputName) {
      return true;
    }
    
    // 去除空格后匹配
    if (taskTitle.trim() === inputName.trim()) {
      return true;
    }
    
    // 包含匹配（双向）
    if (taskTitle.includes(inputName) || inputName.includes(taskTitle)) {
      return true;
    }
    
    return false;
  });

  if (matchedTask && matchedTask.id) {
    console.log('✅ 任务匹配成功:', {
      taskName,
      taskId: matchedTask.id,
      taskTitle: matchedTask.taskTitle
    });
    return matchedTask.id;
  }

  console.warn('⚠️ 未找到匹配的任务:', {
    taskName,
    availableTasks: homeworkDetail.taskList.map((t: any) => ({
      id: t.id,
      title: t.taskTitle
    }))
  });
  return null;
};

/**
 * 构建文件上传参数
 */
const buildUploadParams = (
  attachment: AttachmentInfo,
  taskId: number,
  homeworkDetail: any
): any => {
  const tenantId = getTenantId();
  
  if (!tenantId) {
    throw new Error('缺少租户ID，请重新登录');
  }

  return {
    type: attachment.type,
    tenantId,
    className: '二年级一班', // 固定值
    userId: 144, // 固定值
    subject: '英语', // 固定值
    assignedDate: '2025-07-07', // 固定值
    homeworkId: homeworkDetail.id,
    taskId,
    file: attachment.file
  };
};

/**
 * 更新homework_detail_for_update中的taskQuestion或taskAnswer
 */
const updateHomeworkDetailWithFileUrl = (
  homeworkDetail: any,
  taskId: number,
  fileUrl: string,
  type: 1 | 2
): void => {
  if (!homeworkDetail || !homeworkDetail.taskList) {
    console.error('❌ homework_detail_for_update数据无效');
    return;
  }

  const taskIndex = homeworkDetail.taskList.findIndex((task: any) => task.id === taskId);
  
  if (taskIndex === -1) {
    console.error('❌ 未找到对应的任务:', taskId);
    return;
  }

  const task = homeworkDetail.taskList[taskIndex];
  
  // 确保数组存在
  if (!task.taskQuestion) task.taskQuestion = [];
  if (!task.taskAnswer) task.taskAnswer = [];

  // 根据type添加到对应数组
  if (type === 1) {
    task.taskQuestion.push(fileUrl);
    console.log('✅ 文件URL已添加到taskQuestion:', {
      taskId,
      fileUrl,
      currentQuestions: task.taskQuestion.length
    });
  } else {
    task.taskAnswer.push(fileUrl);
    console.log('✅ 文件URL已添加到taskAnswer:', {
      taskId,
      fileUrl,
      currentAnswers: task.taskAnswer.length
    });
  }

  // 更新全局变量
  (window as any).homework_detail_for_update = homeworkDetail;
  localStorage.setItem('homework_detail_for_update', JSON.stringify(homeworkDetail));
};

/**
 * 串行处理所有附件上传
 */
const processAttachmentsSequentially = async (
  taskMatches: TaskMatch[],
  homeworkDetail: any
): Promise<void> => {
  console.log('📁 开始串行处理附件上传...');
  
  let totalFiles = 0;
  let processedFiles = 0;
  
  // 计算总文件数
  taskMatches.forEach(match => {
    totalFiles += match.attachments.length;
  });
  
  console.log(`📊 总共需要上传 ${totalFiles} 个文件`);

  // 按任务顺序处理
  for (const taskMatch of taskMatches) {
    console.log(`📂 处理任务: ${taskMatch.taskName} (${taskMatch.attachments.length}个文件)`);
    
    // 按附件顺序处理
    for (const attachment of taskMatch.attachments) {
      try {
        processedFiles++;
        console.log(`📤 [${processedFiles}/${totalFiles}] 上传文件: ${attachment.file.name}`);
        
        // 构建上传参数
        const uploadParams = buildUploadParams(attachment, taskMatch.taskId, homeworkDetail);
        
        // 上传文件
        const fileUrl = await uploadHomeworkAttachment(uploadParams);
        
        // 更新homework_detail_for_update
        updateHomeworkDetailWithFileUrl(
          homeworkDetail,
          taskMatch.taskId,
          fileUrl,
          attachment.type
        );
        
        console.log(`✅ [${processedFiles}/${totalFiles}] 文件上传完成: ${attachment.file.name}`);
        
        // 添加短暂延迟，避免服务器压力
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ [${processedFiles}/${totalFiles}] 文件上传失败: ${attachment.file.name}`, error);
        throw new Error(`文件 "${attachment.file.name}" 上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
  }
  
  console.log('✅ 所有附件上传完成');
};

/**
 * 完整的作业提交流程
 * 1. 等待get请求完成并确认成功
 * 2. 获取当前表单任务列表中的所有附件
 * 3. 对每个附件执行上传操作
 * 4. 更新homework_detail_for_update对象
 */
export const executeHomeworkSubmissionFlow = async (
  requestData: CreateHomeworkRequest,
  attachmentsByTask: Map<string, AttachmentInfo[]>
): Promise<void> => {
  try {
    console.log('🚀 开始完整的作业提交流程...');
    
    // 步骤1: 执行作业创建流程并等待完成
    console.log('📝 步骤1: 执行作业创建流程...');
    const creationResult = await executeHomeworkCreationFlow(requestData);
    
    if (!creationResult.success) {
      throw new Error('作业创建失败');
    }
    
    console.log('✅ 步骤1完成 - 作业创建成功');
    
    // 步骤2: 获取附件信息
    console.log('📁 步骤2: 处理附件信息...');
    
    if (attachmentsByTask.size === 0) {
      console.log('ℹ️ 没有附件需要上传，流程完成');
      alert('作业创建成功！\n\n没有附件需要上传。');
      return;
    }
    
    // 步骤3: 匹配任务ID并组织附件
    console.log('🔍 步骤3: 匹配任务ID...');
    const taskMatches: TaskMatch[] = [];
    
    for (const [taskName, attachments] of attachmentsByTask) {
      const taskId = matchTaskIdByName(taskName, creationResult.homeworkDetail);
      
      if (taskId === null) {
        console.warn(`⚠️ 跳过未匹配的任务: ${taskName}`);
        continue;
      }
      
      taskMatches.push({
        taskName,
        taskId,
        attachments
      });
    }
    
    if (taskMatches.length === 0) {
      console.warn('⚠️ 没有找到匹配的任务，跳过文件上传');
      alert('作业创建成功！\n\n但没有找到匹配的任务来上传附件。');
      return;
    }
    
    console.log('✅ 步骤3完成 - 任务匹配完成:', taskMatches.map(m => ({
      taskName: m.taskName,
      taskId: m.taskId,
      fileCount: m.attachments.length
    })));
    
    // 步骤4: 串行上传所有附件
    console.log('📤 步骤4: 开始上传附件...');
    await processAttachmentsSequentially(taskMatches, creationResult.homeworkDetail);
    console.log('✅ 步骤4完成 - 所有附件上传完成');
    
    // 步骤5: 显示最终结果
    console.log('📋 步骤5: 显示最终结果...');
    const updatedHomeworkDetail = (window as any).homework_detail_for_update;
    
    console.log('🎉 作业提交流程全部完成！');
    console.log('📄 最终的homework_detail_for_update:', updatedHomeworkDetail);
    
    // 显示成功信息
    alert(`作业提交成功！\n\n📝 作业标题: ${updatedHomeworkDetail.title}\n🆔 作业ID: ${updatedHomeworkDetail.id}\n📁 已上传附件: ${taskMatches.reduce((sum, match) => sum + match.attachments.length, 0)}个\n\n详细信息请查看控制台。`);
    
  } catch (error) {
    console.error('❌ 作业提交流程失败:', error);
    
    // 清理可能的部分数据
    delete (window as any).homework_detail_for_update;
    localStorage.removeItem('homework_detail_for_update');
    
    throw error;
  }
};

/**
 * 从表单组件中收集附件信息的辅助函数
 */
export const collectAttachmentsFromForm = (
  tasks: any[],
  attachmentsByTask: Map<string, AttachmentInfo[]>
): Map<string, AttachmentInfo[]> => {
  const resultAttachments = new Map<string, AttachmentInfo[]>();
  
  console.log('📋 收集表单中的附件信息...');
  console.log('📊 输入参数:', {
    tasksCount: tasks.length,
    attachmentsByTaskSize: attachmentsByTask.size,
    attachmentsByTaskKeys: Array.from(attachmentsByTask.keys())
  });
  
  if (attachmentsByTask && attachmentsByTask.size > 0) {
    console.log(`📁 找到 ${attachmentsByTask.size} 个附件组`);
    
    // 按任务名称重新组织附件
    const taskAttachments = new Map<string, AttachmentInfo[]>();
    
    for (const [key, attachments] of attachmentsByTask) {
      console.log(`🔍 处理附件组: ${key}, 附件数量: ${attachments.length}`);
      
      for (const attachment of attachments) {
        const taskName = attachment.taskName;
        
        if (!taskName || taskName.trim() === '') {
          console.warn('⚠️ 跳过空任务名称的附件:', attachment);
          continue;
        }
        
        if (!taskAttachments.has(taskName)) {
          taskAttachments.set(taskName, []);
        }
        
        taskAttachments.get(taskName)!.push(attachment);
        console.log(`✅ 附件已添加到任务 "${taskName}":`, {
          fileName: attachment.file.name,
          type: attachment.type === 1 ? '作业题目' : '作业答案'
        });
      }
    }
    
    console.log('📊 按任务组织的附件:', Array.from(taskAttachments.entries()).map(([name, files]) => ({
      taskName: name,
      fileCount: files.length
      files: files.map(f => ({ name: f.file.name, type: f.type }))
    })));
    
    return taskAttachments;
  }
  
  console.log('ℹ️ 没有找到附件信息，返回空Map');
  return new Map();
};
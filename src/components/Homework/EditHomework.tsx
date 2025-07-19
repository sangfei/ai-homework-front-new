import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Plus, Trash2, Calendar, Clock, Info, Upload, ZoomIn } from 'lucide-react';
import { DateUtils } from '../../utils/dateUtils';
import ClassSelect from '../Common/ClassSelect';
import ImageUpload from '../Common/ImageUpload';
import { getHomeworkDetail, updateHomeworkDetail } from '../../services/homework';
import { uploadHomeworkAttachment } from '../../services/fileUpload';
import { getTenantId, getUserProfile as getStoredUserProfile } from '../../services/auth';
import { getUserProfile, formatUserForDisplay } from '../../services/user';
import { getClassById } from '../../services/classes';
import { useToast } from '../Common/Toast';

interface Task {
  id: string;
  taskTitle: string;
  taskDescription: string;
  taskQuestion: string[];
  taskAnswer: string[];
}

interface PendingUpload {
  taskId: string;
  type: 'question' | 'answer';
  files: File[];
}

interface HomeworkData {
  id: number;
  title: string;
  deptId: number;
  subject: string;
  assignedDate: number;
  publishTime: number;
  ddlTime: number;
  taskList: Task[];
}

// 图片URL处理函数
const processImageUrl = (url: string): string => {
  if (!url) return '';
  
  // 如果已经是完整的URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是相对路径或域名，添加https://前缀
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // 其他情况，添加https://前缀
  return `https://${url}`;
};

// 批量处理图片URL
const processImageUrls = (urls: string[]): string[] => {
  if (!Array.isArray(urls)) return [];
  return urls.map(processImageUrl).filter(url => url.length > 0);
};

const EditHomework: React.FC = () => {
  const navigate = useNavigate();
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const { success, error: showError } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // 待上传文件管理
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  
  // 图片预览相关状态
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  const [homework, setHomework] = useState<HomeworkData>({
    id: 0,
    title: '',
    deptId: 0,
    subject: '',
    assignedDate: Date.now(),
    publishTime: Date.now(),
    ddlTime: Date.now() + 24 * 60 * 60 * 1000,
    taskList: []
  });

  // 科目选项
  const subjectOptions = [
    { value: '', label: '请选择科目' },
    { value: '语文', label: '语文' },
    { value: '数学', label: '数学' },
    { value: '英语', label: '英语' },
    { value: '物理', label: '物理' },
    { value: '化学', label: '化学' },
    { value: '生物', label: '生物' },
    { value: '历史', label: '历史' },
    { value: '地理', label: '地理' },
    { value: '政治', label: '政治' }
  ];

  // 加载作业数据
  useEffect(() => {
    // 防止重复加载
    if (dataLoaded || !homeworkId) {
      return;
    }

    const loadHomeworkData = async () => {

      try {
        setIsLoading(true);
        console.log('🔍 加载作业数据，ID:', homeworkId);
        
        const homeworkDetail = await getHomeworkDetail(Number(homeworkId));
        console.log('📋 获取到作业详情:', homeworkDetail);
        
        // 确保taskList存在且格式正确
        const taskList = homeworkDetail.taskList || [];
        const formattedTasks = taskList.map((task: any) => ({
          id: task.id?.toString() || Date.now().toString(),
          taskTitle: task.taskTitle || '',
          taskDescription: task.taskDescription || '',
          // 处理图片URL，添加https://前缀并过滤示例数据
          taskQuestion: processImageUrls(
            Array.isArray(task.taskQuestion) 
              ? task.taskQuestion.filter((url: string) => url && !url.includes('example.com'))
              : []
          ),
          taskAnswer: processImageUrls(
            Array.isArray(task.taskAnswer) 
              ? task.taskAnswer.filter((url: string) => url && !url.includes('example.com'))
              : []
          )
        }));

        // 如果没有任务，创建一个默认任务
        if (formattedTasks.length === 0) {
          formattedTasks.push({
            id: '1',
            taskTitle: '',
            taskDescription: '',
            taskQuestion: [],
            taskAnswer: []
          });
        }

        setHomework({
          id: homeworkDetail.id,
          title: homeworkDetail.title || '',
          deptId: homeworkDetail.deptId || 0,
          subject: homeworkDetail.subject || '',
          assignedDate: homeworkDetail.assignedDate || Date.now(),
          publishTime: homeworkDetail.publishTime || Date.now(),
          ddlTime: homeworkDetail.ddlTime || Date.now() + 24 * 60 * 60 * 1000,
          taskList: formattedTasks
        });

        setDataLoaded(true);
        console.log('✅ 作业数据加载完成');
      } catch (error) {
        console.error('❌ 加载作业数据失败:', error);
        showError('加载作业数据失败');
        navigate('/homework');
      } finally {
        setIsLoading(false);
      }
    };

    if (!homeworkId) {
      showError('作业ID无效');
      navigate('/homework');
      return;
    }

    loadHomeworkData();
  }, [homeworkId]); // 移除navigate和showError依赖，避免循环

  // 构建文件上传参数
  const buildUploadParams = async (file: File, taskId: string, type: 1 | 2) => {
    const tenantId = getTenantId();
    const storedProfile = getStoredUserProfile();
    
    if (!tenantId) {
      throw new Error('缺少租户ID，请重新登录');
    }
    
    // 获取用户ID
    const userId = storedProfile?.id?.toString() || '144';
    
    // 获取班级名称
    let className = '未知班级';
    if (homework.deptId) {
      try {
        const classInfo = await getClassById(homework.deptId);
        className = classInfo?.className || `班级ID-${homework.deptId}`;
      } catch (error) {
        console.warn('⚠️ 获取班级名称失败，使用备用方案:', error);
        className = storedProfile?.dept?.className || `班级ID-${homework.deptId}`;
      }
    }
    
    // 格式化作业日期
    const assignedDate = DateUtils.timestampToDateString(homework.assignedDate);
    
    return {
      type,
      tenantId,
      className,
      userId,
      subject: homework.subject,
      assignedDate,
      homeworkId: homework.id,
      taskId: parseInt(taskId),
      file
    };
  };

  // 上传单个文件
  const uploadSingleFile = async (file: File, taskId: string, type: 1 | 2): Promise<string> => {
    try {
      const uploadParams = await buildUploadParams(file, taskId, type);
      console.log('📤 开始上传文件:', {
        fileName: file.name,
        taskId,
        type: type === 1 ? '问题图片' : '答案图片'
      });
      
      const fileUrl = await uploadHomeworkAttachment(uploadParams);
      console.log('✅ 文件上传成功:', { fileName: file.name, fileUrl });
      
      return fileUrl;
    } catch (error) {
      console.error('❌ 文件上传失败:', error);
      throw new Error(`文件 "${file.name}" 上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 批量上传待处理的文件
  const uploadPendingFiles = async (): Promise<void> => {
    if (pendingUploads.length === 0) {
      console.log('ℹ️ 没有待上传的文件');
      return;
    }

    console.log(`📁 开始上传 ${pendingUploads.length} 组待处理文件`);
    
    for (const pending of pendingUploads) {
      const { taskId, type, files } = pending;
      const uploadType = type === 'question' ? 1 : 2;
      
      console.log(`📂 处理任务 ${taskId} 的 ${type} 文件 (${files.length}个)`);
      
      for (const file of files) {
        try {
          const fileUrl = await uploadSingleFile(file, taskId, uploadType);
          
          // 将上传成功的URL添加到对应的数据结构中
          setHomework(prev => ({
            ...prev,
            taskList: prev.taskList.map(task =>
              task.id === taskId 
                ? { 
                    ...task, 
                    [type === 'question' ? 'taskQuestion' : 'taskAnswer']: [
                      ...(type === 'question' ? task.taskQuestion : task.taskAnswer),
                      fileUrl
                    ]
                  }
                : task
            )
          }));
          
          console.log(`✅ 文件已添加到数据结构: ${file.name} -> ${fileUrl}`);
          
          // 添加延迟避免服务器压力
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`❌ 上传失败: ${file.name}`, error);
          throw error;
        }
      }
    }
    
    // 清空待上传列表
    setPendingUploads([]);
    console.log('✅ 所有待上传文件处理完成');
  };

  // 时间戳转换为datetime-local格式
  const timestampToDateTime = (timestamp: number): string => {
    return DateUtils.toDateTimeLocal(new Date(timestamp));
  };

  // datetime-local格式转换为时间戳
  const dateTimeToTimestamp = (dateTimeString: string): number => {
    return DateUtils.fromDateTimeLocal(dateTimeString);
  };

  // 处理基本信息变化
  const handleBasicInfoChange = (field: keyof HomeworkData, value: any) => {
    setHomework(prev => ({ ...prev, [field]: value }));
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 处理任务变化
  const handleTaskChange = (taskId: string, field: keyof Task, value: any) => {
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    }));
    
    // 清除相关错误
    const errorKey = `task_${taskId}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  // 添加任务
  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      taskTitle: '',
      taskDescription: '',
      taskQuestion: [],
      taskAnswer: []
    };
    
    setHomework(prev => ({
      ...prev,
      taskList: [...prev.taskList, newTask]
    }));
  };

  // 删除任务
  const removeTask = (taskId: string) => {
    if (homework.taskList.length > 1) {
      setHomework(prev => ({
        ...prev,
        taskList: prev.taskList.filter(task => task.id !== taskId)
      }));
      
      // 同时清理待上传列表中的相关文件
      setPendingUploads(prev => prev.filter(pending => pending.taskId !== taskId));
    }
  };

  // 处理任务问题图片变化（新上传）
  const handleQuestionImagesChange = useCallback((taskId: string, uploadedImages: any[]) => {
    console.log('📸 任务问题图片变化:', { taskId, imagesCount: uploadedImages.length });
    
    // 提取新上传的文件（状态为success且有file对象的）
    const newFiles = uploadedImages
      .filter(img => img.status === 'success' && img.file)
      .map(img => img.file);
    
    if (newFiles.length > 0) {
      console.log('📁 添加到待上传列表:', { taskId, filesCount: newFiles.length });
      
      // 添加到待上传列表，而不是立即上传
      setPendingUploads(prev => {
        const filtered = prev.filter(p => !(p.taskId === taskId && p.type === 'question'));
        return [...filtered, { taskId, type: 'question', files: newFiles }];
      });
    }
  }, []);

  // 处理任务答案图片变化（新上传）
  const handleAnswerImagesChange = useCallback((taskId: string, uploadedImages: any[]) => {
    console.log('📸 任务答案图片变化:', { taskId, imagesCount: uploadedImages.length });
    
    // 提取新上传的文件（状态为success且有file对象的）
    const newFiles = uploadedImages
      .filter(img => img.status === 'success' && img.file)
      .map(img => img.file);
    
    if (newFiles.length > 0) {
      console.log('📁 添加到待上传列表:', { taskId, filesCount: newFiles.length });
      
      // 添加到待上传列表，而不是立即上传
      setPendingUploads(prev => {
        const filtered = prev.filter(p => !(p.taskId === taskId && p.type === 'answer'));
        return [...filtered, { taskId, type: 'answer', files: newFiles }];
      });
    }
  }, []);

  // 删除现有问题图片
  const handleDeleteExistingQuestionImage = useCallback((taskId: string, imageIndex: number) => {
    console.log('🗑️ 删除现有问题图片:', { taskId, imageIndex });
    
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId 
          ? { ...task, taskQuestion: task.taskQuestion.filter((_, index) => index !== imageIndex) }
          : task
      )
    }));
  }, []);

  // 删除现有答案图片
  const handleDeleteExistingAnswerImage = useCallback((taskId: string, imageIndex: number) => {
    console.log('🗑️ 删除现有答案图片:', { taskId, imageIndex });
    
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId 
          ? { ...task, taskAnswer: task.taskAnswer.filter((_, index) => index !== imageIndex) }
          : task
      )
    }));
  }, []);
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 验证基本信息
    if (!homework.title.trim()) {
      newErrors.title = '请输入作业标题';
    }
    
    if (!homework.deptId) {
      newErrors.deptId = '请选择班级';
    }
    
    if (!homework.subject) {
      newErrors.subject = '请选择科目';
    }

    // 验证时间逻辑
    if (homework.ddlTime <= homework.publishTime) {
      newErrors.ddlTime = '截止时间必须晚于发布时间';
    }

    // 验证任务
    const hasValidTask = homework.taskList.some(task => task.taskTitle.trim());
    if (!hasValidTask) {
      newErrors.tasks = '至少需要一个有效的任务';
    }

    // 验证每个任务的必填字段
    homework.taskList.forEach((task) => {
      if (task.taskTitle.trim()) {
        if (!task.taskDescription.trim()) {
          newErrors[`task_${task.id}_description`] = '任务描述为必填项';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      showError('请检查表单填写是否完整');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 开始提交作业更新...');
      
      // 第一步：上传所有待处理的文件
      if (pendingUploads.length > 0) {
        console.log('📁 先上传待处理的文件...');
        await uploadPendingFiles();
        console.log('✅ 所有文件上传完成');
      }
      
      // 第二步：准备提交数据
      const updateData = {
        ...homework,
        taskList: homework.taskList
          .filter(task => task.taskTitle.trim()) // 过滤掉空任务
          .map(task => ({
            id: task.id,
            taskTitle: task.taskTitle.trim(),
            taskDescription: task.taskDescription.trim(),
            taskQuestion: task.taskQuestion,
            taskAnswer: task.taskAnswer
          }))
      };

      // 数据验证日志
      console.log('📋 最终提交数据验证:');
      updateData.taskList.forEach(task => {
        console.log(`📊 任务 ${task.id} 数据统计:`, {
          title: task.taskTitle,
          questionCount: task.taskQuestion.length,
          answerCount: task.taskAnswer.length,
          questionUrls: task.taskQuestion,
          answerUrls: task.taskAnswer
        });
      });
      
      // 第三步：发送更新请求
      console.log('💾 发送作业更新请求...');
      await updateHomeworkDetail(updateData);
      
      success('作业更新成功！');
      navigate('/homework');
      
    } catch (error) {
      console.error('❌ 更新作业失败:', error);
      showError(`更新作业失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    navigate('/homework');
  };

  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartPosition({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isDragging) {
      setPosition({ x: e.clientX - startPosition.x, y: e.clientY - startPosition.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    e.preventDefault();
    const newScale = scale - e.deltaY * 0.01;
    setScale(Math.min(Math.max(0.1, newScale), 5));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载作业数据中...</p>
        </div>
      </div>
    );
  };
            : [],
          taskAnswer: Array.isArray(task.taskAnswer) 
            ? task.taskAnswer.filter((url: string) => url && !url.includes('example.com'))
            : []
        }));

        // 如果没有任务，创建一个默认任务
        if (formattedTasks.length === 0) {
          formattedTasks.push({
            id: '1',
            taskTitle: '',
            taskDescription: '',
            taskQuestion: [],
            taskAnswer: []
          });
        }

        setHomework({
          id: homeworkDetail.id,
          title: homeworkDetail.title || '',
          deptId: homeworkDetail.deptId || 0,
          subject: homeworkDetail.subject || '',
          assignedDate: homeworkDetail.assignedDate || Date.now(),
          publishTime: homeworkDetail.publishTime || Date.now(),
          ddlTime: homeworkDetail.ddlTime || Date.now() + 24 * 60 * 60 * 1000,
          taskList: formattedTasks
        });

        setDataLoaded(true);
        console.log('✅ 作业数据加载完成');
      } catch (error) {
        console.error('❌ 加载作业数据失败:', error);
        showError('加载作业数据失败');
        navigate('/homework');
      } finally {
        setIsLoading(false);
      }
    };

    if (!homeworkId) {
      showError('作业ID无效');
      navigate('/homework');
      return;
    }

    loadHomeworkData();
  }, [homeworkId]); // 移除navigate和showError依赖，避免循环

  // 时间戳转换为datetime-local格式
  const timestampToDateTime = (timestamp: number): string => {
    return DateUtils.toDateTimeLocal(new Date(timestamp));
  };

  // datetime-local格式转换为时间戳
  const dateTimeToTimestamp = (dateTimeString: string): number => {
    return DateUtils.fromDateTimeLocal(dateTimeString);
  };

  // 处理基本信息变化
  const handleBasicInfoChange = (field: keyof HomeworkData, value: any) => {
    setHomework(prev => ({ ...prev, [field]: value }));
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 处理任务变化
  const handleTaskChange = (taskId: string, field: keyof Task, value: any) => {
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    }));
    
    // 清除相关错误
    const errorKey = `task_${taskId}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  // 添加任务
  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      taskTitle: '',
      taskDescription: '',
      taskQuestion: [],
      taskAnswer: [],
      questionImages: [],
      answerImages: []
    };
    
    setHomework(prev => ({
      ...prev,
      taskList: [...prev.taskList, newTask]
    }));
  };

  // 删除任务
  const removeTask = (taskId: string) => {
    if (homework.taskList.length > 1) {
      setHomework(prev => ({
        ...prev,
        taskList: prev.taskList.filter(task => task.id !== taskId)
      }));
    }
  };

  // 处理任务问题图片变化
  const handleQuestionImagesChange = useCallback((taskId: string, uploadedImages: any[]) => {
    console.log('📸 任务问题图片变化:', { taskId, imagesCount: uploadedImages.length });
    
    // 提取成功上传的图片URL，过滤掉示例数据
    const newImageUrls = uploadedImages
      .filter(img => img.status === 'success' && img.url)
      .map(img => img.url)
      .filter(url => !url.includes('example.com')); // 过滤示例数据
    
    if (newImageUrls.length > 0) {
      // 直接更新到主要的数据结构中
      setHomework(prev => ({
        ...prev,
        taskList: prev.taskList.map(task =>
          task.id === taskId 
            ? { ...task, taskQuestion: [...task.taskQuestion, ...newImageUrls] }
            : task
        )
      }));
      
      console.log('✅ 问题图片已添加到主数据结构:', { taskId, newImageUrls });
    }
  }, []);

  // 处理任务答案图片变化
  const handleAnswerImagesChange = useCallback((taskId: string, uploadedImages: any[]) => {
    console.log('📸 任务答案图片变化:', { taskId, imagesCount: uploadedImages.length });
    
    // 提取成功上传的图片URL，过滤掉示例数据
    const newImageUrls = uploadedImages
      .filter(img => img.status === 'success' && img.url)
      .map(img => img.url)
      .filter(url => !url.includes('example.com')); // 过滤示例数据
    
    if (newImageUrls.length > 0) {
      // 直接更新到主要的数据结构中
      setHomework(prev => ({
        ...prev,
        taskList: prev.taskList.map(task =>
          task.id === taskId 
            ? { ...task, taskAnswer: [...task.taskAnswer, ...newImageUrls] }
            : task
        )
      }));
      
      console.log('✅ 答案图片已添加到主数据结构:', { taskId, newImageUrls });
    }
  }, []);

  // 删除现有问题图片
  const handleDeleteExistingQuestionImage = useCallback((taskId: string, imageIndex: number) => {
    console.log('🗑️ 删除现有问题图片:', { taskId, imageIndex });
    
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId 
          ? { ...task, taskQuestion: task.taskQuestion.filter((_, index) => index !== imageIndex) }
          : task
      )
    }));
  }, []);

  // 删除现有答案图片
  const handleDeleteExistingAnswerImage = useCallback((taskId: string, imageIndex: number) => {
    console.log('🗑️ 删除现有答案图片:', { taskId, imageIndex });
    
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId 
          ? { ...task, taskAnswer: task.taskAnswer.filter((_, index) => index !== imageIndex) }
          : task
      )
    }));
  }, []);
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // 验证基本信息
    if (!homework.title.trim()) {
      newErrors.title = '请输入作业标题';
    }
    
    if (!homework.deptId) {
      newErrors.deptId = '请选择班级';
    }
    
    if (!homework.subject) {
      newErrors.subject = '请选择科目';
    }

    // 验证时间逻辑
    if (homework.ddlTime <= homework.publishTime) {
      newErrors.ddlTime = '截止时间必须晚于发布时间';
    }

    // 验证任务
    const hasValidTask = homework.taskList.some(task => task.taskTitle.trim());
    if (!hasValidTask) {
      newErrors.tasks = '至少需要一个有效的任务';
    }

    // 验证每个任务的必填字段
    homework.taskList.forEach((task) => {
      if (task.taskTitle.trim()) {
        if (!task.taskDescription.trim()) {
          newErrors[`task_${task.id}_description`] = '任务描述为必填项';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      showError('请检查表单填写是否完整');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 开始提交作业更新...');
      
      // 准备提交数据
      const updateData = {
        ...homework,
        taskList: homework.taskList
          .filter(task => task.taskTitle.trim()) // 过滤掉空任务
          .map(task => ({
            id: task.id,
            taskTitle: task.taskTitle.trim(),
            taskDescription: task.taskDescription.trim(),
            // 直接使用主数据结构中的图片URL
            taskQuestion: task.taskQuestion,
            taskAnswer: task.taskAnswer
          }))
      };

      console.log('📋 提交数据:', updateData);
      
      await updateHomeworkDetail(updateData);
      
      success('作业更新成功！');
      navigate('/homework');
      
    } catch (error) {
      console.error('❌ 更新作业失败:', error);
      showError('更新作业失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    navigate('/homework');
  };

  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartPosition({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isDragging) {
      setPosition({ x: e.clientX - startPosition.x, y: e.clientY - startPosition.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLImageElement>) => {
    e.preventDefault();
    const newScale = scale - e.deltaY * 0.01;
    setScale(Math.min(Math.max(0.1, newScale), 5));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载作业数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">编辑作业</h1>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* 基本信息 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">基本信息</h2>
            
            <div className="space-y-6">
              {/* 作业标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作业标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={homework.title}
                  onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入作业标题"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 班级选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    班级 <span className="text-red-500">*</span>
                  </label>
                  <ClassSelect
                    value={homework.deptId}
                    onChange={(value) => handleBasicInfoChange('deptId', Number(value))}
                    placeholder="请选择班级"
                    allowEmpty={false}
                    className={`${
                      errors.deptId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.deptId && (
                    <p className="mt-1 text-sm text-red-600">{errors.deptId}</p>
                  )}
                </div>

                {/* 科目选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    科目 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={homework.subject}
                    onChange={(e) => handleBasicInfoChange('subject', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.subject ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 时间设置 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">时间设置</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 作业日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  作业日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={timestampToDateTime(homework.assignedDate)}
                  onChange={(e) => handleBasicInfoChange('assignedDate', dateTimeToTimestamp(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">默认为当前时间</p>
              </div>

              {/* 发布时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  发布时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={timestampToDateTime(homework.publishTime)}
                  onChange={(e) => handleBasicInfoChange('publishTime', dateTimeToTimestamp(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">默认为当前时间</p>
              </div>

              {/* 截止时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  截止时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={timestampToDateTime(homework.ddlTime)}
                  onChange={(e) => handleBasicInfoChange('ddlTime', dateTimeToTimestamp(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.ddlTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.ddlTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.ddlTime}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">默认为明天上午9:00</p>
              </div>
            </div>
          </div>

          {/* 任务管理 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">任务管理</h2>
              <button
                onClick={addTask}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                <span>添加任务</span>
              </button>
            </div>

            {errors.tasks && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.tasks}</p>
              </div>
            )}

            <div className="space-y-6">
              {homework.taskList.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-900">
                      任务 {index + 1}
                    </h3>
                    {homework.taskList.length > 1 && (
                      <button
                        onClick={() => removeTask(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* 任务标题 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        任务标题 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={task.taskTitle}
                        onChange={(e) => handleTaskChange(task.id, 'taskTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`任务${index + 1}，例如：完成课本78-79课后习题`}
                      />
                    </div>

                    {/* 任务描述 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        任务描述 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={task.taskDescription}
                        onChange={(e) => handleTaskChange(task.id, 'taskDescription', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`task_${task.id}_description`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="请输入任务的详细描述..."
                      />
                      {errors[`task_${task.id}_description`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`task_${task.id}_description`]}</p>
                      )}
                    </div>

                    {/* 图片上传区域 */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">图片管理</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 作业图片上传 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            作业图片
                          </label>
                          <ImageUpload
                            type="homework"
                            existingImages={task.taskQuestion || []}
                            onImagesChange={(images) => handleQuestionImagesChange(task.id, images)}
                            onExistingImageDelete={(index) => handleDeleteExistingQuestionImage(task.id, index)}
                            maxFiles={5}
                            maxSize={5}
                          />
                        </div>

                        {/* 答案图片上传 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            答案图片
                          </label>
                          <ImageUpload
                            type="answer"
                            existingImages={task.taskAnswer || []}
                            onImagesChange={(images) => handleAnswerImagesChange(task.id, images)}
                            onExistingImageDelete={(index) => handleDeleteExistingAnswerImage(task.id, index)}
                            maxFiles={5}
                            maxSize={5}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 说明信息 */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">编辑说明</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 修改作业信息后，系统将按照新的设定时间进行调整</li>
                    <li>• 每个任务的问题和答案图片可以独立管理，互不影响</li>
                    <li>• 已有图片会自动显示，新上传的图片将与已有图片一起保存</li>
                    <li>• 支持 JPG、PNG、GIF、WebP 格式，单张图片不超过5MB</li>
                    <li>• 请确保时间设置合理，截止时间应晚于发布时间</li>
                    <li>• 至少需要保留一个有效的任务</li>
                    <li>• 新上传的图片将在保存时自动上传到服务器</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="flex justify-end space-x-4">
            {pendingUploads.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-orange-600">
                <Upload className="w-4 h-4" />
                <span>有 {pendingUploads.reduce((sum, p) => sum + p.files.length, 0)} 个文件待上传</span>
              </div>
            )}
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>
                {isSubmitting 
                  ? (pendingUploads.length > 0 ? '上传并保存中...' : '保存中...') 
                  : '保存修改'
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 图片预览模态框 */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleClosePreview}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="preview"
              className="max-w-screen-xl max-h-screen-xl cursor-grab"
              style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClosePreview();
              }}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditHomework;
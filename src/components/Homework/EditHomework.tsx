import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Plus, Trash2, Calendar, Clock, Info, Upload } from 'lucide-react';
import ClassSelect from '../Common/ClassSelect';
import ImageUpload from '../Common/ImageUpload';
import { getHomeworkDetail, updateHomeworkDetail } from '../../services/homework';
import { useToast } from '../Common/Toast';

interface Task {
  id: string;
  taskTitle: string;
  taskDescription: string;
  taskQuestion: string[];
  taskAnswer: string[];
  questionImages?: string[];
  answerImages?: string[];
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
  
  // 如果已经包含协议，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果不包含协议，添加https://前缀
  return `https://${url}`;
};

// 处理图片数组，确保所有URL都有正确的协议前缀
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
          taskQuestion: Array.isArray(task.taskQuestion) ? task.taskQuestion : [],
          taskAnswer: Array.isArray(task.taskAnswer) ? task.taskAnswer : [],
          // 处理已有图片，确保URL格式正确
          questionImages: processImageUrls(task.taskQuestion || []),
          answerImages: processImageUrls(task.taskAnswer || [])
        }));

        // 如果没有任务，创建一个默认任务
        if (formattedTasks.length === 0) {
          formattedTasks.push({
            id: '1',
            taskTitle: '',
            taskDescription: '',
            taskQuestion: [],
            taskAnswer: [],
            questionImages: [],
            answerImages: []
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
    return new Date(timestamp).toISOString().slice(0, 16);
  };

  // datetime-local格式转换为时间戳
  const dateTimeToTimestamp = (dateTimeString: string): number => {
    return new Date(dateTimeString).getTime();
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
  const handleQuestionImagesChange = useCallback((taskId: string, images: any[]) => {
    console.log('📸 任务问题图片变化:', { taskId, imagesCount: images.length });
    
    // 提取成功上传的图片URL
    const imageUrls = images
      .filter(img => img.status === 'success' && img.url)
      .map(img => img.url);
    
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId 
          ? { ...task, questionImages: [...(task.questionImages || []), ...imageUrls] }
          : task
      )
    }));
  }, []);

  // 处理任务答案图片变化
  const handleAnswerImagesChange = useCallback((taskId: string, images: any[]) => {
    console.log('📸 任务答案图片变化:', { taskId, imagesCount: images.length });
    
    // 提取成功上传的图片URL
    const imageUrls = images
      .filter(img => img.status === 'success' && img.url)
      .map(img => img.url);
    
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId 
          ? { ...task, answerImages: [...(task.answerImages || []), ...imageUrls] }
          : task
      )
    }));
  }, []);

  // 删除现有问题图片
  const handleDeleteExistingQuestionImage = useCallback((taskId: string, imageIndex: number) => {
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId 
          ? { 
              ...task, 
              questionImages: task.questionImages?.filter((_, index) => index !== imageIndex) || []
            }
          : task
      )
    }));
  }, []);

  // 删除现有答案图片
  const handleDeleteExistingAnswerImage = useCallback((taskId: string, imageIndex: number) => {
    setHomework(prev => ({
      ...prev,
      taskList: prev.taskList.map(task =>
        task.id === taskId 
          ? { 
              ...task, 
              answerImages: task.answerImages?.filter((_, index) => index !== imageIndex) || []
            }
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
            // 合并原有图片和新上传的图片
            taskQuestion: [...(task.taskQuestion || []), ...(task.questionImages || [])],
            taskAnswer: [...(task.taskAnswer || []), ...(task.answerImages || [])]
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
                            existingImages={task.questionImages || []}
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
                            existingImages={task.answerImages || []}
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
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="flex justify-end space-x-4">
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
              <span>{isSubmitting ? '保存中...' : '保存修改'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHomework;
import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Plus, Upload, Trash2, Info, Calendar, Clock, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ClassSelect from '../Common/ClassSelect';
import ImageUpload from '../Common/ImageUpload';
import { useClassSelectOptions } from '../../hooks/useClasses';
import { getHomeworkDetail, updateHomeworkDetail, type CreateHomeworkRequest } from '../../services/homework';
import { validateGlobalVariables } from '../../utils/homeworkFlow';

interface Task {
  id: string;
  taskTitle: string;
  taskDescription: string;
  taskQuestion: string[];
  taskAnswer: string[];
}

interface NewImageData {
  taskId: string;
  type: 'homework' | 'answer';
  images: any[];
}

interface FormData {
  title: string;
  deptId: number | '';
  subject: string;
  assignedDate: string;
  publishTime: string;
  ddlTime: string;
}

const EditHomework: React.FC = () => {
  const navigate = useNavigate();
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const { selectOptions: classOptions, loading: classLoading } = useClassSelectOptions();
  
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

  // 表单数据
  const [formData, setFormData] = useState<FormData>({
    title: '',
    deptId: '',
    subject: '',
    assignedDate: '',
    publishTime: '',
    ddlTime: ''
  });

  // 任务列表
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // 新上传的图片数据
  const [newImageData, setNewImageData] = useState<Map<string, any[]>>(new Map());

  // 表单验证错误
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 时间戳转换为datetime-local格式
  const timestampToDateTime = (timestamp: number): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toISOString().slice(0, 16);
  };

  // datetime-local格式转换为时间戳
  const dateTimeToTimestamp = (dateTimeString: string): number => {
    return new Date(dateTimeString).getTime();
  };

  // 确保URL以https://开头
  const ensureHttpsUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  // 加载作业详情
  useEffect(() => {
    const loadHomeworkDetail = async () => {
      if (!homeworkId) {
        setLoadError('缺少作业ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);

        const homeworkDetail = await getHomeworkDetail(Number(homeworkId));
        
        // 填充表单数据
        setFormData({
          title: homeworkDetail.title || '',
          deptId: homeworkDetail.deptId || '',
          subject: homeworkDetail.subject || '',
          assignedDate: timestampToDateTime(homeworkDetail.assignedDate),
          publishTime: timestampToDateTime(homeworkDetail.publishTime),
          ddlTime: timestampToDateTime(homeworkDetail.ddlTime)
        });

        // 填充任务数据
        if (homeworkDetail.taskList && homeworkDetail.taskList.length > 0) {
          const formattedTasks = homeworkDetail.taskList.map((task: any, index: number) => ({
            id: task.id?.toString() || (index + 1).toString(),
            taskTitle: task.taskTitle || '',
            taskDescription: task.taskDescription || '',
            taskQuestion: (task.taskQuestion || []).map((url: string) => ensureHttpsUrl(url)),
            taskAnswer: (task.taskAnswer || []).map((url: string) => ensureHttpsUrl(url))
          }));
          setTasks(formattedTasks);
        } else {
          // 如果没有任务，创建一个空任务
          setTasks([{ 
            id: '1', 
            taskTitle: '', 
            taskDescription: '', 
            taskQuestion: [], 
            taskAnswer: [] 
          }]);
        }

        console.log('✅ 作业详情加载成功:', homeworkDetail);
      } catch (error) {
        console.error('❌ 加载作业详情失败:', error);
        setLoadError(error instanceof Error ? error.message : '加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeworkDetail();
  }, [homeworkId]);

  // 添加任务
  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      taskTitle: '',
      taskDescription: '',
      taskQuestion: [],
      taskAnswer: []
    };
    setTasks([...tasks, newTask]);
  };

  // 删除任务
  const removeTask = (taskId: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  // 更新任务
  const updateTask = (taskId: string, field: keyof Task, value: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  // 删除任务图片
  const removeTaskImage = (taskId: string, field: 'taskQuestion' | 'taskAnswer', index: number) => {
    if (!window.confirm('确定要删除这张图片吗？删除后将无法恢复。')) {
      return;
    }
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedArray = [...task[field]];
        updatedArray.splice(index, 1);
        return { ...task, [field]: updatedArray };
      }
      return task;
    }));
  };

  // 处理新图片上传
  const handleNewImagesChange = (taskId: string, type: 'homework' | 'answer', images: any[]) => {
    const key = `${taskId}-${type}`;
    setNewImageData(prev => {
      const updated = new Map(prev);
      updated.set(key, images);
      return updated;
    });
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入作业标题';
    }
    
    if (!formData.deptId) {
      newErrors.deptId = '请选择班级';
    }
    
    if (!formData.subject) {
      newErrors.subject = '请选择科目';
    }
    
    if (!formData.assignedDate) {
      newErrors.assignedDate = '请选择作业日期';
    }
    
    if (!formData.publishTime) {
      newErrors.publishTime = '请选择发布时间';
    }
    
    if (!formData.ddlTime) {
      newErrors.ddlTime = '请选择截止时间';
    }

    // 验证任务
    const hasValidTask = tasks.some(task => task.taskTitle.trim());
    if (!hasValidTask) {
      newErrors.tasks = '至少需要一个有效的任务';
    }

    // 验证每个任务的必填字段
    tasks.forEach((task) => {
      if (task.taskTitle.trim()) {
        // 如果任务标题不为空，则任务描述也必须填写
        if (!task.taskDescription.trim()) {
          newErrors[`task_${task.id}_description`] = '任务描述为必填项';
        }
      }
    });

    // 验证时间逻辑
    if (formData.publishTime && formData.ddlTime) {
      const publishDate = new Date(formData.publishTime);
      const ddlDate = new Date(formData.ddlTime);
      
      if (ddlDate <= publishDate) {
        newErrors.ddlTime = '截止时间必须晚于发布时间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      console.warn('⚠️ 表单验证失败');
      return;
    }

    // 提交前再次验证全局变量
    const validation = validateGlobalVariables();
    if (!validation.isValid) {
      console.error('❌ 全局变量验证失败:', validation.missing);
      alert(`缺少必需的认证信息: ${validation.missing.join(', ')}\n请重新登录后再试`);
      return;
    }
    
    console.log('✅ 表单验证通过，开始更新作业');
    setIsSubmitting(true);

    try {
      // 组装更新数据
      const updateData = {
        id: Number(homeworkId),
        title: formData.title.trim(),
        deptId: Number(formData.deptId),
        subject: formData.subject,
        assignedDate: dateTimeToTimestamp(formData.assignedDate),
        publishTime: dateTimeToTimestamp(formData.publishTime),
        ddlTime: dateTimeToTimestamp(formData.ddlTime),
        taskList: tasks
          .filter(task => task.taskTitle.trim()) // 过滤掉空任务
          .map(task => ({
            id: task.id === 'new' ? undefined : Number(task.id),
            taskTitle: task.taskTitle.trim(),
            taskDescription: task.taskDescription.trim(),
            taskQuestion: task.taskQuestion || [],
            taskAnswer: task.taskAnswer || []
          }))
      };

      console.log('📋 准备更新的数据:', updateData);

      // 执行更新
      await updateHomeworkDetail(updateData);

      console.log('✅ 作业更新成功');
      alert('作业更新成功！');
      
      // 跳转回作业列表
      navigate('/homework');
      
    } catch (error) {
      console.error('更新作业失败:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '更新作业失败';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // 根据错误类型提供不同的提示
      if (errorMessage.includes('网络')) {
        errorMessage += '\n\n请检查网络连接后重试';
      } else if (errorMessage.includes('认证') || errorMessage.includes('401')) {
        errorMessage += '\n\n请重新登录后重试';
      } else if (errorMessage.includes('权限') || errorMessage.includes('403')) {
        errorMessage += '\n\n您没有权限执行此操作';
      } else {
        errorMessage += '\n\n请稍后重试，如问题持续存在请联系管理员';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('🏁 作业更新流程结束');
    }
  };

  // 取消操作
  const handleCancel = () => {
    navigate('/homework');
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载作业详情中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">加载失败</h3>
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            onClick={() => navigate('/homework')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回作业列表
          </button>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 作业标题 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作业标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入作业标题"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* 班级选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  班级 <span className="text-red-500">*</span>
                </label>
                <ClassSelect
                  value={formData.deptId}
                  onChange={(value) => setFormData({ ...formData, deptId: Number(value) })}
                  placeholder="请选择班级"
                  allowEmpty={false}
                  loading={classLoading}
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
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                  value={formData.assignedDate}
                  onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.assignedDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.assignedDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.assignedDate}</p>
                )}
              </div>

              {/* 发布时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  发布时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.publishTime}
                  onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.publishTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.publishTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.publishTime}</p>
                )}
              </div>

              {/* 截止时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  截止时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.ddlTime}
                  onChange={(e) => setFormData({ ...formData, ddlTime: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.ddlTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.ddlTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.ddlTime}</p>
                )}
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

            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium text-gray-900">
                      任务 {index + 1}
                    </h3>
                    {tasks.length > 1 && (
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
                        onChange={(e) => updateTask(task.id, 'taskTitle', e.target.value)}
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
                        onChange={(e) => updateTask(task.id, 'taskDescription', e.target.value)}
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

                    {/* 现有图片展示 */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">图片管理</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 作业题目图片管理 */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-3">作业题目</h5>
                          <ImageUpload
                            type="homework"
                            existingImages={task.taskQuestion}
                            onExistingImageDelete={(index) => removeTaskImage(task.id, 'taskQuestion', index)}
                            onImagesChange={(images) => handleNewImagesChange(task.id, 'homework', images)}
                            maxFiles={5}
                            maxSize={5}
                            disabled={isSubmitting}
                          />
                        </div>

                        {/* 作业答案图片管理 */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-3">作业答案</h5>
                          <ImageUpload
                            type="answer"
                            existingImages={task.taskAnswer}
                            onExistingImageDelete={(index) => removeTaskImage(task.id, 'taskAnswer', index)}
                            onImagesChange={(images) => handleNewImagesChange(task.id, 'answer', images)}
                            maxFiles={5}
                            maxSize={5}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 保留原有的图片展示（作为备用） */}
                    {false && (task.taskQuestion.length > 0 || task.taskAnswer.length > 0) && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">现有附件</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 作业题目图片 */}
                          {task.taskQuestion.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-600 mb-2">作业题目</h5>
                              <div className="space-y-2">
                                {task.taskQuestion.map((url, imgIndex) => (
                                  <div key={imgIndex} className="relative group">
                                    <img
                                      src={url}
                                      alt={`作业题目 ${imgIndex + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD4KPC9zdmc+';
                                      }}
                                    />
                                    <button
                                      onClick={() => removeTaskImage(task.id, 'taskQuestion', imgIndex)}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 作业答案图片 */}
                          {task.taskAnswer.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-600 mb-2">作业答案</h5>
                              <div className="space-y-2">
                                {task.taskAnswer.map((url, imgIndex) => (
                                  <div key={imgIndex} className="relative group">
                                    <img
                                      src={url}
                                      alt={`作业答案 ${imgIndex + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD4KPC9zdmc+';
                                      }}
                                    />
                                    <button
                                      onClick={() => removeTaskImage(task.id, 'taskAnswer', imgIndex)}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                    <li>• 现有图片可以通过点击删除按钮移除，新上传的图片支持拖拽上传</li>
                    <li>• 请确保时间设置合理，截止时间应晚于发布时间</li>
                    <li>• 支持 JPG、PNG、GIF、WebP 格式，单张图片不超过5MB</li>
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
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? '保存中...' : '保存修改'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHomework;
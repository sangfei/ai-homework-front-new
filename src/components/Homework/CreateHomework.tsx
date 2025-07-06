import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Plus, Upload, Trash2, Info, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClassSelect from '../Common/ClassSelect';
import FileUpload from '../Common/FileUpload';
import { useClassSelectOptions } from '../../hooks/useClasses';
import { type CreateHomeworkRequest } from '../../services/homework';
import { executeHomeworkCreationFlow, validateGlobalVariables } from '../../utils/homeworkFlow';

interface Task {
  id: string;
  taskTitle: string;
  taskDescription: string;
}

interface FormData {
  title: string;
  deptId: number | '';
  subject: string;
  assignedDate: string;
  publishTime: string;
  ddlTime: string;
}

const CreateHomework: React.FC = () => {
  const navigate = useNavigate();
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

  // 获取默认时间
  const getDefaultTimes = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 明天上午9:00

    return {
      assignedDate: now.toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
      publishTime: now.toISOString().slice(0, 16),
      ddlTime: tomorrow.toISOString().slice(0, 16)
    };
  };

  const defaultTimes = getDefaultTimes();

  // 表单数据
  const [formData, setFormData] = useState<FormData>({
    title: '',
    deptId: '',
    subject: '',
    assignedDate: defaultTimes.assignedDate,
    publishTime: defaultTimes.publishTime,
    ddlTime: defaultTimes.ddlTime
  });

  // 任务列表
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', taskTitle: '', taskDescription: '' }
  ]);

  // 表单验证错误
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化时设置默认值
  useEffect(() => {
    // 如果有班级选项且表单中的deptId为空，设置第一个班级为默认值
    if (classOptions.length > 0 && !formData.deptId) {
      setFormData(prev => ({
        ...prev,
        deptId: classOptions[0].value
      }));
    }
    
    // 验证全局变量
    const validation = validateGlobalVariables();
    if (!validation.isValid) {
      console.warn('⚠️ 检测到缺少必需的全局变量:', validation.missing);
      console.warn('请确保已正确登录并设置了 tenantId 和 accessToken');
    }
  }, [classOptions, formData.deptId]);

  // 添加任务
  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      taskTitle: '',
      taskDescription: ''
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
  const updateTask = (taskId: string, field: 'taskTitle' | 'taskDescription', value: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ));
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

  // 将日期时间字符串转换为时间戳
  const dateTimeToTimestamp = (dateTimeString: string): number => {
    return new Date(dateTimeString).getTime();
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
    
    console.log('✅ 表单验证通过，开始提交作业');
    setIsSubmitting(true);

    try {
      // 组装请求数据
      const requestData: CreateHomeworkRequest = {
        title: formData.title.trim(),
        deptId: Number(formData.deptId),
        subject: formData.subject,
        assignedDate: dateTimeToTimestamp(formData.assignedDate),
        publishTime: dateTimeToTimestamp(formData.publishTime),
        ddlTime: dateTimeToTimestamp(formData.ddlTime),
        taskList: tasks
          .filter(task => task.taskTitle.trim()) // 过滤掉空任务
          .map(task => ({
            taskTitle: task.taskTitle.trim(),
            taskDescription: task.taskDescription.trim(),
            taskQuestion: [], // 保持为空数组
            taskAnswer: []    // 保持为空数组
          }))
      };

      console.log('📋 准备提交的数据:', requestData);

      // 执行完整的作业创建流程
      console.log('🚀 开始执行作业创建流程...');
      const result = await executeHomeworkCreationFlow(requestData);

      console.log('✅ 作业创建流程执行成功:', result);

      // 成功提示 - 使用更友好的提示
      const successMessage = `作业创建成功！\n\n` +
        `📝 作业标题: ${result.homeworkDetail.title}\n` +
        `🆔 作业ID: ${result.homeworkId}\n` +
        `📚 科目: ${result.homeworkDetail.subject}\n` +
        `👥 班级ID: ${result.homeworkDetail.deptId}\n` +
        `📅 截止时间: ${new Date(result.homeworkDetail.ddlTime).toLocaleString()}`;
      
      alert(successMessage);
      
      // 跳转回作业列表
      console.log('🔄 跳转回作业列表页面');
      navigate('/homework');
      
    } catch (error) {
      console.error('创建作业失败:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '创建作业失败';
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
      console.log('🏁 作业创建流程结束');
    }
  };

  // 取消操作
  const handleCancel = () => {
    navigate('/homework');
  };

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
            <h1 className="text-xl font-bold text-gray-900">新建作业</h1>
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
                  value={formData.publishTime}
                  onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.publishTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.publishTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.publishTime}</p>
                )}
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
                  value={formData.ddlTime}
                  onChange={(e) => setFormData({ ...formData, ddlTime: e.target.value })}
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
                        任务描述
                      </label>
                      <textarea
                        value={task.taskDescription}
                        onChange={(e) => updateTask(task.id, 'taskDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入任务的详细描述..."
                      />
                    </div>
                  </div>

                  {/* 文件上传区域 */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">文件上传</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 作业附件上传 */}
                      <div>
                        <FileUpload
                          type="homework"
                          onFilesChange={(files) => {
                            console.log('作业附件文件变化:', files);
                            // 这里可以保存文件信息到状态中
                          }}
                        />
                      </div>

                      {/* 答案附件上传 */}
                      <div>
                        <FileUpload
                          type="answer"
                          onFilesChange={(files) => {
                            console.log('答案附件文件变化:', files);
                            // 这里可以保存文件信息到状态中
                          }}
                        />
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
                  <h3 className="text-sm font-medium text-blue-900 mb-1">创建说明</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 作业创建后，系统将按照设定的发布时间自动发布给学生</li>
                    <li>• 任务的题目和答案内容将在后续的编辑功能中完善</li>
                    <li>• 请确保时间设置合理，截止时间应晚于发布时间</li>
                    <li>• 至少需要创建一个有效的任务才能保存作业</li>
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
              <span>{isSubmitting ? '创建中...' : '创建作业'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHomework;
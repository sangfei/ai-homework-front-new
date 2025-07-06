import React, { useState } from 'react';
import { ArrowLeft, X, Plus, Upload, Trash2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClassSelect from '../Common/ClassSelect';
import { useClassSelectOptions } from '../../hooks/useClasses';

interface Task {
  id: string;
  description: string;
}

interface UploadFile {
  id: string;
  name: string;
  type: 'question' | 'answer';
}

const CreateHomework: React.FC = () => {
  const navigate = useNavigate();
  const { selectOptions: classOptions, loading: classLoading } = useClassSelectOptions();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class: '' as string | number,
    dueDate: '',
    description: ''
  });

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', description: '任务1，例如：完成课本78-79课后习题' }
  ]);

  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 添加任务
  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      description: `任务${tasks.length + 1}，例如：完成课本78-79课后习题`
    };
    setTasks([...tasks, newTask]);
  };

  // 删除任务
  const removeTask = (taskId: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  // 更新任务描述
  const updateTask = (taskId: string, description: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, description } : task
    ));
  };

  // 文件上传处理
  const handleFileUpload = (type: 'question' | 'answer', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newFile: UploadFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type
        };
        setUploadedFiles(prev => [...prev, newFile]);
      });
    }
  };

  // 删除上传的文件
  const removeFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入作业标题';
    }
    if (!formData.subject) {
      newErrors.subject = '请选择科目';
    }
    if (!formData.class) {
      newErrors.class = '请选择班级';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = '请选择截止时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存作业
  const handleSave = () => {
    if (validateForm()) {
      // 这里处理保存逻辑
      console.log('保存作业:', { formData, tasks, uploadedFiles });
      navigate('/homework');
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
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
                <option value="">请选择科目</option>
                <option value="数学">数学</option>
                <option value="语文">语文</option>
                <option value="英语">英语</option>
                <option value="科学">科学</option>
                <option value="物理">物理</option>
                <option value="化学">化学</option>
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                班级 <span className="text-red-500">*</span>
              </label>
              <ClassSelect
                value={formData.class}
                onChange={(value) => setFormData({ ...formData, class: value })}
                placeholder="请选择班级"
                allowEmpty={false}
                className={`${
                  errors.class ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.class && (
                <p className="mt-1 text-sm text-red-600">{errors.class}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                截止时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dueDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* 拍照录入说明 */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">拍照录入说明</h3>
                  <p className="text-sm text-blue-700">每个作业任务，拍照上传空白试题和已填写正确答案的试题。</p>
                </div>
              </div>
              
              {/* 示例图片 */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2">
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">试题内容示例图</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">试题内容</span>
                </div>
                <div className="text-center">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2">
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">答案内容示例图</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">答案内容</span>
                </div>
              </div>
            </div>
          </div>

          {/* 任务管理 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">任务管理</h3>
              <button
                onClick={addTask}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                <span>添加任务</span>
              </button>
            </div>

            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={task.description}
                        onChange={(e) => updateTask(task.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`任务${index + 1}，例如：完成课本78-79课后习题`}
                      />
                    </div>
                    {tasks.length > 1 && (
                      <button
                        onClick={() => removeTask(task.id)}
                        className="ml-3 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* 文件上传区域 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 上传空白试题 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">上传空白试题</h4>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('question', e)}
                          className="hidden"
                          id={`question-upload-${task.id}`}
                        />
                        <label
                          htmlFor={`question-upload-${task.id}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">上传试题</span>
                          <span className="text-xs text-gray-500 mt-1">支持 PDF、JPG、PNG 格式</span>
                        </label>
                      </div>
                    </div>

                    {/* 上传正确答案 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">上传正确答案</h4>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('answer', e)}
                          className="hidden"
                          id={`answer-upload-${task.id}`}
                        />
                        <label
                          htmlFor={`answer-upload-${task.id}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">上传答案</span>
                          <span className="text-xs text-gray-500 mt-1">支持 PDF、JPG、PNG 格式</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 已上传文件列表 */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">已上传文件</h5>
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                file.type === 'question' ? 'bg-blue-500' : 'bg-green-500'
                              }`}></div>
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                file.type === 'question' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {file.type === 'question' ? '试题' : '答案'}
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 作业描述 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">作业描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入作业描述（可选）..."
            />
          </div>

          {/* 底部操作按钮 */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHomework;
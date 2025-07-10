import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Plus, Trash2, Calendar, Clock, Users, BookOpen, Info, Upload, Image as ImageIcon } from 'lucide-react';
import ClassSelect from '../Common/ClassSelect';
import FileUpload from '../Common/FileUpload';
import ImageUpload from '../Common/ImageUpload';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
}

interface HomeworkData {
  id: string;
  title: string;
  description: string;
  classId: string;
  publishTime: string;
  dueTime: string;
  tasks: Task[];
  attachments: File[];
  images: string[];
}

const EditHomework: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [homework, setHomework] = useState<HomeworkData>({
    id: '',
    title: '',
    description: '',
    classId: '',
    publishTime: '',
    dueTime: '',
    tasks: [{ id: '1', title: '', description: '', points: 10 }],
    attachments: [],
    images: []
  });

  useEffect(() => {
    // Load homework data based on id
    if (id) {
      // Mock data loading - replace with actual API call
      setHomework({
        id: id,
        title: '数学作业 - 第三章练习',
        description: '完成教材第三章的所有练习题',
        classId: 'class1',
        publishTime: '2024-01-15T09:00',
        dueTime: '2024-01-20T23:59',
        tasks: [
          { id: '1', title: '基础计算题', description: '完成1-20题', points: 50 },
          { id: '2', title: '应用题', description: '完成21-30题', points: 50 }
        ],
        attachments: [],
        images: ['https://example.com/image1.jpg']
      });
    }
  }, [id]);

  const handleInputChange = (field: keyof HomeworkData, value: any) => {
    setHomework(prev => ({ ...prev, [field]: value }));
  };

  const handleTaskChange = (taskId: string, field: keyof Task, value: any) => {
    setHomework(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    }));
  };

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '',
      description: '',
      points: 10
    };
    setHomework(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const removeTask = (taskId: string) => {
    if (homework.tasks.length > 1) {
      setHomework(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId)
      }));
    }
  };

  const handleFileUpload = (files: File[]) => {
    setHomework(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setHomework(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  const removeImage = (index: number) => {
    setHomework(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate form
      if (!homework.title.trim() || !homework.classId || !homework.publishTime || !homework.dueTime) {
        alert('请填写所有必填字段');
        return;
      }

      if (new Date(homework.publishTime) >= new Date(homework.dueTime)) {
        alert('截止时间必须晚于发布时间');
        return;
      }

      // Mock API call - replace with actual update
      console.log('Updating homework:', homework);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/homework');
    } catch (error) {
      console.error('Failed to update homework:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/homework');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">编辑作业</h1>
            <p className="text-gray-600">修改作业信息和要求</p>
          </div>

          {/* 基本信息 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              基本信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作业标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={homework.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入作业标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择班级 <span className="text-red-500">*</span>
                </label>
                <ClassSelect
                  value={homework.classId}
                  onChange={(classId) => handleInputChange('classId', classId)}
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作业描述
              </label>
              <textarea
                value={homework.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入作业的详细描述和要求"
              />
            </div>
          </div>

          {/* 时间设置 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-600" />
              时间设置
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  发布时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={homework.publishTime}
                  onChange={(e) => handleInputChange('publishTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  截止时间 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={homework.dueTime}
                  onChange={(e) => handleInputChange('dueTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 任务列表 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                任务列表
              </h2>
              <button
                onClick={addTask}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加任务</span>
              </button>
            </div>
            <div className="space-y-4">
              {homework.tasks.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">任务 {index + 1}</h3>
                    {homework.tasks.length > 1 && (
                      <button
                        onClick={() => removeTask(task.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        任务标题
                      </label>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入任务标题"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        分值
                      </label>
                      <input
                        type="number"
                        value={task.points}
                        onChange={(e) => handleTaskChange(task.id, 'points', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      任务描述
                    </label>
                    <textarea
                      value={task.description}
                      onChange={(e) => handleTaskChange(task.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入任务的详细描述"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 附件上传 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-orange-600" />
              附件管理
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文件附件
                </label>
                <FileUpload onUpload={handleFileUpload} />
                {homework.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {homework.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => {
                            setHomework(prev => ({
                              ...prev,
                              attachments: prev.attachments.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片附件
                </label>
                <ImageUpload onUpload={handleImageUpload} />
                {homework.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {homework.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`附件图片 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
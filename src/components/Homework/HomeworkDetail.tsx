import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Calendar, Clock, ZoomIn } from 'lucide-react';
import ClassSelect from '../Common/ClassSelect';
import { getHomeworkDetail } from '../../services/homework';
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

const processImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

const processImageUrls = (urls: string[]): string[] => {
  if (!Array.isArray(urls)) return [];
  return urls.map(processImageUrl).filter(url => url.length > 0);
};

const HomeworkDetail: React.FC = () => {
  const navigate = useNavigate();
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const { error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [homework, setHomework] = useState<HomeworkData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const subjectOptions = [
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

  useEffect(() => {
    const loadHomeworkData = async () => {
      if (!homeworkId) {
        showError('作业ID无效');
        navigate('/homework');
        return;
      }

      try {
        setIsLoading(true);
        const homeworkDetail = await getHomeworkDetail(Number(homeworkId));
        
        const formattedTasks = (homeworkDetail.taskList || []).map((task: any) => ({
          id: task.id?.toString() || Date.now().toString(),
          taskTitle: task.taskTitle || '',
          taskDescription: task.taskDescription || '',
          taskQuestion: Array.isArray(task.taskQuestion) ? task.taskQuestion : [],
          taskAnswer: Array.isArray(task.taskAnswer) ? task.taskAnswer : [],
          questionImages: processImageUrls(task.taskQuestion || []),
          answerImages: processImageUrls(task.taskAnswer || [])
        }));

        setHomework({
          ...homeworkDetail,
          taskList: formattedTasks
        });
      } catch (error) {
        console.error('加载作业数据失败:', error);
        showError('加载作业数据失败');
        navigate('/homework');
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeworkData();
  }, [homeworkId]);

  const timestampToDateTime = (timestamp: number): string => {
    return new Date(timestamp).toISOString().slice(0, 16);
  };

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
    setScale(Math.min(Math.max(0.1, newScale), 5)); // Clamp scale between 0.1 and 5
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

  if (!homework) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">未找到作业信息。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-xl font-bold text-gray-900">作业详情</h1>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">基本信息</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">作业标题</label>
                <input
                  type="text"
                  value={homework.title}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">班级</label>
                  <ClassSelect
                    value={homework.deptId}
                    onChange={() => {}}
                    disabled
                    className="border-gray-300 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">科目</label>
                  <select
                    value={homework.subject}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">时间设置</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  作业日期
                </label>
                <input
                  type="datetime-local"
                  value={timestampToDateTime(homework.assignedDate)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  发布时间
                </label>
                <input
                  type="datetime-local"
                  value={timestampToDateTime(homework.publishTime)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  截止时间
                </label>
                <input
                  type="datetime-local"
                  value={timestampToDateTime(homework.ddlTime)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">任务管理</h2>
            <div className="space-y-6">
              {homework.taskList.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    任务 {index + 1}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">任务标题</label>
                      <input
                        type="text"
                        value={task.taskTitle}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">任务描述</label>
                      <textarea
                        value={task.taskDescription}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">问题图片</label>
                      <div className="flex flex-wrap gap-4">
                        {(task.questionImages || []).map((img, idx) => (
                          <div key={idx} className="relative group w-32 h-32">
                            <img src={img} alt={`question-${idx}`} className="w-full h-full object-cover rounded-lg" />
                            <div
                              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() => handlePreview(img)}
                            >
                              <ZoomIn className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">答案图片</label>
                      <div className="flex flex-wrap gap-4">
                        {(task.answerImages || []).map((img, idx) => (
                          <div key={idx} className="relative group w-32 h-32">
                            <img src={img} alt={`answer-${idx}`} className="w-full h-full object-cover rounded-lg" />
                            <div
                              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() => handlePreview(img)}
                            >
                              <ZoomIn className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleClosePreview}
        >
          <div className="relative">
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
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking image
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

export default HomeworkDetail;
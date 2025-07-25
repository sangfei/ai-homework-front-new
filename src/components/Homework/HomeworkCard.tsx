import React from 'react';
import { Calendar, Users, BookOpen, Clock, FileText, Eye, Edit, Trash2, CheckCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HomeworkItem } from '../../services/homework';

interface HomeworkCardProps {
  homework: HomeworkItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onGrade?: (id: string) => void;
  onDetail?: (id: string) => void;
  onPublish?: (id: string) => void;
}

const HomeworkCard: React.FC<HomeworkCardProps> = ({ 
  homework, 
  onEdit, 
  onDelete, 
  onGrade,
  onDetail,
  onPublish
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    if (!dateString) return '未设置';
    try {
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'completed':
        return '已完成';
      case 'overdue':
        return '已逾期';
      default:
        return '未发布';
    }
  };

  // 根据数字状态获取状态样式
  const getStatusColorByNumber = (status?: number) => {
    switch (status) {
      case 0:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 1:
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 2:
        return 'bg-green-100 text-green-800 border border-green-300';
      case 3:
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // 根据数字状态获取状态文本
  const getStatusTextByNumber = (status?: string) => {
    switch (status) {
      case "UNPUBLISHED":
        return '未发布';
      case "PUBLISHED":
        return '已发布';
      case "COMPLETED":
        return '已完成';
      case "EXPIRED":
        return '已截止';
      default:
        return '未知状态';
    }
  };

  const handleGrade = () => {
    if (onGrade) {
      onGrade(homework.id);
    } else {
      navigate(`/homework/grading/${homework.id}`);
    }
  };

  const handleEdit = () => {
    console.log('🔧 点击编辑按钮，作业ID:', homework.id);
    if (onEdit) {
      onEdit(homework.id);
    } else {
      navigate(`/homework/edit/${homework.id}`);
    }
  };

  const handlePublish = () => {
    console.log('📤 点击发布按钮，作业ID:', homework.id);
    if (onPublish) {
      onPublish(homework.id);
    }
  };

  const handleDetail = () => {
    if (onDetail) {
      onDetail(homework.id);
    } else {
      navigate(`/homework/detail/${homework.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* 卡片头部 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {homework.title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{homework.subject}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>班级ID: {homework.deptId}</span>
            </div>
          </div>
        </div>
        
        {/* 状态标签 - 右上角 */}
        <div className="flex-shrink-0 ml-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColorByNumber(homework.status)}`}>
            {getStatusTextByNumber(homework.status)}
          </span>
        </div>
      </div>

      {/* 时间信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-blue-500" />
          <div>
            <div className="text-gray-500">发布时间</div>
            <div className="font-medium">{formatDate(homework.assignedDate)}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-green-500" />
          <div>
            <div className="text-gray-500">开始时间</div>
            <div className="font-medium">{formatDate(homework.publishTime)}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-red-500" />
          <div>
            <div className="text-gray-500">截止时间</div>
            <div className="font-medium">{formatDate(homework.ddlTime)}</div>
          </div>
        </div>
      </div>

      {/* 作业描述 */}
      {homework.description && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">作业描述</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 pl-6">
            {homework.description}
          </p>
        </div>
      )}

      {/* 子任务列表 */}
      {homework.taskList && homework.taskList.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              任务列表 ({homework.taskList.length}个任务)
            </span>
          </div>
          <div className="space-y-2 pl-6">
            {homework.taskList.slice(0, 2).map((task, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">
                    {task.taskTitle}
                  </span>
                </div>
                {task.taskDescription && (
                  <p className="text-xs text-gray-600 line-clamp-1 ml-4">
                    {task.taskDescription}
                  </p>
                )}
              </div>
            ))}
            {homework.taskList.length > 2 && (
              <div className="text-xs text-gray-500 ml-4">
                还有 {homework.taskList.length - 2} 个任务...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
        {/* 发布按钮 - 仅在未发布状态时显示 */}
        {homework.status === 0 && onPublish && (
          <button
            onClick={handlePublish}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>发布</span>
          </button>
        )}
        
        <button
          onClick={handleDetail}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <Eye className="w-4 h-4" />
          <span>详情</span>
        </button>
        
        <button
          onClick={handleGrade}
          className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-800"
        >
          <CheckCircle className="w-4 h-4" />
          <span>批改</span>
        </button>
        
        {onEdit && (
          <button
            onClick={handleEdit}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <Edit className="w-4 h-4" />
            <span>编辑</span>
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(homework.id)}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
            <span>删除</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeworkCard;
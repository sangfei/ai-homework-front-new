import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Eye, Edit, Trash2, RefreshCw, Search, CheckCircle } from 'lucide-react';
import DeleteConfirmModal from '../Common/DeleteConfirmModal';
import ClassSelect from '../Common/ClassSelect';

interface Homework {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  status: 'published' | 'completed' | 'overdue' | 'unpublished';
  tasks: string[];
  completionRate: number;
  statusColor: string;
}

const HomeworkList: React.FC = () => {
  const navigate = useNavigate();
  const [homeworks] = useState<Homework[]>([
    {
      id: '1',
      title: '拼音复习作业',
      subject: '语文',
      class: '一年级(1)班',
      date: '2025-06-03',
      status: 'published',
      tasks: ['完成课本78-79页课后习题', '预习《声母与韵母》一课'],
      completionRate: 75,
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: '2',
      title: '20以内加减法练习',
      subject: '数学',
      class: '一年级(2)班',
      date: '2025-06-02',
      status: 'completed',
      tasks: ['完成《数学练习册》第15-16页', '完成《提高班冲刺题》'],
      completionRate: 100,
      statusColor: 'bg-green-100 text-green-800'
    },
    {
      id: '3',
      title: '英语单词拼写练习',
      subject: '英语',
      class: '三年级(1)班',
      date: '2025-06-04',
      status: 'unpublished',
      tasks: ['完成26个字母书写练习', '背诵课文《My Family》'],
      completionRate: 0,
      statusColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: '4',
      title: '植物观察日记',
      subject: '科学',
      class: '二年级(2)班',
      date: '2025-06-01',
      status: 'overdue',
      tasks: ['观察一种植物的生长过程并记录', '完成《植物的生长》思考题'],
      completionRate: 30,
      statusColor: 'bg-orange-100 text-orange-800'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    subject: '全部科目',
    grade: '全部班级',
    status: '全部状态',
    startDate: '',
    endDate: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState<string | null>(null);

  const getStatusText = (status: string) => {
    const statusMap = {
      'published': '已发布',
      'completed': '已完成',
      'overdue': '已逾期',
      'unpublished': '未发布'
    };
    return statusMap[status] || status;
  };

  const getProgressBarColor = (rate: number) => {
    if (rate === 100) return 'bg-green-500';
    if (rate >= 75) return 'bg-blue-500';
    if (rate >= 50) return 'bg-yellow-500';
    if (rate > 0) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const handleDeleteClick = (homeworkId: string) => {
    setHomeworkToDelete(homeworkId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (homeworkToDelete) {
      // 这里处理删除逻辑
      console.log('删除作业:', homeworkToDelete);
      
      // 显示成功提示
      // 可以使用 toast 或其他提示组件
      alert('作业删除成功！');
      
      // 重置状态
      setHomeworkToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setHomeworkToDelete(null);
  };

  const getActionButtons = (homework: Homework) => {
    const baseButtons = [
      { icon: Eye, text: '详情', color: 'text-blue-600 hover:text-blue-800' },
      { 
        icon: CheckCircle, 
        text: '批改', 
        color: 'text-green-600 hover:text-green-800',
        onClick: () => navigate(`/homework/grading/${homework.id}`)
      }
    ];

    if (homework.status === 'unpublished') {
      return [
        { icon: Calendar, text: '发布', color: 'text-blue-600 hover:text-blue-800' },
        { icon: Edit, text: '编辑', color: 'text-gray-600 hover:text-gray-800' },
        { icon: Eye, text: '详情', color: 'text-blue-600 hover:text-blue-800' },
        { 
          icon: CheckCircle, 
          text: '批改', 
          color: 'text-green-600 hover:text-green-800',
          onClick: () => navigate(`/homework/grading/${homework.id}`)
        },
        { 
          icon: Trash2, 
          text: '删除', 
          color: 'text-red-600 hover:text-red-800',
          onClick: () => handleDeleteClick(homework.id)
        }
      ];
    }

    if (homework.status === 'overdue') {
      return [
        ...baseButtons,
        { icon: RefreshCw, text: '撤回', color: 'text-orange-600 hover:text-orange-800' }
      ];
    }

    return baseButtons;
  };

  const itemsPerPage = 4;
  const totalPages = Math.ceil(homeworks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHomeworks = homeworks.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateHomework = () => {
    navigate('/homework/create');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">作业管理</h1>
        <button
          onClick={handleCreateHomework}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>新建作业</span>
        </button>
      </div>

      {/* 查询条件区域 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">科目</label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>全部科目</option>
              <option>语文</option>
              <option>数学</option>
              <option>英语</option>
              <option>科学</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">班级</label>
            <ClassSelect
              value={filters.grade}
              onChange={(value) => setFilters({...filters, grade: value.toString()})}
              emptyLabel="全部班级"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>全部状态</option>
              <option>已发布</option>
              <option>已完成</option>
              <option>已逾期</option>
              <option>未发布</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">发布时间范围</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="-/-/-"
              />
              <span className="flex items-center text-gray-500">至</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="-/-/-"
              />
            </div>
          </div>
        </div>
        

      {/* 删除确认弹窗 */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="删除确认"
        message="确定要删除该作业吗？删除后无法恢复。"
        confirmText="确认删除"
        cancelText="取消"
      />
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>重置</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>筛选</span>
          </button>
        </div>
      </div>

      {/* 作业卡片展示区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentHomeworks.map((homework) => (
          <div key={homework.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* 卡片头部 */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{homework.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${homework.statusColor}`}>
                    {getStatusText(homework.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span>{homework.subject}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{homework.class}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{homework.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 任务列表 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">任务列表：</h4>
              <div className="space-y-2">
                {homework.tasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">完成 {task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 批改进度 */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">批改进度：</span>
                <span className="text-sm font-medium text-gray-900">{homework.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressBarColor(homework.completionRate)}`}
                  style={{ width: `${homework.completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end space-x-4">
              {getActionButtons(homework).map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`flex items-center space-x-1 text-sm ${action.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{action.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 分页组件 */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
        <div className="text-sm text-gray-700">
          显示第 {startIndex + 1} 至 {Math.min(startIndex + itemsPerPage, homeworks.length)} 条，共 {homeworks.length} 条记录
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeworkList;
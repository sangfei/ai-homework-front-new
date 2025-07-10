import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Filter } from 'lucide-react';
import { useHomeworkList } from '../../hooks/useHomework';
import { useClassSelectOptions } from '../../hooks/useClasses';
import HomeworkCard from './HomeworkCard';
import ClassSelect from '../Common/ClassSelect';
import DeleteConfirmModal from '../Common/DeleteConfirmModal';
import { deleteHomework, type HomeworkQueryParams } from '../../services/homework';

const HomeworkList: React.FC = () => {
  const navigate = useNavigate();
  const { selectOptions: classOptions, loading: classLoading } = useClassSelectOptions();
  
  // 筛选参数状态
  const [filters, setFilters] = useState<HomeworkQueryParams>({
    deptIds: '',
    subject: '',
    pageNo: 1,
    pageSize: 10,
    startDate: '',
    endDate: '',
    status: ''
  });

  // 使用自定义Hook获取作业数据
  const { homeworks, loading, error, pagination, refetch, changePage } = useHomeworkList(filters);

  // 删除确认弹窗状态
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState<string | null>(null);

  // 科目选项
  const subjectOptions = [
    { value: '', label: '全部科目' },
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

  // 状态选项
  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'published', label: '已发布' },
    { value: 'completed', label: '已完成' },
    { value: 'overdue', label: '已逾期' },
    { value: 'draft', label: '草稿' }
  ];

  // 处理筛选参数变化
  const handleFilterChange = useCallback((key: keyof HomeworkQueryParams, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      pageNo: 1 // 重置到第一页
    }));
  }, []);

  // 执行查询
  const handleSearch = useCallback(() => {
    refetch(filters);
  }, [filters, refetch]);

  // 重置筛选条件
  const handleReset = useCallback(() => {
    const resetFilters: HomeworkQueryParams = {
      deptIds: '',
      subject: '',
      pageNo: 1,
      pageSize: 10,
      startDate: '',
      endDate: '',
      status: ''
    };
    setFilters(resetFilters);
    refetch(resetFilters);
  }, [refetch]);

  // 处理分页变化
  const handlePageChange = useCallback((page: number) => {
    const newFilters = { ...filters, pageNo: page };
    setFilters(newFilters);
    changePage(page);
  }, [filters, changePage]);

  // 处理删除操作
  const handleDeleteClick = (homeworkId: string) => {
    setHomeworkToDelete(homeworkId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (homeworkToDelete) {
      try {
        await deleteHomework(homeworkToDelete);
        setHomeworkToDelete(null);
        refetch(filters); // 重新获取数据
        alert('作业删除成功！');
      } catch (error) {
        console.error('删除作业失败:', error);
        alert('删除作业失败，请稍后重试');
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setHomeworkToDelete(null);
  };

  // 处理编辑操作
  const handleEdit = (homeworkId: string) => {
    console.log('🔧 编辑作业，ID:', homeworkId);
    navigate(`/homework/edit/${homeworkId}`);
  };

  // 处理批改操作
  const handleGrade = (homeworkId: string) => {
    navigate(`/homework/grading/${homeworkId}`);
  };

  // 创建新作业
  const handleCreateHomework = () => {
    navigate('/homework/create');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作业管理</h1>
          <p className="text-gray-600">管理和查看所有作业任务</p>
        </div>
        <button
          onClick={handleCreateHomework}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新建作业</span>
        </button>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          {/* 班级筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">班级</label>
            <ClassSelect
              value={filters.deptIds}
              onChange={(value) => handleFilterChange('deptIds', value.toString())}
              emptyLabel="全部班级"
              loading={classLoading}
            />
          </div>
          
          {/* 科目筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">科目</label>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 状态筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 时间范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重置</span>
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>查询</span>
          </button>
        </div>
      </div>

      {/* 作业列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 列表头部 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-semibold text-gray-900">作业列表</span>
              {!loading && (
                <span className="text-sm text-gray-500">
                  (共 {pagination.total} 条记录)
                </span>
              )}
            </div>
            {loading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">加载中...</span>
              </div>
            )}
          </div>
        </div>

        {/* 列表内容 */}
        <div className="p-6">
          {error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">加载失败</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => refetch(filters)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  重新加载
                </button>
              </div>
            </div>
          ) : homeworks.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无作业</h3>
                <p className="text-gray-600 mb-4">还没有创建任何作业</p>
                <button
                  onClick={handleCreateHomework}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  创建第一个作业
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 作业卡片网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {homeworks.map((homework) => (
                  <HomeworkCard
                    key={homework.id}
                    homework={homework}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onGrade={handleGrade}
                  />
                ))}
              </div>

              {/* 分页组件 */}
              {pagination.total > 0 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    显示第 {((pagination.pageNo - 1) * pagination.pageSize) + 1} 至{' '}
                    {Math.min(pagination.pageNo * pagination.pageSize, pagination.total)} 条，
                    共 {pagination.total} 条记录
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, pagination.pageNo - 1))}
                      disabled={pagination.pageNo === 1 || loading}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    
                    {/* 页码按钮 */}
                    {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm ${
                            pagination.pageNo === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.pageNo + 1)}
                      disabled={pagination.pageNo >= Math.ceil(pagination.total / pagination.pageSize) || loading}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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
    </div>
  );
};

export default HomeworkList;
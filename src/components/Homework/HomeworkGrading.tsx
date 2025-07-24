import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, BarChart3, MessageSquare, Download, Search, Filter } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import UnsubmittedStudentsModal from './UnsubmittedStudentsModal';
import CommonErrorsModal from './CommonErrorsModal';
import ClassSelect from '../Common/ClassSelect';
import { getHomeworkDetail, getClassHomeworkList, type StudentHomeworkVO, type MyTaskDetailVO } from '../../services/homework';
import { useToast } from '../Common/Toast';

interface Student {
  id: number;
  originalStudentId?: number; // 原始学生ID，用于区分同一学生的不同任务
  name: string;
  class: string;
  avatar: string;
  submissionTime?: string;
  status: 'completed' | 'pending' | 'graded' | 'unsubmitted';
  score?: string;
  correctCount?: number;
  totalCount?: number;
  image?: string;
  taskList: MyTaskDetailVO[];
  taskName?: string; // 任务名称
  submissionCount?: number; // 提交数量
}

interface HomeworkInfo {
  id: number;
  title: string;
  subject: string;
  publishTime: string;
  deadline: string;
  submissionCount: number;
  totalStudents: number;
  gradedCount: number;
  correctRate: number;
}

const HomeworkGrading: React.FC = () => {
  const navigate = useNavigate();
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const { showToast } = useToast();
  
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('全部状态');
  const [selectedBatchStatus, setSelectedBatchStatus] = useState<string>('全部批改状态');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('提交时间');
  const [viewMode, setViewMode] = useState<'task' | 'student'>('task'); // 视图模式：按任务或按学生
  const [showUnsubmittedModal, setShowUnsubmittedModal] = useState(false);
  const [showCommonErrorsModal, setShowCommonErrorsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [homeworkInfo, setHomeworkInfo] = useState<HomeworkInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [originalStudents, setOriginalStudents] = useState<StudentHomeworkVO[]>([]);

  // 数据获取
  useEffect(() => {
    const fetchData = async () => {
      if (!homeworkId) return;
      
      try {
        setLoading(true);
        
        // 获取作业详情
         const homeworkDetail = await getHomeworkDetail(parseInt(homeworkId));
         
         // 格式化时间
         const formatTime = (timestamp: number) => {
           return new Date(timestamp).toLocaleString('zh-CN', {
             year: 'numeric',
             month: '2-digit',
             day: '2-digit',
             hour: '2-digit',
             minute: '2-digit'
           });
         };
         
         setHomeworkInfo({
           id: homeworkDetail.id,
           title: homeworkDetail.title,
           subject: homeworkDetail.subject,
           publishTime: formatTime(homeworkDetail.publishTime),
           deadline: formatTime(homeworkDetail.ddlTime),
           submissionCount: 0, // 将从学生列表计算
           totalStudents: 0, // 将从学生列表计算
           gradedCount: 0, // 将从学生列表计算
           correctRate: 0 // 将从学生列表计算
         });
         
         // 获取学生作业列表
         const studentListResponse = await getClassHomeworkList({
           homeworkId: parseInt(homeworkId),
           deptId: 103, // 固定班级ID
           page: 0
         });
         
         setOriginalStudents(studentListResponse.myHomework);
         
         // 转换数据格式 - 为每个学生的每个任务创建单独的卡片
         const transformedStudents: Student[] = [];
         
         studentListResponse.myHomework.forEach((student) => {
           if (student.myTaskList.length === 0) {
             // 没有提交任务的学生
             transformedStudents.push({
               id: student.creator,
               name: `学生${student.creator}`,
               class: '一年级1班',
               avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100`,
               submissionTime: undefined,
               status: 'unsubmitted',
               image: undefined,
               taskList: [],
               taskName: '未提交'
             });
           } else {
             // 为每个任务创建单独的卡片
             student.myTaskList.forEach((task, taskIndex) => {
               const firstImage = task.submissions.length > 0 
                 ? `https://${task.submissions[0]}` 
                 : undefined;
               
               transformedStudents.push({
                 id: student.creator * 1000 + taskIndex, // 确保每个任务卡片有唯一ID
                 originalStudentId: student.creator,
                 name: `学生${student.creator}`,
                 class: '一年级1班',
                 avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100`,
                 submissionTime: '已提交',
                 status: 'pending',
                 image: firstImage,
                 taskList: [task],
                 taskName: task.taskName,
                 submissionCount: task.submissions.length
               });
             });
           }
         });
         
         // 更新统计信息 - 基于原始学生数据计算
         const uniqueStudents = new Set(studentListResponse.myHomework.map(s => s.creator));
         const submittedStudents = new Set(
           studentListResponse.myHomework
             .filter(s => s.myTaskList.length > 0)
             .map(s => s.creator)
         );
         
         setHomeworkInfo(prev => prev ? {
           ...prev,
           submissionCount: submittedStudents.size,
           totalStudents: uniqueStudents.size,
           gradedCount: 0, // 暂时设为0，实际需要根据批改状态计算
           correctRate: 0 // 暂时设为0，实际需要根据批改结果计算
         } : null);
        
        setStudents(transformedStudents);
        } catch (error) {
          console.error('获取作业数据失败:', error);
          showToast('获取作业数据失败', 'error');
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, [homeworkId, showToast]);
  
    // 根据视图模式处理学生数据
    const getDisplayStudents = () => {
      if (viewMode === 'student') {
        // 按学生展示：合并同一学生的多个任务
        const studentMap = new Map<number, Student>();
        
        students.forEach(student => {
          const originalId = student.originalStudentId || student.id;
          
          if (studentMap.has(originalId)) {
            // 合并任务
            const existingStudent = studentMap.get(originalId)!;
            existingStudent.taskList.push(...student.taskList);
            
            // 更新提交数量
            if (student.submissionCount) {
              existingStudent.submissionCount = (existingStudent.submissionCount || 0) + student.submissionCount;
            }
            
            // 更新任务名称（显示多个任务）
            if (student.taskName && existingStudent.taskName !== '未提交') {
              if (existingStudent.taskName && !existingStudent.taskName.includes(student.taskName)) {
                existingStudent.taskName += `, ${student.taskName}`;
              } else if (!existingStudent.taskName) {
                existingStudent.taskName = student.taskName;
              }
            }
            
            // 更新状态（如果有任何已提交的任务，状态就不是未提交）
            if (student.status !== 'unsubmitted' && existingStudent.status === 'unsubmitted') {
              existingStudent.status = student.status;
              existingStudent.submissionTime = student.submissionTime;
            }
          } else {
            // 创建新的学生记录
            studentMap.set(originalId, {
              ...student,
              id: originalId,
              taskList: [...student.taskList]
            });
          }
        });
        
        return Array.from(studentMap.values());
      } else {
        // 按任务展示：返回原始数据
        return students;
      }
    };

  // 错题分析数据
  const errorAnalysis = [
    { task: '任务1-第3题', errorCount: 12, color: 'text-red-600' },
    { task: '任务2-第1题', errorCount: 8, color: 'text-orange-600' },
    { task: '任务2-第2题', errorCount: 8, color: 'text-orange-600' }
  ];

  // 模拟未交作业学生数据
  const unsubmittedStudents = [
    {
      id: '7',
      name: '王小明',
      studentId: '20250107',
      class: '三年级一班',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '8',
      name: '李雪',
      studentId: '20250108',
      class: '三年级二班',
      avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '9',
      name: '张伟',
      studentId: '20250109',
      class: '三年级一班',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '10',
      name: '陈梅',
      studentId: '20250110',
      class: '三年级二班',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '11',
      name: '刘阳',
      studentId: '20250111',
      class: '三年级二班',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">已批改</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">未批改</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">已完成</span>;
      case 'unsubmitted':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">未提交</span>;
      default:
        return null;
    }
  };

  const handleBack = () => {
    navigate('/homework');
  };

  const handleGradeStudent = (submissionId: number) => {
    navigate(`/homework/grading/${homeworkId}/submission/${submissionId}`);
  };

  const handleShowUnsubmitted = () => {
    setShowUnsubmittedModal(true);
  };

  const handleShowCommonErrors = () => {
    setShowCommonErrorsModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!homeworkInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">作业信息不存在</p>
          <button 
            onClick={() => navigate('/homework')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回作业管理
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={handleBack}
            className="hover:text-gray-900"
          >
            作业管理
          </button>
          <span>&gt;</span>
          <span className="text-gray-900">{homeworkInfo.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧信息面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{homeworkInfo.title}</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="text-gray-600">发布时间：{homeworkInfo.publishTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <span className="text-gray-600">截止时间：{homeworkInfo.deadline}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span className="text-gray-600">科目：{homeworkInfo.subject}</span>
                </div>
              </div>
            </div>

            {/* 作业完成情况 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">作业完成情况</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">提交情况</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{homeworkInfo.submissionCount}/{homeworkInfo.totalStudents}人</span>
                      <button 
                        onClick={handleShowUnsubmitted}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(homeworkInfo.submissionCount / homeworkInfo.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">批改进度</span>
                    <span className="text-sm font-medium">{homeworkInfo.gradedCount}/{homeworkInfo.submissionCount}份</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(homeworkInfo.gradedCount / homeworkInfo.submissionCount) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">正确率</span>
                    <span className="text-sm font-medium">{homeworkInfo.correctRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${homeworkInfo.correctRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 常见错误分析 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">常见错误分析</h3>
                <button 
                  onClick={handleShowCommonErrors}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  查看更多 &gt;
                </button>
              </div>
              
              <div className="space-y-3">
                {errorAnalysis.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{item.task}</span>
                    <span className={`text-sm font-medium ${item.color}`}>{item.errorCount}人</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => navigate(`/homework/grading/${homeworkId}/analysis`)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>整体分析</span>
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>导出成绩</span>
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>批量发送反馈</span>
                </button>
              </div>
            </div>
          </div>

          {/* 右侧学生作业列表 */}
          <div className="lg:col-span-3">
            {/* 筛选条件 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              {/* 视图模式切换 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">查看模式：</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('task')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === 'task'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      按任务展示
                    </button>
                    <button
                      onClick={() => setViewMode('student')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === 'student'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      按学生展示
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {viewMode === 'task' ? '每个任务单独显示' : '每个学生合并显示'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <ClassSelect
                    value={selectedGrade}
                    onChange={(value) => setSelectedGrade(value.toString())}
                    emptyLabel="全部班级"
                  />
                </div>
                
                <div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>全部状态</option>
                    <option>已提交</option>
                    <option>未提交</option>
                  </select>
                </div>
                
                <div>
                  <select
                    value={selectedBatchStatus}
                    onChange={(e) => setSelectedBatchStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>全部批改状态</option>
                    <option>已批改</option>
                    <option>未批改</option>
                  </select>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索学生姓名"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  排序方式：
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="ml-2 px-2 py-1 border border-gray-300 rounded text-blue-600"
                  >
                    <option>提交时间</option>
                    <option>学生姓名</option>
                    <option>批改状态</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 学生作业卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {getDisplayStudents().map((student) => (
                <div key={student.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* 作业图片 */}
                  <div className="relative h-48 bg-gray-100">
                    {student.taskList.length > 0 ? (
                      <div className="w-full h-full">
                        {/* 获取所有提交的图片 */}
                        {(() => {
                          const allSubmissions = student.taskList.flatMap(task => task.submissions);
                          if (allSubmissions.length === 0) {
                            return (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                  <div className="text-4xl mb-2">📝</div>
                                  <div className="text-sm">暂无图片</div>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <>
                              {/* 主图片 */}
                              <img
                                src={`${allSubmissions[0]}`}
                                alt={`${student.name}的作业`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              
                              {/* 多图片缩略图 */}
                              {allSubmissions.length > 1 && (
                                <div className="absolute bottom-2 left-2 right-2">
                                  <div className="flex space-x-1 overflow-x-auto">
                                    {allSubmissions.slice(1, 4).map((submission, index) => (
                                      <img
                                        key={index}
                                        src={`https://${submission}`}
                                        alt={`提交${index + 2}`}
                                        className="w-8 h-8 object-cover rounded border-2 border-white shadow-sm flex-shrink-0"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                    ))}
                                    {allSubmissions.length > 4 && (
                                      <div className="w-8 h-8 bg-black bg-opacity-50 rounded border-2 border-white flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">+{allSubmissions.length - 4}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                        
                        {/* 多任务标识 */}
                        {viewMode === 'student' && student.taskList.length > 1 && (
                          <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {student.taskList.length}个任务
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📝</div>
                          <div className="text-sm">{student.status === 'unsubmitted' ? '未提交' : '暂无图片'}</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(student.status)}
                    </div>
                    {/* 提交数量标识 */}
                    {student.submissionCount && student.submissionCount > 1 && viewMode === 'task' && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {student.submissionCount}张图片
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* 学生信息 */}
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.class}</p>
                        {/* 任务名称 */}
                        {student.taskName && (
                          <p className="text-xs text-blue-600 font-medium mt-1">{student.taskName}</p>
                        )}
                      </div>
                      {student.status === 'graded' && student.score && (
                        <div className="ml-auto">
                          <span className="text-lg font-bold text-red-600">{student.score}</span>
                          <span className="text-sm text-gray-600">正确</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      {student.submissionTime || (student.status === 'unsubmitted' ? '未提交' : '提交时间未知')}
                    </div>
                    
                    <div className="flex justify-end">
                      {student.status === 'unsubmitted' ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed"
                        >
                          未提交
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            // 获取第一个任务的submissionId
                            const submissionId = student.taskList.length > 0 ? student.taskList[0].submissionId : student.id;
                            handleGradeStudent(submissionId);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          {student.status === 'graded' ? '查看批改' : '开始批改'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 未交作业学生名单弹窗 */}
      <UnsubmittedStudentsModal
        isOpen={showUnsubmittedModal}
        onClose={() => setShowUnsubmittedModal(false)}
        students={unsubmittedStudents}
        homeworkTitle={homeworkInfo.title}
      />

      {/* 常见错误分析详情弹窗 */}
      <CommonErrorsModal
        isOpen={showCommonErrorsModal}
        onClose={() => setShowCommonErrorsModal(false)}
        homeworkTitle={homeworkInfo.title}
      />
    </div>
  );
};

export default HomeworkGrading;
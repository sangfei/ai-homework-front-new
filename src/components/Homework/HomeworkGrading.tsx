import React, { useState } from 'react';
import { ArrowLeft, Eye, BarChart3, MessageSquare, Download, Search, Filter } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import UnsubmittedStudentsModal from './UnsubmittedStudentsModal';
import CommonErrorsModal from './CommonErrorsModal';
import ClassSelect from '../Common/ClassSelect';

interface Student {
  id: string;
  name: string;
  class: string;
  avatar: string;
  submissionTime: string;
  status: 'completed' | 'pending' | 'graded';
  score?: string;
  correctCount?: number;
  totalCount?: number;
  image: string;
}

const HomeworkGrading: React.FC = () => {
  const navigate = useNavigate();
  const { homeworkId } = useParams();
  
  const [selectedGrade, setSelectedGrade] = useState('全部班级');
  const [selectedStatus, setSelectedStatus] = useState('全部状态');
  const [selectedBatchStatus, setSelectedBatchStatus] = useState('全部批改状态');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('提交时间');
  const [showUnsubmittedModal, setShowUnsubmittedModal] = useState(false);
  const [showCommonErrorsModal, setShowCommonErrorsModal] = useState(false);

  // 模拟作业信息
  const homeworkInfo = {
    title: '三年级数学应用题作业',
    publishTime: '2025-05-26 15:30',
    deadline: '2025-05-28 23:59',
    subject: '数学',
    submissionCount: 36,
    totalStudents: 42,
    gradedCount: 28,
    correctRate: 86.5
  };

  // 模拟学生提交数据
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: '李明',
      class: '三年级一班',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionTime: '05-27 09:15',
      status: 'graded',
      score: '12/33',
      correctCount: 12,
      totalCount: 33,
      image: 'https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '2',
      name: '张华',
      class: '三年级一班',
      avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionTime: '05-27 08:45',
      status: 'graded',
      score: '12/33',
      correctCount: 12,
      totalCount: 33,
      image: 'https://images.pexels.com/photos/6238003/pexels-photo-6238003.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '3',
      name: '王芳',
      class: '三年级二班',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionTime: '05-27 08:30',
      status: 'graded',
      score: '12/33',
      correctCount: 12,
      totalCount: 33,
      image: 'https://images.pexels.com/photos/6238028/pexels-photo-6238028.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '4',
      name: '赵强',
      class: '三年级二班',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionTime: '05-26 21:20',
      status: 'pending',
      image: 'https://images.pexels.com/photos/6238072/pexels-photo-6238072.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '5',
      name: '刘洋',
      class: '三年级一班',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionTime: '05-26 20:15',
      status: 'graded',
      score: '12/33',
      correctCount: 12,
      totalCount: 33,
      image: 'https://images.pexels.com/photos/6238045/pexels-photo-6238045.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '6',
      name: '陈静',
      class: '三年级二班',
      avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionTime: '05-26 19:45',
      status: 'pending',
      image: 'https://images.pexels.com/photos/6238055/pexels-photo-6238055.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ]);

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
      default:
        return null;
    }
  };

  const handleBack = () => {
    navigate('/homework');
  };

  const handleGradeStudent = (studentId: string) => {
    navigate(`/homework/grading/${homeworkId}/student/${studentId}`);
  };

  const handleShowUnsubmitted = () => {
    setShowUnsubmittedModal(true);
  };

  const handleShowCommonErrors = () => {
    setShowCommonErrorsModal(true);
  };

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
              {students.map((student) => (
                <div key={student.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* 作业图片 */}
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={student.image}
                      alt={`${student.name}的作业`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(student.status)}
                    </div>
                  </div>
                  
                  {/* 学生信息 */}
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.class}</p>
                      </div>
                      {student.status === 'graded' && student.score && (
                        <div className="ml-auto">
                          <span className="text-lg font-bold text-red-600">{student.score}</span>
                          <span className="text-sm text-gray-600">正确</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      {student.submissionTime}
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleGradeStudent(student.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        {student.status === 'graded' ? '查看批改' : '开始批改'}
                      </button>
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
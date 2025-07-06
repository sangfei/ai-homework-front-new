import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Download, Search, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ClassSelect from '../Common/ClassSelect';

interface StudentAnalysis {
  id: string;
  name: string;
  class: string;
  avatar: string;
  submissionRate: number;
  totalQuestions: number;
  correctRate: number;
  errorCount: number;
}

const OverallAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { homeworkId } = useParams();
  
  const [selectedGrade, setSelectedGrade] = useState('全部班级');
  const [selectedSubject, setSelectedSubject] = useState('全部科目');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 模拟统计数据
  const statsData = {
    homeworkCount: 92,
    submissionRate: 86.7,
    correctRate: 78.3
  };

  // 模拟学生个体分析数据
  const [studentsData] = useState<StudentAnalysis[]>([
    {
      id: '1',
      name: '张明',
      class: '三年级(1)班',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 95,
      totalQuestions: 92,
      correctRate: 85,
      errorCount: 92
    },
    {
      id: '2',
      name: '李华',
      class: '三年级(1)班',
      avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 88,
      totalQuestions: 87,
      correctRate: 82,
      errorCount: 87
    },
    {
      id: '3',
      name: '王芳',
      class: '三年级(2)班',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 100,
      totalQuestions: 95,
      correctRate: 93,
      errorCount: 95
    },
    {
      id: '4',
      name: '赵小红',
      class: '初一(2)班',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 92,
      totalQuestions: 84,
      correctRate: 78,
      errorCount: 84
    },
    {
      id: '5',
      name: '刘强',
      class: '初一(3)班',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 75,
      totalQuestions: 76,
      correctRate: 68,
      errorCount: 76
    },
    {
      id: '6',
      name: '陈静',
      class: '初一(1)班',
      avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 98,
      totalQuestions: 90,
      correctRate: 88,
      errorCount: 90
    },
    {
      id: '7',
      name: '杨光',
      class: '初一(1)班',
      avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 85,
      totalQuestions: 82,
      correctRate: 75,
      errorCount: 82
    },
    {
      id: '8',
      name: '周梅',
      class: '初一(2)班',
      avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 90,
      totalQuestions: 88,
      correctRate: 84,
      errorCount: 88
    },
    {
      id: '9',
      name: '吴强',
      class: '初一(2)班',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 82,
      totalQuestions: 79,
      correctRate: 72,
      errorCount: 79
    },
    {
      id: '10',
      name: '郑伟',
      class: '初一(2)班',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      submissionRate: 93,
      totalQuestions: 85,
      correctRate: 80,
      errorCount: 85
    }
  ]);

  const handleBack = () => {
    navigate(`/homework/grading/${homeworkId}`);
  };

  const handleQuery = () => {
    // 处理查询逻辑
    console.log('执行查询', { selectedGrade, selectedSubject, startDate, endDate });
  };

  const handleReset = () => {
    setSelectedGrade('全部班级');
    setSelectedSubject('全部科目');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleExportData = () => {
    // 处理导出数据逻辑
    console.log('导出数据');
  };

  const handleViewDetails = (studentId: string) => {
    // 跳转到学生个人报告页面
    navigate(`/student-report/${studentId}`);
  };

  const getProgressBarColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-blue-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getCorrectRateColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-yellow-500';
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(studentsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = studentsData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">数据分析</h1>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>整体统计分析</span>
          </button>
        </div>
        <p className="text-gray-600 mt-2">全面了解学生学习情况，助力教学决策</p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* 筛选区域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">班级</label>
              <ClassSelect
                value={selectedGrade}
                onChange={(value) => setSelectedGrade(value.toString())}
                emptyLabel="全部班级"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">时间范围</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="-/-/-"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="-/-/-"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">科目</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>全部科目</option>
                <option>数学</option>
                <option>语文</option>
                <option>英语</option>
              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={handleQuery}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>查询</span>
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>重置</span>
              </button>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">作业发布数</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{statsData.homeworkCount}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">作业按时完成率</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{statsData.submissionRate}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${statsData.submissionRate}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">作业正确率</h3>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{statsData.correctRate}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${statsData.correctRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* 学生个体分析 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">学生个体分析</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索学生姓名..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleExportData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>导出数据</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学生姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作业按时提交率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总题数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作业正确率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    错题数量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.class}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.submissionRate}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${getProgressBarColor(student.submissionRate)}`}
                          style={{ width: `${student.submissionRate}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.correctRate}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${getCorrectRateColor(student.correctRate)}`}
                          style={{ width: `${student.correctRate}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.errorCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(student.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示第 {startIndex + 1} 至 {Math.min(startIndex + itemsPerPage, studentsData.length)} 条，共 {studentsData.length} 条记录
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
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
                );
              })}
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
      </div>
    </div>
  );
};

export default OverallAnalysis;
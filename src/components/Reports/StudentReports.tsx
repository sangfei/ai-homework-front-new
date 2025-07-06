import React, { useState } from 'react';
import { ArrowLeft, FileText, TrendingUp, Target, Calendar } from 'lucide-react';
import ClassSelect from '../Common/ClassSelect';

const StudentReports: React.FC = () => {
  const [showDetailReport, setShowDetailReport] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const studentData = {
    name: '张明',
    class: '三年级(1)班',
    studentId: '20250101',
    age: '13岁',
    grade: '女',
    parentContact: '13800138001',
    enrollDate: '2023-09-01',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    stats: {
      totalHomework: 92,
      completedHomework: 90,
      accuracy: 88
    },
    chartData: [
      { month: '第1次月考', math: 95, chinese: 90, english: 92 },
      { month: '第2次月考', math: 92, chinese: 88, english: 90 },
      { month: '第3次月考', math: 94, chinese: 92, english: 89 },
      { month: '第4次月考', math: 91, chinese: 90, english: 93 },
      { month: '第5次月考', math: 96, chinese: 94, english: 95 }
    ]
  };

  const errorAnalysis = [
    { subject: '应用题', errorCount: 15, trend: 'up' },
    { subject: '计算题', errorCount: 12, trend: 'down' },
    { subject: '几何题', errorCount: 9, trend: 'up' },
    { subject: '代数题', errorCount: 7, trend: 'down' },
    { subject: '统计题', errorCount: 6, trend: 'up' },
    { subject: '概率题', errorCount: 4, trend: 'down' },
    { subject: '逻辑题', errorCount: 3, trend: 'up' }
  ];

  if (showDetailReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDetailReport(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回数据报告</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">学生个人报告</h2>
            <div className="flex items-center space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>生成报告</span>
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                重置
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 学生基本信息 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <img
                    src={studentData.avatar}
                    alt={studentData.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{studentData.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{studentData.class}</p>
                <div className="text-xs text-gray-500">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block">
                    优秀
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">学号</span>
                  <span className="font-medium">{studentData.studentId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">年龄</span>
                  <span className="font-medium">{studentData.age}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">性别</span>
                  <span className="font-medium">{studentData.grade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">入学时间</span>
                  <span className="font-medium">{studentData.enrollDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">家长联系方式</span>
                  <span className="font-medium">{studentData.parentContact}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-200">
                <textarea
                  className="w-full h-20 p-3 border border-gray-300 rounded-lg text-sm"
                  placeholder="请输入学科评语..."
                />
              </div>
            </div>

            {/* 学习统计 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 关键指标 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">接收作业总数</span>
                    <Target className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{studentData.stats.totalHomework}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">作业提交数</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{studentData.stats.completedHomework}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">作业正确率</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{studentData.stats.accuracy}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>

              {/* 作业正确率分析 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">作业正确率分析</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">数学</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">语文</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">英语</span>
                    </div>
                  </div>
                </div>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {studentData.chartData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex items-end justify-center space-x-1 h-48">
                        <div
                          className="w-4 bg-green-500 rounded-t"
                          style={{ height: `${(data.math / 100) * 192}px` }}
                        ></div>
                        <div
                          className="w-4 bg-orange-500 rounded-t"
                          style={{ height: `${(data.chinese / 100) * 192}px` }}
                        ></div>
                        <div
                          className="w-4 bg-blue-500 rounded-t"
                          style={{ height: `${(data.english / 100) * 192}px` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 text-center">
                        {data.month}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 错题分析 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">错题分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">各科目错题数量分布</h4>
                    <div className="space-y-3">
                      {errorAnalysis.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              ['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'][index % 7]
                            }`}></div>
                            <span className="text-sm text-gray-700">{item.subject}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{item.errorCount}</span>
                            <div className={`w-2 h-2 rounded-full ${
                              item.trend === 'up' ? 'bg-red-500' : 'bg-green-500'
                            }`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">各科目错题数量分布</h4>
                    <div className="h-48 flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="transform -rotate-90 w-32 h-32">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="230" strokeDashoffset="100" strokeLinecap="round" />
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="230" strokeDashoffset="170" strokeLinecap="round" />
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="230" strokeDashoffset="200" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学生个人报告</h1>
          <p className="text-gray-600">全面了解学生个人学习情况，提供针对性的学习指导</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">报告生成</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
            <ClassSelect
              value=""
              onChange={() => {}}
              placeholder="选择班级"
              allowEmpty={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学生</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>选择学生</option>
              <option>张明</option>
              <option>李华</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>数学</option>
              <option>语文</option>
              <option>英语</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">时间范围</label>
            <div className="flex space-x-2">
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowDetailReport(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>生成报告</span>
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            重置
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">报告历史</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">张明 - 数学学习报告</h4>
                  <p className="text-sm text-gray-500">生成时间：2025-06-02</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDetailReport(true)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  查看详情
                </button>
                <button className="text-gray-600 hover:text-gray-900 text-sm">
                  下载
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentReports;
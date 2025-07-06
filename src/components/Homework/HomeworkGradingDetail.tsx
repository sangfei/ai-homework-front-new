import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Maximize2, Check, X, Edit3, Lightbulb } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface Question {
  id: string;
  number: number;
  score: number;
  aiGrading: 'correct' | 'incorrect' | 'partial';
  aiScore: number;
  manualGrading?: 'correct' | 'incorrect' | 'partial';
  manualScore?: number;
  comment: string;
  aiSuggestion: string;
}

const HomeworkGradingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { homeworkId, studentId } = useParams();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(32);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // 学生信息
  const studentInfo = {
    name: '王小明',
    class: '三年级二班',
    submissionTime: '2025-06-02 14:30',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
  };

  // 作业任务
  const tasks = [
    { id: '1', name: '课本78-79课后习题', status: 'completed', color: 'bg-green-100 text-green-800' },
    { id: '2', name: '提高班冲刺题', status: 'pending', color: 'bg-yellow-100 text-yellow-800' },
    { id: '3', name: '口算练习20题', status: 'pending', color: 'bg-yellow-100 text-yellow-800' }
  ];

  // 总体评分
  const overallScores = {
    ai: { score: 65, total: 100, correctCount: 6, correctRate: 65 },
    manual: { score: 70, total: 100, correctCount: 6, correctRate: 70 }
  };

  // 题目数据
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      number: 1,
      score: 10,
      aiGrading: 'correct',
      aiScore: 10,
      manualGrading: 'correct',
      manualScore: 10,
      comment: '',
      aiSuggestion: '解题步骤：1. 先将分数通分，得到同分母分数 12；2. 分子相加：5+3=8；3. 最终结果化简得 2/3。注意通分时需要找最小公倍数。'
    },
    {
      id: '2',
      number: 2,
      score: 10,
      aiGrading: 'correct',
      aiScore: 10,
      manualGrading: 'correct',
      manualScore: 10,
      comment: '',
      aiSuggestion: '解题步骤：1. 先将分数通分，得到同分母分数 12；2. 分子相加：5+3=8；3. 最终结果化简得 2/3。注意通分时需要找最小公倍数。'
    }
  ]);

  const handleBack = () => {
    navigate(`/homework/grading/${homeworkId}`);
  };

  const handlePrevious = () => {
    // 跳转到上一份作业
    console.log('上一份作业');
  };

  const handleNext = () => {
    // 跳转到下一份作业
    console.log('下一份作业');
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleGradingChange = (questionId: string, grading: 'correct' | 'incorrect' | 'partial', score?: number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, manualGrading: grading, manualScore: score || q.score }
        : q
    ));
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, comment } : q
    ));
  };

  const handleApplyAISuggestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      handleCommentChange(questionId, question.aiSuggestion);
    }
  };

  const getGradingButtonClass = (type: 'correct' | 'incorrect' | 'partial', current?: string) => {
    const baseClass = "flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors";
    const isActive = current === type;
    
    switch (type) {
      case 'correct':
        return `${baseClass} ${isActive ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`;
      case 'partial':
        return `${baseClass} ${isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`;
      case 'incorrect':
        return `${baseClass} ${isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`;
      default:
        return baseClass;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
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
            <div className="text-sm text-gray-600">
              作业批改详情 批改进度: {currentPage}/{totalPages}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一份</span>
            </button>
            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <span>下一份</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧作业图片区域 */}
          <div className="lg:col-span-2">
            {/* 学生信息 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={studentInfo.avatar}
                    alt={studentInfo.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{studentInfo.name}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{studentInfo.class}</span>
                      <span>提交时间: {studentInfo.submissionTime}</span>
                    </div>
                  </div>
                </div>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <span>查看正确作业</span>
                </button>
              </div>
              
              {/* 任务状态 */}
              <div className="mt-4 flex items-center space-x-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.color}`}>
                      {task.status === 'completed' ? '已批改' : '待批改'}
                    </span>
                    <span className="text-sm text-gray-700">{task.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 作业图片显示区域 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">作业内容</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">{zoomLevel}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* 作业图片 */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <img
                  src="https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="学生作业"
                  className="w-full h-full object-contain"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                />
              </div>
              
              {/* 缩略图 */}
              <div className="mt-4 flex space-x-2">
                <div className="w-16 h-20 border-2 border-blue-500 rounded-lg overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg?auto=compress&cs=tinysrgb&w=100"
                    alt="第1页"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-16 h-20 border border-gray-300 rounded-lg overflow-hidden opacity-50">
                  <img
                    src="https://images.pexels.com/photos/6238003/pexels-photo-6238003.jpeg?auto=compress&cs=tinysrgb&w=100"
                    alt="第2页"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* AI分析建议 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI分析建议</h3>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  该学生在分数运算方面掌握较好，但在通分步骤上需要加强练习。建议重点关注最小公倍数的求解方法，
                  并提供更多相关练习题目。整体完成质量良好，继续保持。
                </p>
              </div>
            </div>
          </div>

          {/* 右侧批改区域 */}
          <div className="lg:col-span-1">
            {/* 总体评分 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">总体评分</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">AI批改结果</span>
                    <span className="text-2xl font-bold text-blue-600">{overallScores.ai.score}/{overallScores.ai.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>已批改: {overallScores.ai.correctCount} 题</span>
                    <span>正确率: {overallScores.ai.correctRate}%</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-600">人工批改结果</span>
                    <span className="text-2xl font-bold text-green-600">{overallScores.manual.score}/{overallScores.manual.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>已批改: {overallScores.manual.correctCount} 题</span>
                    <span>正确率: {overallScores.manual.correctRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 题目批改 */}
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-blue-600">第 {question.number} 题</h4>
                    <span className="text-sm font-medium text-gray-600">{question.score}分</span>
                  </div>
                  
                  {/* AI批改结果 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">AI批改</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">评分结果:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          question.aiGrading === 'correct' ? 'bg-green-100 text-green-800' :
                          question.aiGrading === 'partial' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.aiGrading === 'correct' ? '正确' : 
                           question.aiGrading === 'partial' ? '部分正确' : '错误'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          得分: {question.aiScore}/{question.score}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 人工批改 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">评分结果:</span>
                    </div>
                    <div className="flex space-x-2 mb-3">
                      <button
                        onClick={() => handleGradingChange(question.id, 'correct', question.score)}
                        className={getGradingButtonClass('correct', question.manualGrading)}
                      >
                        <Check className="w-4 h-4" />
                        <span>正确</span>
                      </button>
                      <button
                        onClick={() => handleGradingChange(question.id, 'partial', Math.floor(question.score / 2))}
                        className={getGradingButtonClass('partial', question.manualGrading)}
                      >
                        <span>部分正确</span>
                      </button>
                      <button
                        onClick={() => handleGradingChange(question.id, 'incorrect', 0)}
                        className={getGradingButtonClass('incorrect', question.manualGrading)}
                      >
                        <X className="w-4 h-4" />
                        <span>错误</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 评语输入 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      请输入答案解析...
                    </label>
                    <textarea
                      value={question.comment}
                      onChange={(e) => handleCommentChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="请输入答案解析..."
                    />
                  </div>
                  
                  {/* AI参考解析 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">AI 参考解析:</span>
                      <button
                        onClick={() => handleApplyAISuggestion(question.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>应用</span>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {question.aiSuggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 底部操作按钮 */}
            <div className="mt-6 space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
                保存批改结果
              </button>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium">
                完成批改并发送
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium">
                暂存草稿
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeworkGradingDetail;
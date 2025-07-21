import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Maximize2, Check, X, Edit3, Lightbulb } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyTaskDetail, MyTaskDetailResponse, MyTaskDetailVO, getHomeworkDetail, getAIHomeworkJudgeResult, AIHomeworkJudgeResponse } from '../../services/homework';
import { useToast } from "../Common/Toast";

interface Question {
  id: string;
  questionId: number;
  question: string;
  submissionAnswer: string;
  standardAnswer: string;
  isCorrect: number;
  answerAnalysis: string;
  aiGrading: 'correct' | 'incorrect' | 'partial';
  aiScore: number;
  manualGrading?: 'correct' | 'incorrect' | 'partial';
  manualScore?: number;
  comment: string;
  subject: string;
}

const HomeworkGradingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { homeworkId, studentId } = useParams();
  const { error: showError } = useToast();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [taskDetail, setTaskDetail] = useState<MyTaskDetailResponse['data'] | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [aiJudgeResults, setAiJudgeResults] = useState<AIHomeworkJudgeResponse['data']>([]);
  const [homeworkSubject, setHomeworkSubject] = useState<string>('');
  
  // 学生信息（从URL参数或API获取）
  const [studentInfo, setStudentInfo] = useState({
    name: '学生',
    class: '',
    submissionTime: '',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
  });

  // 题目数据 - 从AI批改结果转换而来
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // 总体评分 - 基于真实AI批改结果计算
  const overallScores = useMemo(() => ({
    ai: {
      score: questions.reduce((sum, q) => sum + q.aiScore, 0),
      total: questions.length * 10, // 假设每题10分
      correctCount: questions.filter(q => q.aiGrading === 'correct').length,
      correctRate: questions.length > 0 ? Math.round((questions.filter(q => q.aiGrading === 'correct').length / questions.length) * 100) : 0
    },
    manual: {
      score: questions.reduce((sum, q) => sum + (q.manualScore || q.aiScore), 0),
      total: questions.length * 10,
      correctCount: questions.filter(q => (q.manualGrading || q.aiGrading) === 'correct').length,
      correctRate: questions.length > 0 ? Math.round((questions.filter(q => (q.manualGrading || q.aiGrading) === 'correct').length / questions.length) * 100) : 0
    }
  }), [questions]);
  
  // 模拟数据（已注释）
  // const overallScores = {
  //   ai: { score: 65, total: 100, correctCount: 6, correctRate: 65 },
  //   manual: { score: 70, total: 100, correctCount: 6, correctRate: 70 }
  // };
  
  // 模拟数据（已注释）
  // const [questions, setQuestions] = useState<Question[]>([
  //   {
  //     id: '1',
  //     questionId: 1,
  //     question: '题目内容',
  //     submissionAnswer: '学生答案',
  //     standardAnswer: '标准答案',
  //     isCorrect: 1,
  //     answerAnalysis: '解题步骤：1. 先将分数通分，得到同分母分数 12；2. 分子相加：5+3=8；3. 最终结果化简得 2/3。注意通分时需要找最小公倍数。',
  //     aiGrading: 'correct',
  //     aiScore: 10,
  //     manualGrading: 'correct',
  //     manualScore: 10,
  //     comment: '',
  //     subject: '数学'
  //   }
  // ]);

  // 获取作业任务详情数据
  useEffect(() => {
    const fetchTaskDetail = async () => {
      if (!studentId || !homeworkId) {
        showError('学生ID或作业ID无效');
        return;
      }

      try {
        setIsLoading(true);
        
        // 首先获取作业详情以获得发布时间和科目信息
        const homeworkDetail = await getHomeworkDetail(parseInt(homeworkId));
        setHomeworkSubject(homeworkDetail.subject);
        
        // 格式化发布时间为API需要的格式
        const formatTime = (timestamp: number) => {
          return new Date(timestamp).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(/\//g, '-').replace(/,/g, '');
        };
        
        const publishDate = formatTime(homeworkDetail.publishTime);
        console.log('🚀 ~ fetchTaskDetail ~ publishDate:', publishDate);
        
        // 使用作业发布时间作为查询参数
        const response = await getMyTaskDetail({
          date: publishDate,
          studentId: studentId
        });
        
        setTaskDetail(response);
        
        // 收集所有提交的图片
        const allImages: string[] = [];
        response.list.forEach(homework => {
          homework.myTaskList.forEach(task => {
            task.submissions.forEach(submission => {
              // 确保图片URL有https://前缀
              const imageUrl = submission.startsWith('http') ? submission : `https://${submission}`;
              allImages.push(imageUrl);
            });
          });
        });
        
        setCurrentImages(allImages);
        setTotalPages(allImages.length || 1);
        
        // 更新学生信息
        if (response.list.length > 0) {
          const firstHomework = response.list[0];
          setStudentInfo(prev => ({
            ...prev,
            class: firstHomework.className,
            submissionTime: new Date(firstHomework.assignedDate * 1000).toLocaleString('zh-CN')
          }));
          
          // 获取AI批改结果
          if (firstHomework.myTaskList.length > 0) {
            const myHomeworkDetailId = firstHomework.myTaskList[0].homeworkTaskDetailId;
            
            try {
              const aiResults = await getAIHomeworkJudgeResult({
                myHomeworkDetailId: myHomeworkDetailId,
                studentId: parseInt(studentId),
                subject: homeworkDetail.subject,
                limit: 100
              });
              
              setAiJudgeResults(aiResults);
              
              // 将AI批改结果转换为Question格式
              const convertedQuestions: Question[] = aiResults.map((result, index) => ({
                id: result.id,
                questionId: result.questionId,
                question: result.question,
                submissionAnswer: result.submissionAnswer,
                standardAnswer: result.standardAnswer,
                isCorrect: result.isCorrect,
                answerAnalysis: result.answerAnalysis,
                aiGrading: result.isCorrect === 1 ? 'correct' : 'incorrect',
                aiScore: result.isCorrect === 1 ? 10 : 0, // 假设每题10分
                comment: '',
                subject: result.subject
              }));
              
              setQuestions(convertedQuestions);
              console.log('✅ AI批改结果转换完成，题目数量:', convertedQuestions.length);
            } catch (aiError) {
              console.error('获取AI批改结果失败:', aiError);
              // AI批改结果获取失败不影响主要功能
            }
          }
        }
      } catch (error) {
        console.error('获取作业任务详情失败:', error);
        showError('获取作业任务详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetail();
  }, [studentId, homeworkId]); // 添加homeworkId依赖

  const handleBack = () => {
    navigate(`/homework/grading/${homeworkId}`);
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < currentImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setCurrentPage(prev => prev + 1);
    }
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
        ? { ...q, manualGrading: grading, manualScore: score || 10 } // 默认10分
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
      handleCommentChange(questionId, question.answerAnalysis);
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
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-220px)]">
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
              {taskDetail && (
                <div className="mt-4 flex items-center space-x-4">
                  {taskDetail.list.map((homework, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {homework.myHomeworkStatus}
                      </span>
                      <span className="text-sm text-gray-700">{homework.title}</span>
                    </div>
                  ))}
                </div>
              )}
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
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">加载中...</div>
                  </div>
                ) : currentImages.length > 0 ? (
                  <img
                    src={currentImages[currentImageIndex]}
                    alt={`学生作业 第${currentImageIndex + 1}页`}
                    className="w-full h-full object-contain"
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                    onError={(e) => {
                      console.error('图片加载失败:', currentImages[currentImageIndex]);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">暂无作业图片</div>
                  </div>
                )}
              </div>
              
              {/* 缩略图 */}
              {currentImages.length > 0 && (
                <div className="mt-4 flex space-x-2 overflow-x-auto">
                  {currentImages.map((image, index) => (
                    <div 
                      key={index}
                      className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden cursor-pointer ${
                        index === currentImageIndex ? 'border-2 border-blue-500' : 'border border-gray-300'
                      }`}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setCurrentPage(index + 1);
                      }}
                    >
                      <img
                        src={image}
                        alt={`第${index + 1}页`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OWEzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYc8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
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
          <div className="lg:col-span-1 flex flex-col h-[calc(100vh-0px)]">
            <div className="overflow-y-auto flex-grow">
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
              {questions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-blue-600">第 {index + 1} 题</h4>
                    <span className="text-sm font-medium text-gray-600">10分</span>
                  </div>
                  
                  {/* 题目内容 */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">题目:</h5>
                    <p className="text-sm text-gray-800">{question.question}</p>
                  </div>
                  
                  {/* 学生答案和标准答案 */}
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-700 mb-2">学生答案:</h5>
                      <p className="text-sm text-blue-800">{question.submissionAnswer || '未作答'}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="text-sm font-medium text-green-700 mb-2">AI答案:</h5>
                      <p className="text-sm text-green-800">{question.standardAnswer}</p>
                    </div>
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
                          得分: {question.aiScore}/10
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
                        onClick={() => handleGradingChange(question.id, 'correct', 10)}
                        className={getGradingButtonClass('correct', question.manualGrading)}
                      >
                        <Check className="w-4 h-4" />
                        <span>正确</span>
                      </button>
                      <button
                        onClick={() => handleGradingChange(question.id, 'partial', 5)}
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
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">手动评分:</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={question.manualScore || question.aiScore}
                        onChange={(e) => handleGradingChange(question.id, question.manualGrading || 'correct', parseInt(e.target.value))}
                        className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">/10</span>
                    </div>
                  </div>
                  
                  {/* 评语输入 */}
                  {/* <div className="mb-4">
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
                  </div> */}
                  
                  {/* AI参考解析 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">AI 参考解析:</span>
                      <button
                        onClick={() => handleApplyAISuggestion(question.id)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs hover:bg-purple-200 transition-colors"
                      >
                        引用AI分析
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {question.answerAnalysis}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            </div>
            {/* 操作按钮区域 */}
            <div className="mt-auto pt-6 space-y-3">
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
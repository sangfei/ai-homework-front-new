import React from 'react';
import { X, ExternalLink, Lightbulb } from 'lucide-react';

interface ErrorAnalysisItem {
  id: string;
  title: string;
  description: string;
  errorCount: number;
  students: {
    id: string;
    name: string;
    class: string;
    avatar: string;
  }[];
}

interface CommonErrorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeworkTitle?: string;
}

const CommonErrorsModal: React.FC<CommonErrorsModalProps> = ({
  isOpen,
  onClose,
  homeworkTitle = "作业"
}) => {
  if (!isOpen) return null;

  // 模拟错误分析数据
  const errorAnalysisData: ErrorAnalysisItem[] = [
    {
      id: '1',
      title: '第二题：计算错误',
      description: '学生在计算乘法时未正确处理进位，导致最终结果出错',
      errorCount: 12,
      students: [
        {
          id: '1',
          name: '李明',
          class: '三年级一班',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
        },
        {
          id: '2',
          name: '赵强',
          class: '三年级二班',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
        },
        {
          id: '3',
          name: '陈静',
          class: '三年级二班',
          avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100'
        }
      ]
    },
    {
      id: '2',
      title: '第四题：理解错误',
      description: '学生未正确理解题目中的"比...多几倍"概念，解题思路有误',
      errorCount: 8,
      students: [
        {
          id: '4',
          name: '张华',
          class: '三年级一班',
          avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=100'
        },
        {
          id: '5',
          name: '王芳',
          class: '三年级二班',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
        }
      ]
    },
    {
      id: '3',
      title: '第三题：概念混淆',
      description: '学生在处理分数运算时，混淆了加减法和乘除法的运算规则',
      errorCount: 6,
      students: [
        {
          id: '6',
          name: '杨光',
          class: '三年级一班',
          avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100'
        },
        {
          id: '7',
          name: '孙明',
          class: '三年级一班',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
        }
      ]
    }
  ];

  const handleViewHomework = (studentId: string) => {
    // 查看学生作业逻辑
    console.log(`查看学生作业: ${studentId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">常见错误分析详情</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 错误分析内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {errorAnalysisData.map((errorItem) => (
              <div key={errorItem.id} className="bg-gray-50 rounded-lg p-6">
                {/* 错误标题和统计 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {errorItem.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {errorItem.description}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">
                        {errorItem.errorCount}
                      </span>
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-xs text-gray-500">人</span>
                    </div>
                  </div>
                </div>

                {/* 学生列表 */}
                <div className="space-y-3">
                  {errorItem.students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{student.name}</h4>
                          <p className="text-xs text-gray-600">{student.class}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewHomework(student.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <span>查看作业</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部建议和操作 */}
        <div className="border-t border-gray-200">
          {/* 教学建议 */}
          <div className="px-6 py-4 bg-yellow-50">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">建议：</h4>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  针对常见错误，可以在课堂上进行重点讲解和练习。点击"查看作业"可以直接查看学生的具体答题情况。
                </p>
              </div>
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="p-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                关闭
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                导出错误分析报告
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonErrorsModal;
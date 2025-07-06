import React from 'react';
import { X, Send, Info } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  avatar: string;
}

interface UnsubmittedStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  homeworkTitle?: string;
}

const UnsubmittedStudentsModal: React.FC<UnsubmittedStudentsModalProps> = ({
  isOpen,
  onClose,
  students,
  homeworkTitle = "作业"
}) => {
  if (!isOpen) return null;

  const handleSendReminder = (studentId: string) => {
    // 发送提醒逻辑
    console.log(`发送提醒给学生: ${studentId}`);
  };

  const handleSendAllReminders = () => {
    // 批量发送提醒逻辑
    console.log('批量发送提醒给所有未交作业学生');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">未交作业学生名单</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 学生列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          {students.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Info className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">所有学生都已提交作业</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.class}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendReminder(student.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>发送提醒</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示和操作 */}
        {students.length > 0 && (
          <>
            {/* 温馨提示 */}
            <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 leading-relaxed">
                  温馨提示：您可以点击"发送提醒"按钮，系统会自动通知未交作业的学生和家长。建议在作业截止前及时提醒，以免影响学习进度。
                </p>
              </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={handleSendAllReminders}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                  <span>批量提醒</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UnsubmittedStudentsModal;
Here's the fixed version with all missing closing brackets added:

```typescript
                </div>
              ))}
            </div>
          </div>

          {/* 说明信息 */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">编辑说明</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 修改作业信息后，系统将按照新的设定时间进行调整</li>
                    <li>• 现有图片可以通过点击删除按钮移除，新上传的图片支持拖拽上传</li>
                    <li>• 请确保时间设置合理，截止时间应晚于发布时间</li>
                    <li>• 支持 JPG、PNG、GIF、WebP 格式，单张图片不超过5MB</li>
                    <li>• 至少需要保留一个有效的任务</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? '保存中...' : '保存修改'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHomework;
```
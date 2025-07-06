import Mock from 'mockjs'

export default () => {
  // 获取数据分析统计
  Mock.mock('/api/analytics/stats', 'get', {
    code: 200,
    data: {
      homeworkCount: 92,
      submissionRate: 86.7,
      accuracyRate: 78.3
    }
  })

  // 获取学生个体分析
  Mock.mock('/api/analytics/students', 'get', {
    code: 200,
    'data|10': [{
      'id|+1': 1,
      name: '@cname',
      class: '@pick(["三年级一班", "三年级二班", "四年级一班"])',
      'homeworkSubmission|70-100': 85,
      'totalScore|60-100': 80,
      'accuracy|60-95': 75,
      avatar: '@image("50x50", "@color", "@cname")'
    }]
  })

  // 导出分析数据
  Mock.mock('/api/analytics/export', 'get', {
    code: 200,
    message: '导出成功',
    data: {
      downloadUrl: 'https://example.com/export.xlsx'
    }
  })
}
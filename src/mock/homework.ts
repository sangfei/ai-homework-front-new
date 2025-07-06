import Mock from 'mockjs'

const homeworkList = Mock.mock({
  'data|10': [{
    'id|+1': 1,
    title: '@ctitle(10, 20)',
    subject: '@pick(["数学", "语文", "英语", "物理", "化学"])',
    class: '@pick(["三年级一班", "三年级二班", "四年级一班", "四年级二班"])',
    dueDate: '@datetime("yyyy-MM-dd HH:mm")',
    'submittedCount|20-40': 30,
    'totalCount|40-50': 45,
    'completionRate|60-100': 85,
    status: '@pick(["active", "completed", "overdue"])',
    description: '@cparagraph(1, 3)',
    createdAt: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updatedAt: '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

export default () => {
  // 获取作业列表
  Mock.mock('/api/homework', 'get', {
    code: 200,
    ...homeworkList
  })

  // 创建作业
  Mock.mock('/api/homework', 'post', {
    code: 200,
    message: '创建成功',
    data: {
      id: '@increment'
    }
  })

  // 更新作业
  Mock.mock(/\/api\/homework\/\d+/, 'put', {
    code: 200,
    message: '更新成功'
  })

  // 删除作业
  Mock.mock(/\/api\/homework\/\d+/, 'delete', {
    code: 200,
    message: '删除成功'
  })

  // 获取作业详情
  Mock.mock(/\/api\/homework\/\d+/, 'get', {
    code: 200,
    data: homeworkList.data[0]
  })
}
import Mock from 'mockjs'

const studentList = Mock.mock({
  'data|20': [{
    'id|+1': 1,
    name: '@cname',
    studentId: () => '2025' + Mock.Random.string('number', 4),
    class: '@pick(["三年级一班", "三年级二班", "四年级一班", "四年级二班"])',
    grade: '@pick(["三年级", "四年级", "五年级", "六年级"])',
    email: '@email',
    phone: /^1[3-9]\d{9}$/,
    parentName: '@cname',
    parentPhone: /^1[3-9]\d{9}$/,
    enrollDate: '@date("yyyy-MM-dd")',
    status: '@pick(["active", "inactive"])',
    avatar: '@image("100x100", "@color", "@cname")'
  }]
})

export default () => {
  // 获取学生列表
  Mock.mock('/api/students', 'get', {
    code: 200,
    ...studentList
  })

  // 创建学生
  Mock.mock('/api/students', 'post', {
    code: 200,
    message: '创建成功',
    data: {
      id: '@increment'
    }
  })

  // 更新学生
  Mock.mock(/\/api\/students\/\d+/, 'put', {
    code: 200,
    message: '更新成功'
  })

  // 删除学生
  Mock.mock(/\/api\/students\/\d+/, 'delete', {
    code: 200,
    message: '删除成功'
  })

  // 获取学生详情
  Mock.mock(/\/api\/students\/\d+/, 'get', {
    code: 200,
    data: studentList.data[0]
  })
}
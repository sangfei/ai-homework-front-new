import Mock from 'mockjs'

const classList = Mock.mock({
  'data|8': [{
    'id|+1': 1,
    name: () => Mock.Random.pick(['三年级', '四年级', '五年级', '六年级']) + Mock.Random.pick(['一班', '二班', '三班']),
    grade: '@pick(["三年级", "四年级", "五年级", "六年级"])',
    teacher: '@cname',
    'studentCount|30-50': 40,
    subjects: () => Mock.Random.shuffle(['数学', '语文', '英语', '物理', '化学', '生物']).slice(0, Mock.Random.integer(3, 5)),
    createdAt: '@date("yyyy-MM-dd")'
  }]
})

export default () => {
  // 获取班级列表
  Mock.mock('/api/classes', 'get', {
    code: 200,
    ...classList
  })

  // 创建班级
  Mock.mock('/api/classes', 'post', {
    code: 200,
    message: '创建成功',
    data: {
      id: '@increment'
    }
  })

  // 更新班级
  Mock.mock(/\/api\/classes\/\d+/, 'put', {
    code: 200,
    message: '更新成功'
  })

  // 删除班级
  Mock.mock(/\/api\/classes\/\d+/, 'delete', {
    code: 200,
    message: '删除成功'
  })

  // 获取班级详情
  Mock.mock(/\/api\/classes\/\d+/, 'get', {
    code: 200,
    data: classList.data[0]
  })
}
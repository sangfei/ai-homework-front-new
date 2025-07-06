import Mock from 'mockjs'
import authMock from './auth'
import homeworkMock from './homework'
import studentMock from './students'
import classMock from './classes'
import analyticsMock from './analytics'

export const setupMock = () => {
  // 设置延迟时间
  Mock.setup({
    timeout: '200-600'
  })

  // 注册各模块的mock
  authMock()
  homeworkMock()
  studentMock()
  classMock()
  analyticsMock()
}
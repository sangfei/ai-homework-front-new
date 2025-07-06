export interface Homework {
  id: string
  title: string
  subject: string
  class: string
  dueDate: string
  submittedCount: number
  totalCount: number
  completionRate: number
  status: 'active' | 'completed' | 'overdue'
  description?: string
  createdAt: string
  updatedAt: string
}

export interface HomeworkParams {
  title: string
  subject: string
  class: string
  dueDate: string
  description?: string
}
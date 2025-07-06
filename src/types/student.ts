export interface Student {
  id: string
  name: string
  studentId: string
  class: string
  grade: string
  email: string
  phone: string
  parentName: string
  parentPhone: string
  enrollDate: string
  status: 'active' | 'inactive'
  avatar?: string
}

export interface StudentParams {
  name: string
  studentId: string
  class: string
  grade: string
  email: string
  phone: string
  parentName: string
  parentPhone: string
  enrollDate: string
}
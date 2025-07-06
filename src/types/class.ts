export interface Class {
  id: string
  name: string
  grade: string
  teacher: string
  studentCount: number
  subjects: string[]
  createdAt: string
}

export interface ClassParams {
  name: string
  grade: string
  teacher: string
  subjects: string[]
}
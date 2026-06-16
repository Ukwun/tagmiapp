declare namespace Express {
  export interface User {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    passwordHash: string
    avatar: string | null
    role: "talent" | "client" | "manager"
    isVerified: boolean
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }

  export interface Request {
    user?: User
  }

  namespace Multer {
    export interface File {
      fieldname: string
      originalname: string
      encoding: string
      mimetype: string
      size: number
      destination: string
      filename: string
      path: string
      buffer: Buffer
    }
  }
}
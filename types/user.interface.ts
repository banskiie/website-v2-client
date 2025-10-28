export enum Role {
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
  LEVELLER = "LEVELLER",
  SUPPORT = "SUPPORT",
  ACCOUNTING = "ACCOUNTING",
}

export interface IDevice {
  ip: string
  browser: string
  os: string
  device: string
  userAgent: string
  refreshToken: string | null
  lastLogin: Date
  lastLogout: Date | null
}

export interface IUser {
  _id: string
  name: string
  email: string
  contactNumber: string
  username: string
  password: string
  role: Role
  devices: IDevice[]
  isActive: boolean
}

export interface IUserInput {
  _id?: string
  name: string
  email: string
  contactNumber: string
  username: string
  password: string
  role: Role
  devices: IDevice[]
  isActive: boolean
}

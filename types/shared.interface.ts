import type { IUser } from "./user.interface.js"

export interface IOption {
  label: string
  value: string
}

export interface IRemark {
  remark: string
  date: Date
  by: IUser
}

export interface IRemarkInput {
  remark: string
  date: Date
  by: string
}

// Enums
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

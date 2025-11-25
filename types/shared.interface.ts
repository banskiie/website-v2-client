import type { IUser } from "./user.interface.js"

export interface IResponse {
  ok: boolean
  message?: string
  data?: any
}

export interface IPageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

export interface IEdge<T> {
  node: T
  cursor: string
}

export interface IConnection<T> {
  total: number
  pages: number
  edges: IEdge<T>[]
  pageInfo: IPageInfo
}

export interface IDataTableInput {
  first: number
  after?: string
  search?: string
  sort?: {
    key: string
    order: "ASC" | "DESC"
  }
  filter?: {
    key: string
    value: string
    type: "TEXT" | "NUMBER" | "NUMBER_RANGE" | "DATE" | "DATE_RANGE" | "BOOLEAN"
  }[]
}

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

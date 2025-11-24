export interface IJersey {
  _id: string
  size: JerseySize
  createdAt?: string
  updatedAt?: string
  statuses: JerseyStatusLog[]
  player: {
    _id: string
    firstName: string
    middleName?: string
    lastName: string
    suffix?: string
    gender?: string
    birthDate?: string
    email?: string
    phoneNumber?: string
  }
  tournament: {
    _id: string
    name: string
    isActive?: boolean
  }
}

export interface IJerseyInput {
  _id?: string
  size: JerseySize
  statuses?: CreateJerseyStatusLogInput[]
  player: string
  tournament: string
}

export interface JerseyStatusLog {
  status: JerseyStatus
  dateUpdated: string
}

export interface CreateJerseyStatusLogInput {
  status: JerseyStatus
  dateUpdated: string
}

export interface UpdateJerseyStatusLogInput {
  status?: JerseyStatus
  dateUpdated?: string
}

export enum JerseyStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  CLAIMED = "CLAIMED",
  CANCELLED = "CANCELLED"
}

export enum JerseySize {
  XXS = "XXS",
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
  XXXL = "3XL",
  XXXXL = "4XL",
  XXXXXL = "5XL"
}
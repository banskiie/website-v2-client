import type { Gender } from "./shared.interface"
import { IVideo } from "./video.interface"

export enum PlayerLevel {
  BEGINNER = "BEGINNER",
  G = "G",
  F = "F",
  E = "E",
  D = "D",
  C = "C",
  B = "B",
  A = "A",
  ADVANCED = "ADVANCED",
  OPEN = "OPEN",
}

export enum ValidDocumentType {
  BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE",
  BRGY_CERTIFICATE = "BRGY_CERTIFICATE",
  SCHOOL_ID = "SCHOOL_ID",
  EMPLOYEE_ID = "EMPLOYEE_ID",
  DRIVERS_LICENSE = "DRIVERS_LICENSE",
  SSS_ID = "SSS_ID",
  PHILHEALTH_ID = "PHILHEALTH_ID",
  TIN_ID = "TIN_ID",
  PASSPORT = "PASSPORT",
  UMID_ID = "UMID_ID",
  PRC_ID = "PRC_ID",
  NATIONAL_ID = "NATIONAL_ID",
  OTHERS = "OTHERS",
}

// Location interfaces
export interface IRegion {
  code: string
  name: string
  regionName: string
  psgcCode: string
}

export interface IProvince {
  code: string
  name: string
  regionCode: string
  psgcCode: string
}

export interface ICity {
  code: string
  name: string
  provinceCode: string
  regionCode: string
  psgcCode: string
  classification: string
}

export interface IBarangay {
  code: string
  name: string
  cityCode: string
  provinceCode: string
  regionCode: string
  psgcCode: string
}

export interface ICoordinates {
  lat: number
  lng: number
}

export interface IPlayerAddress {
  region?: IRegion
  province?: IProvince
  city?: ICity
  barangay?: IBarangay
  street?: string
  zipCode?: string
  fullAddress: string
  coordinates?: ICoordinates
}

export interface ILevel {
  level: PlayerLevel
  dateLevelled: Date
}

export interface IValidDocument {
  documentURL: string
  documentType: ValidDocumentType
  dateUploaded: Date
}

export interface IPlayer extends Document {
  _id: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  gender: Gender
  birthDate: Date
  email?: string
  phoneNumber?: string
  achievements?: string[]
  videos?: IVideo[]
  levels: ILevel[]
  validDocuments: IValidDocument[]
  address?: IPlayerAddress
  isActive: boolean
}

export interface IPlayerInput extends Request {
  _id: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  gender: Gender
  birthDate: Date
  achievements?: string[]
  email?: string
  phoneNumber?: string
  levels: ILevel[]
  validDocuments: IValidDocument[]
  address?: IPlayerAddress
  isActive: boolean
}
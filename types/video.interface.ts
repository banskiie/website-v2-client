import type { IPlayer } from "./player.interface"
import type { IUser } from "./user.interface"

export interface IComment {
  content: string
  by: IUser
}

export interface IVideo extends Document {
  _id: string
  title: string
  youtubeId: string
  youtubeUrl: string
  players?: IPlayer[]
  dateUploaded: Date
  uploadedBy?: IUser
}

export interface IVideoInput extends Request {
  _id?: string
  title: string
  youtubeId: string
  youtubeUrl: string
  players?: string[]
  dateUploaded: Date
  uploadedBy?: string
}

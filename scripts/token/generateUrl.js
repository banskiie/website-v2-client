import { google } from "googleapis"

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline", // important for refresh token
  prompt: "consent", // force showing consent screen
  scope: ["https://www.googleapis.com/auth/youtube.upload"],
})

console.log("Open this URL in your browser:\n", authUrl)

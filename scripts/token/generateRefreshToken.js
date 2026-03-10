import "dotenv/config"
import { google } from "googleapis"

async function main() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  )

  const readline = await import("readline")
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.question("Enter the authorization code: ", async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code)
      // console.log(
      //   "✅ Refresh token (save this in your .env):\n",
      //   tokens.refresh_token
      // )
    } catch (err) {
      console.error(
        "❌ Error exchanging code:",
        err.response?.data || err.message
      )
    }
    rl.close()
  })
}

main()

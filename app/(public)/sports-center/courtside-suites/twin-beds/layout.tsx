import type { Metadata } from "next"
import { Lora } from "next/font/google"

// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
// })

// const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] })

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Sports Center Court-Suites Gallery",
  description:
    "Welcome to C-ONE - Sports Center Court-Suites",
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className={`min-h-screen flex flex-col ${lora.className}`}>{children}</div>
)

export default Layout

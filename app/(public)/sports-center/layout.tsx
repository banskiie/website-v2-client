import type { Metadata } from "next"
import localFont from "next/font/local"

export const metadata: Metadata = {
  title: "Sports Center",
  description: "Welcome to C-ONE - Sports Center",
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
)

export default Layout

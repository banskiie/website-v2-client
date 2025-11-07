import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Center | Ping Pong Courts",
  description:
    "Welcome to C-ONE - Sports Center | Ping Pong Courts",
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
)

export default Layout

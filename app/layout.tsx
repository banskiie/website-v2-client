import type { Metadata } from "next"
import "./globals.css"
import localFont from "next/font/local"
import { Toaster } from "sonner"
import ApolloLayout from "@/components/providers/apollo"
import SessionLayout from "@/components/providers/session"

const Rubik = localFont({
  src: "../public/fonts/Rubik.ttf",
})

export const metadata: Metadata = {
  title: {
    default: "C-ONE Website",
    template: "C-ONE Website | %s",
  },
  description: "C-ONE Website",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${Rubik.className} antialiased`}>
        <ApolloLayout>
          <SessionLayout>{children}</SessionLayout>
        </ApolloLayout>
        <Toaster richColors theme="light" visibleToasts={5} expand />
      </body>
    </html>
  )
}

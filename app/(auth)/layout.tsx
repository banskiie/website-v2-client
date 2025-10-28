import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/sidebar/app-sidebar"
import Header from "@/components/sidebar/header"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider className="w-full h-screen flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full h-full">
        <Header />
        <div className="p-2.5 flex-1">{children}</div>
      </div>
    </SidebarProvider>
  )
}

export default AuthLayout

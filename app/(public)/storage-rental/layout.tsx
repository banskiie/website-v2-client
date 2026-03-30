import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storage Rental",
  description:
    "Welcome to C-ONE - Storage Rental",
};

const Layout = ({ children }: { children: React.ReactNode }) => (

  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

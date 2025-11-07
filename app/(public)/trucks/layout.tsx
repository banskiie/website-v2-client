import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trucks & Equipment",
  description:
    "Welcome to C-ONE - Trucks & Equipment",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

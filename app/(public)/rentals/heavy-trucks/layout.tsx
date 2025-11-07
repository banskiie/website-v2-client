import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "C-ONE Rentals - Heavy Trucks & Equipment",
  description:
    "Welcome to C-ONE - Rentals",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

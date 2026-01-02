import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PPGL Products",
  description:
    "Welcome to C-ONE - PPGL Products",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

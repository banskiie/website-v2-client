import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roofing Access",
  description:
    "Welcome to C-ONE - Roofing Access",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

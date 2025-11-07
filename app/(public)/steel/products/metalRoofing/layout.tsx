import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metal Roofing",
  description:
    "Welcome to C-ONE - Metal Roofing",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

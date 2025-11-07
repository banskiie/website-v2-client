import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support User Desk",
  description:
    "Welcome to C-ONE - Support User Desk",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

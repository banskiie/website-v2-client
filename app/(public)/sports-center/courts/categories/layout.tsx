import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Center | Categories",
  description:
    "Welcome to C-ONE - Sports Center | Categories",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

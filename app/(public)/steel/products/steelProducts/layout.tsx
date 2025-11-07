import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Steel Products",
  description:
    "Welcome to C-ONE - Steel Products",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

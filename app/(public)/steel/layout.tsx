import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Steel",
  description:
    "Welcome to C-ONE - Steel",
};

const Layout = ({ children }: { children: React.ReactNode }) => (

  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

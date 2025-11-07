import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Center | Badminton Courts",
  description:
    "Welcome to C-ONE - Sports Center | Badminton Courts",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

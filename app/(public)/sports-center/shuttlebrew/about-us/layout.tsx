import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Center ShuttleBrew | About Us",
  description:
    "Welcome to C-ONE - Sports Center ShuttleBrew",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

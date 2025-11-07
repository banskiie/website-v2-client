import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShuttleBrew - Espresso Soda | C-ONE Sports Center",
  description:
    "Welcome to C-ONE - ShuttleBrew Espresso Soda",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

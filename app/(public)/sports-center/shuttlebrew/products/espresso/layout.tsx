import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShuttleBrew - Espresso | C-ONE Sports Center",
  description:
    "Welcome to C-ONE - ShuttleBrew Espresso",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

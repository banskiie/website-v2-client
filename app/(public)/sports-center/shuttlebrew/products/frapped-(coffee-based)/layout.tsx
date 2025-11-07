import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShuttleBrew - Frapped | C-ONE Sports Center",
  description:
    "Welcome to C-ONE - ShuttleBrew Frapped",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

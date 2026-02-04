import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "V9 Verified Entries",
    description:
        "Welcome to C-ONE - Verified Entries",
};

const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col">{children}</div>
);

export default Layout;

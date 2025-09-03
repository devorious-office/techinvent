import "./globals.css";
import LayoutProvider from "@/app/components/layout/LayoutProvider";

export const metadata = {
  title: "Admin Dashboard",
  description: "Tech Invent 2025",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-gray-900">
      <body>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}

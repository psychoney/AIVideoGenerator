import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FrameMint Relay - AI Video Gateway",
  description: "A multi-provider AI video relay console built on an open-source generation UI.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

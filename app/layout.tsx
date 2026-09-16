import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://game.oku10v.com"), title: "КотоКласс — игра-викторина", description: "Весёлая школьная викторина для второклассников: 9 тем, 45 вопросов и рейтинг друзей.",
  openGraph: { title: "КотоКласс — игра-викторина", description: "Пять вопросов, пять минут и три кота-помощника!", url: "https://game.oku10v.com", images: [{ url: "/og.png", width: 1672, height: 941, alt: "Три кота в школьной мастерской КотоКласс" }] },
  twitter: { card: "summary_large_image", title: "КотоКласс", description: "Школьная игра-викторина", images: ["/og.png"] }, icons: { icon: "/gymnasium-40-logo.png" }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }

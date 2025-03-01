// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PlayTransfer",
  description: "Transfer your playlists from Spotify to YouTube Music",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-primaryBlack text-foreground min-h-screen flex flex-col">
        <Providers>
          <header className="p-4 border-b border-gray-800 bg-primaryBlack flex items-center justify-center">
            <h1 className="text-2xl font-bold text-spotify">PlayTransfer</h1>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="p-4 text-center text-sm border-t border-gray-800 bg-primaryBlack text-secondaryGray">
            © {new Date().getFullYear()} PlayTransfer. All rights reserved.
          </footer>
        </Providers>
      </body>
    </html>
  );
}

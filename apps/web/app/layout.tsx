import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Glyph",
  description: "A calm daily hidden-link puzzle app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-5 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}

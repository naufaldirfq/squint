import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Squint - Brutally Honest Landing Page Audits",
  description: "A brutally honest 5-second audit of your landing page by AI personas who don't care about your feelings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        {/* Placeholder for Novus.ai snippet */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Novus.ai snippet placeholder
              console.log("Novus.ai tracker initialized");
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-primary selection:bg-blaze-orange selection:text-white">
        {children}
      </body>
    </html>
  );
}

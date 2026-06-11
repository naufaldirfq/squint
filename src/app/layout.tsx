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
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track', 'trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
})('f69f681c-598b-4b6b-a4f4-e717bee185eb');

var visitorId = localStorage.getItem('_pendo_anon_id');
if (!visitorId) {
  visitorId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'anon-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem('_pendo_anon_id', visitorId);
}
pendo.initialize({
  visitor: {
    id: visitorId
  }
});
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

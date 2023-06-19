/* eslint-disable import/extensions */
import "@/app/globals.css";
import { ReactNode } from "react";
import "@/app/gist-embed-0c70d27905a3824e6a9c3b9fddca6be1.css";
import RootComponent from "@/components/root";

export const metadata = {
  title: `rehype-gist`,
  description: `A rehype plugin for embedding static GitHub Gists in your HTML and MD/X content.`,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode,
}) {
  return (
    <html lang="en">
      <body>
        <RootComponent>
          {children}
        </RootComponent>
      </body>
    </html>
  );
}

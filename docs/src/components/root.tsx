"use client";

/* eslint-disable import/extensions */
import { ReactNode } from "react";
import { ThemeProvider } from "@wits/next-themes";
import { tw } from "tagged-classnames";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

type RootProps = {
  children: ReactNode;
};

export default function RootComponent({ children }: RootProps) {
  return (
    <ThemeProvider attribute="class" themes={[`light`, `dark`]} enableSystem>
      <Navbar />
      <div
        className={tw`
          // Base styles
          container mx-auto max-w-5xl bg-stone-200 dark:bg-stone-700 p-5 [&>*]:mb-4 [&>a]:inline-block
          [&>img]:inline-block [&>img]:align-baseline prose dark:prose-invert
          
          // Image Badges
          [&>p_img]:inline-block [&>p_img]:my-0
          
          // Code blocks (not-prose)
          [&_pre]:my-4 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:scrollbar-thin
          [&_pre]:scrollbar-thumb-stone-400 [&_pre]:scrollbar-thumb-rounded-full
          [&_pre]:overflow-x-auto [&_pre>code]:grid
          
          // Inline code: 'pre' tag has 'not-prose' applied
          prose-code:inline-code before:prose-code:content-[''] after:prose-code:content-['']
          
          // Tables
          prose-tr:border-black/60 dark:prose-tr:border-white/60
          prose-thead:border-black/60 dark:prose-thead:border-white/60 prose-thead:border-b-2
          [&_tfoot]:border-t-2 [&_tfoot]:border-black/60 dark:[&_tfoot]:border-white/60
        `}
      >
        {children}
      </div>
      <Footer />
    </ThemeProvider>
  );
}

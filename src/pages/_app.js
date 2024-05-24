import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";
import { PagesProgressBar as ProgressBar } from 'next-nprogress-bar';
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function App({ Component, pageProps }) {

  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="system">
        <Toaster />
        <Component {...pageProps} />
        <ProgressBar
          height="4px"
          color="#8234E9"
          options={{ showSpinner: true }}
          shallowRouting
        />
      </NextThemesProvider>
    </NextUIProvider>
  );
}

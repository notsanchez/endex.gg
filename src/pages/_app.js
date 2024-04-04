import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <Toaster/>
      <NextTopLoader color="green" />
      <Component {...pageProps} />
    </NextUIProvider>
  );
}

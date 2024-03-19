import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <Toaster/>
      <Component {...pageProps} />
    </NextUIProvider>
  );
}

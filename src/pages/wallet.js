import Navbar from "@/components/Navbar";
import { isLogged } from "@/utils/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import WalletWrapper from "@/components/WalletWrapper";
import { useDisclosure } from "@nextui-org/react";
import { Comfortaa } from "next/font/google";

const poppins = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function Home() {
  const [canRenderPage, setCanRenderPage] = useState(false);


  const router = useRouter();

  useEffect(() => {
    if (!isLogged) {
      router.push("/");
    } else {
      setCanRenderPage(true);
    }
  }, []);

  return (
    <main
      suppressHydrationWarning
      className={`flex w-screen flex-col items-center justify-start ${poppins.className}`}
    >
      {!!canRenderPage && (
        <>
          <Navbar />
          <WalletWrapper />
        </>
      )}
    </main>
  );
}

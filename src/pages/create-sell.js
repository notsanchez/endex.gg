import { Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import { isLogged } from "@/utils/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CreateSellForm from "@/components/CreateSellForm";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
          <CreateSellForm />
        </>
      )}
    </main>
  );
}

import Image from "next/image";
import { Comfortaa, Poppins } from "next/font/google";
import { Button, useDisclosure } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import HomeHeader from "@/components/HomeHeader";
import HomeCategories from "@/components/HomeCategories";
import ModalLogin from "@/components/ModalLogin";
import { isLogged } from "@/utils/useAuth";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Home() {

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(() => {
    typeof localStorage !== 'undefined' && localStorage?.clear()
  },[])

  return (
    <main
      suppressHydrationWarning
      className={`flex w-screen flex-col items-center justify-start ${poppins.className}`}
    >
      <ModalLogin isOpen={isOpen} onOpenChange={onOpenChange}/>
      <Navbar onOpen={onOpen}/>
      <HomeHeader />
      <HomeCategories />
      <Footer onOpen={onOpen} />
    </main>
  );
}

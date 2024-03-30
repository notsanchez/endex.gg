import Image from "next/image";
import { Comfortaa, Poppins } from "next/font/google";
import { Button, useDisclosure } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import HomeHeader from "@/components/HomeHeader";
import HomeCategories from "@/components/HomeCategories";
import ModalLogin from "@/components/ModalLogin";
import { isLogged } from "@/utils/useAuth";

const poppins = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
export default function Home() {

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <main
      suppressHydrationWarning
      className={`flex w-screen flex-col items-center justify-start ${poppins.className}`}
    >
      <ModalLogin isOpen={isOpen} onOpenChange={onOpenChange}/>
      <Navbar onOpen={onOpen}/>
      <HomeHeader />
      <HomeCategories />
    </main>
  );
}

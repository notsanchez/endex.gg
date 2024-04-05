import Image from "next/image";
import { Comfortaa, Poppins } from "next/font/google";
import { Button, useDisclosure } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import HomeHeader from "@/components/HomeHeader";
import HomeCategories from "@/components/HomeCategories";
import ModalLogin from "@/components/ModalLogin";
import { isLogged } from "@/utils/useAuth";
import HomeProducts from "@/components/HomeProducts";
import Footer from "@/components/Footer";
import AllCategories from "@/components/AllCategories";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Categories() {

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <main
      suppressHydrationWarning
      className={`flex w-screen flex-col items-center justify-start ${poppins.className}`}
    >
      <ModalLogin isOpen={isOpen} onOpenChange={onOpenChange}/>
      <Navbar onOpen={onOpen}/>
      <AllCategories />
      <Footer />
    </main>
  );
}

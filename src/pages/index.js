import Image from "next/image";
import { Comfortaa, Poppins } from "next/font/google";
import { Button, useDisclosure, Input } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import HomeHeader from "@/components/HomeHeader";
import HomeCategories from "@/components/HomeCategories";
import ModalLogin from "@/components/ModalLogin";
import { isLogged } from "@/utils/useAuth";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Home() {

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const router = useRouter()

  const [searchInput, setSearchInput] = useState('')

  return (
    <main
      suppressHydrationWarning
      className={`flex w-screen flex-col items-center justify-start ${poppins.className}`}
    >
      <ModalLogin isOpen={isOpen} onOpenChange={onOpenChange} />
      <Navbar onOpen={onOpen} />
      <div className="w-[90%] lg:hidden gap-2 mt-24">
        <Input onKeyDown={(event) => {
          if (event.key === 'Enter' && searchInput.trim()) {
            router?.push(`/product-list?search=${searchInput}`)
          }
        }} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} variant="bordered" placeholder="Procurar produtos" className="w-full" />
      </div>
      <HomeHeader />
      <HomeCategories />
      <Footer onOpen={onOpen} />
    </main>
  );
}

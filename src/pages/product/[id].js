import { Comfortaa, Poppins } from "next/font/google";
import { useDisclosure } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import ProductPage from "@/components/Product/ProductPage";
import ModalLogin from "@/components/ModalLogin";
import ModalBuyProduct from "@/components/Product/ModalBuyProduct";
import { useState } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function product() {
  const [openModalLogin, setOpenModalLogin] = useState(false)
  const [openModalBuy, setOpenModalBuy] = useState(false)

  const handleOpenModalLogin = () => {
    setOpenModalLogin((prevState) => !prevState)
  }
  const handleOpenModalBuy = () => {
    setOpenModalBuy((prevState) => !prevState)
  }

  return (
    <main
      suppressHydrationWarning
      className={`flex w-screen flex-col items-center justify-start ${poppins.className}`}
    >
      <ModalLogin isOpen={openModalLogin} onOpenChange={handleOpenModalLogin}/>
      <ModalBuyProduct isOpen={openModalBuy} onOpenChange={handleOpenModalBuy}/>
      <Navbar onOpen={handleOpenModalLogin} />
      <ProductPage onOpen={handleOpenModalLogin} handleOpenModalBuy={handleOpenModalBuy}/>
    </main>
  );
}

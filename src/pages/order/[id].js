import { Poppins } from "next/font/google";
import { useDisclosure } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import ProductPage from "@/components/Product/ProductPage";
import ModalLogin from "@/components/ModalLogin";
import ModalBuyProduct from "@/components/Product/ModalBuyProduct";
import { useState } from "react";
import OrderDetails from "@/components/Order/OrderDetails";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Order() {
  const [openModalLogin, setOpenModalLogin] = useState(false)

  const handleOpenModalLogin = () => {
    setOpenModalLogin((prevState) => !prevState)
  }

  return (
    <main
      suppressHydrationWarning
      className={`flex w-screen flex-col items-center justify-start ${poppins.className}`}
    >
      <ModalLogin isOpen={openModalLogin} onOpenChange={handleOpenModalLogin}/>
      <Navbar onOpen={handleOpenModalLogin} />
      <OrderDetails />
    </main>
  );
}

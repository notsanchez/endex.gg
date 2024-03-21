import { Poppins } from "next/font/google";
import { useDisclosure } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import ProductPage from "@/components/Product/ProductPage";
import ModalLogin from "@/components/ModalLogin";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function product() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <main
      suppressHydrationWarning
      className={`flex w-screen flex-col items-center justify-start ${poppins.className}`}
    >
      <ModalLogin isOpen={isOpen} onOpenChange={onOpenChange}/>
      <Navbar onOpen={onOpen} />
      <ProductPage onOpen={onOpen}/>
    </main>
  );
}

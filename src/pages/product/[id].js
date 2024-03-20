import { Poppins } from "next/font/google";
import { useDisclosure } from "@nextui-org/react";
import Navbar from "@/components/Navbar";
import ProductPage from "@/components/Product/ProductPage";

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
      <Navbar onOpen={onOpen} />
      <ProductPage />
    </main>
  );
}

import { Comfortaa, Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";
import ModalLogin from "@/components/ModalLogin";
import { useState } from "react";
import Footer from "@/components/Footer";
import UserDetails from "@/components/UserDetails";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function user() {
    const [openModalLogin, setOpenModalLogin] = useState(false)

    const handleOpenModalLogin = () => {
        setOpenModalLogin((prevState) => !prevState)
    }

    let currentUrl = '';

    if (typeof window !== 'undefined') {

        const url = window.location.href;
        const hostName = new URL(url).hostname;
        const parts = hostName.split('.');
        const subdomain = parts[0];

        currentUrl = subdomain;
    }

    return (
        <main
            suppressHydrationWarning
            className={`flex w-screen flex-col items-center justify-start ${poppins.className}`}
        >
            <ModalLogin isOpen={openModalLogin} onOpenChange={handleOpenModalLogin} />
            <Navbar onOpen={handleOpenModalLogin} currentUrl={currentUrl}/>
            <UserDetails onOpen={handleOpenModalLogin} currentUrl={currentUrl}/>
            {/* <Footer onOpen={handleOpenModalLogin} /> */}
        </main>
    );
}

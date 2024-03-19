import { isLogged, loggedName } from "@/utils/useAuth";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@nextui-org/react";
import { AlignJustify } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";

const Navbar = ({ onOpen }) => {
  const router = useRouter();

  const handleLogOut = () => {
    localStorage.removeItem("SESSION_ID");
    toast.success("Deslogado com sucesso!");
    setTimeout(() => {
      window.location.replace("/");
    }, 800);
  };

  return (
    <div className="w-[100%] lg:w-[60%] lg:py-8 flex items-center justify-between lg:gap-12 p-4">
      <div className="flex items-center justify-center gap-8">
        <div
          onClick={() => router.push("/")}
          className="flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="text-[#8234E9] font-bold lg:text-2xl">{`<`}</span>
          <h1 className="lg:text-2xl font-bold " color="primary">
            ENDEX
          </h1>
          <span className="text-[#8234E9] font-bold lg:text-2xl">{`>`}</span>
        </div>
        <Link href={""} className="hidden lg:block">
          Como funciona?
        </Link>
        <Link href={""} className="hidden lg:block">
          Suporte
        </Link>
      </div>
      {/* <Input type="email" label="Anuncio ou categoria" /> */}
      <div className="flex gap-4 items-center justify-center">
        {!!isLogged && (
          <h1 className="hidden lg:block">
            Olá, <span className="font-bold">{loggedName}</span>
          </h1>
        )}

        {!isLogged ? (
          <Button
            onPress={onOpen}
            color="primary"
            className="rounded-full text-white font-bold"
          >
            Anunciar
          </Button>
        ) : (
          <Button
            color="primary"
            onPress={() => {
              router.push("/create-sell");
            }}
            className="rounded-full text-white font-bold"
          >
            Anunciar
          </Button>
        )}

        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered" className="rounded-full">
              <AlignJustify />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            {isLogged && (
              <DropdownItem onPress={() => {}} key="new">
                Carteira
              </DropdownItem>
            )}
            {isLogged ? (
              <DropdownItem onPress={() => {}} key="new">
                Minhas compras
              </DropdownItem>
            ) : (
              <DropdownItem
                onPress={() => {
                  onOpen();
                }}
                key="new"
              >
                Entrar
              </DropdownItem>
            )}

            <DropdownItem key="copy">Categorias</DropdownItem>
            <DropdownItem key="edit">Tema escuro</DropdownItem>
            {isLogged && (
              <DropdownItem
                onPress={() => {
                  handleLogOut();
                }}
                key="logout"
              >
                Sair
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar;

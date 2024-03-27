import { isAdmin, isLogged, loggedID, loggedName } from "@/utils/useAuth";
import {
  Button,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@nextui-org/react";
import axios from "axios";
import { AlignJustify, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Navbar = ({ onOpen }) => {
  const router = useRouter();

  const [notificationList, setNotificationList] = useState([]);

  const handleLogOut = () => {
    localStorage.removeItem("SESSION_ID");
    localStorage.removeItem("SESSION_NAME");
    localStorage.removeItem("ADMIN");
    toast.success("Deslogado com sucesso!");
    setTimeout(() => {
      window.location.replace("/");
    }, 800);
  };

  useEffect(() => {
    const getNotifications = async () => {
      await axios
        .post("/api/query", {
          query: `SELECT * FROM T_NOTIFICACOES WHERE FK_USUARIO = ${loggedID}`,
        })
        .then((res) => {
          setNotificationList(res?.data?.results);
        });
    };

    getNotifications();
  }, []);

  return (
    <div className="w-[100%] lg:w-[60%] lg:py-8 flex items-center justify-between lg:gap-12 p-4 border-b-1">
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
        <Link href={"#"} className="hidden lg:block">
          Como funciona?
        </Link>
        <Link href={"#"} className="hidden lg:block">
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
        {isAdmin && (
          <Chip className="hidden lg:flex text-center items-center justify-center bg-transparent text-purple-500 border-1 font-bold">
            Administrador
          </Chip>
        )}
        {!isAdmin && (
          <>
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
          </>
        )}

        <div className="flex items-center justify-center gap-8 px-4">
          <Dropdown className="max-h-[400px] overflow-auto">
            <DropdownTrigger>
              <Bell size={20} style={{ cursor: "pointer" }} />
            </DropdownTrigger>
            <DropdownMenu>
              {notificationList?.length > 0 ? (
                notificationList?.map((el) => (
                  <DropdownItem
                    onPress={() => {
                      router?.push(`/order/${el?.FK_VENDA}`);
                    }}
                    className="py-8 px-4 h-2"
                  >
                    <h1
                      className="text-start w-[50%]"
                      dangerouslySetInnerHTML={{ __html: el?.MENSAGEM }}
                    ></h1>
                  </DropdownItem>
                ))
              ) : (
                <DropdownItem className="flex items-center justify-center">
                  <h1 className="text-center">Nenhuma notificação</h1>
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <AlignJustify size={20} style={{ cursor: "pointer" }} />
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              {isLogged && (
                <DropdownItem
                  onPress={() => {
                    router.push("/wallet?page=details");
                  }}
                  key="new"
                >
                  Detalhes da conta
                </DropdownItem>
              )}
              {isLogged ? (
                <DropdownItem
                  onPress={() => {
                    router.push("/wallet?page=my-shopping");
                  }}
                  key="new"
                >
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
    </div>
  );
};

export default Navbar;

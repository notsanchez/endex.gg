'use client'
import { isAdmin, isLogged, loggedID, loggedName } from "@/utils/useAuth";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Badge,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from "@nextui-org/react";
import axios from "axios";
import { AlignJustify, Bell, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";

const Navbar = ({ onOpen, currentUrl }) => {
  const router = useRouter();

  const { isOpen, onOpenChange } = useDisclosure();

  const [notificationList, setNotificationList] = useState([]);
  const [searchInput, setSearchInput] = useState("")
  const [notificationsReaded, setNotificationsReaded] = useState(typeof localStorage !== 'undefined' ? localStorage?.getItem("totalNotify") : 0)

  const handleLogOut = () => {
    localStorage?.clear()
    toast.success("Deslogado com sucesso!");
    setTimeout(() => {
      window.location.replace("/");
    }, 800);
  };

  useEffect(() => {
    const getNotifications = async () => {
      await axios
        .post("/api/query", {
          query: `SELECT * FROM T_NOTIFICACOES WHERE FK_USUARIO = "${loggedID}" GROUP BY created_at ORDER BY created_at DESC`,
        })
        .then((res) => {
          setNotificationList(res?.data?.results);
        });
    };

    getNotifications();
  }, []);

  const { theme, setTheme } = useTheme()

  return (
    <div className="w-[100%] lg:w-[100%] flex items-center justify-center lg:gap-12 fixed bg-background z-50">
      <div className="flex items-center justify-between w-[100%] lg:w-[70%] border-b-1 p-4 lg:py-8 gap-6">
        <div className="flex items-center justify-center gap-6">
          <div
            onClick={() => {
              if (currentUrl) {
                router.push("https://www.endexgg.com")
              } else {
                router.push("/")
              }

            }}
            className="flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="text-[#8234E9] font-bold lg:text-2xl">{`<`}</span>
            <h1 className="lg:text-2xl font-bold ">
              ENDEX
            </h1>
            <span className="text-[#8234E9] font-bold lg:text-2xl">{`>`}</span>
          </div>
          {/* <Link href={"#"} className="hidden lg:block">
          Como funciona?
        </Link> */}
          {/* <Link href={"/categories"} className="hidden lg:block">
            Categorias
          </Link> */}
          <h1 onClick={() => onOpenChange()} className="hidden lg:block cursor-pointer">
            Suporte
          </h1>
          <Modal
            size="xl"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Suporte - Endex
                  </ModalHeader>
                  <ModalBody>
                    <div className="flex flex-col items-center justify-center gap-6 w-full">
                      <h1>
                        Para dúvidas, ajuda e suporte. Entre em contato pelo email:
                      </h1>
                      <strong>
                        suporte.endexgg@hotmail.com
                      </strong>
                    </div>
                  </ModalBody>
                  <Divider className="mt-8" />
                  <ModalFooter>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-4 mb-2">

                      </div>
                    </div>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>

        <div className="w-[50%] hidden lg:flex gap-2">
          <Input onKeyDown={(event) => {
            if (event.key === 'Enter' && searchInput.trim()) {
              router?.push(`/product-list?search=${searchInput}`)
            }
          }} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} variant="bordered" placeholder="Procurar produtos" className="w-full" />
          {/* <Button onClick={() => !!searchInput && router?.push(`/product-list?search=${searchInput}`)} variant="bordered" color="primary">Pesquisar</Button> */}
        </div>

        {/* <Input type="email" label="Anuncio ou categoria" /> */}
        <div className="flex gap-4 items-center justify-center">
          {!!isLogged && (
            <h1 className="hidden lg:block">
              Olá, <span className="font-bold cursor-pointer" onClick={() => router?.push(`/user/${loggedID}`)}>{loggedName}</span>
            </h1>
          )}
          {isAdmin && (
            <Chip className="hidden lg:flex text-center items-center justify-center bg-purple-600 text-white font-bold">
              Administrador
            </Chip>
          )}
          {!isAdmin && (
            <>
              {!isLogged ? (
                <Button
                  onClick={() => {
                    onOpen();
                  }}
                  className="rounded-full text-white font-bold bg-purple-600"
                >
                  Anunciar
                </Button>
              ) : (
                <Button
                  onPress={() => {
                    if (currentUrl) {
                      router.push("https://www.endexgg.com/create-sell")
                    } else {
                      router.push("/create-sell")
                    }
                  }}
                  className="rounded-full text-white font-bold bg-purple-600"
                >
                  Anunciar
                </Button>
              )}
            </>
          )}

          <div className="flex items-center justify-center gap-8 px-4">
            <Dropdown className="max-h-[400px] overflow-auto">
              <DropdownTrigger>


                <div onClick={() => {
                  localStorage?.setItem("totalNotify", notificationList?.length)
                  setNotificationsReaded(notificationList?.length)
                }}>
                  <Badge as={"button"} content={Number(notificationList?.length || 0) - Number(notificationsReaded)} color="primary" className={"text-white p-2"} placement="top-right">
                    <Bell size={20} style={{ cursor: "pointer" }} />
                  </Badge>
                </div>


              </DropdownTrigger>
              <DropdownMenu className="max-h-[300px] overflow-auto">
                {notificationList?.length > 0 ? (
                  notificationList?.map((el) => (
                    <DropdownItem
                      onPress={() => {
                        router?.push(el?.REDIRECT_TO);
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
                {isLogged && !isAdmin ? (
                  <DropdownItem
                    onPress={() => {

                      if (currentUrl) {
                        router.push("https://www.endexgg.com/wallet?page=details")
                      } else {
                        router.push("/wallet?page=details")
                      }

                    }}
                    key="new"
                  >
                    Detalhes da conta
                  </DropdownItem>
                ) : (
                  isLogged && (
                    <DropdownItem
                      onPress={() => {

                        if (currentUrl) {
                          router.push("https://www.endexgg.com/wallet?page=platform-details")
                        } else {
                          router.push("/wallet?page=platform-details")
                        }

                      }}
                      key="new"
                    >
                      Detalhes da plataforma
                    </DropdownItem>
                  )
                )}
                {isLogged ? (
                  !isAdmin && (
                    <DropdownItem
                      onPress={() => {

                        if (currentUrl) {
                          router.push("https://www.endexgg.com/wallet?page=my-shopping")
                        } else {
                          router.push("/wallet?page=my-shopping")
                        }

                      }}
                      key="new"
                    >
                      Minhas compras
                    </DropdownItem>
                  )
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

                <DropdownItem onPress={() => {

                  if (currentUrl) {
                    router.push("https://www.endexgg.com/categories")
                  } else {
                    router.push("/categories")
                  }

                }} key="copy">Categorias</DropdownItem>


                {/* <DropdownItem key="edit">Tema escuro</DropdownItem> */}
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

                {theme == 'light' ? (

                  <DropdownItem onPress={() => setTheme('dark')} key="copy">Modo claro</DropdownItem>

                ) : (
                  <DropdownItem onPress={() => setTheme('light')} key="copy">Modo escuro</DropdownItem>
                )}

              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

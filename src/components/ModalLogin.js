import {
  Button,
  Checkbox,
  Divider,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import axios from "axios";
import { LockIcon, MailIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ModalLogin = ({ isOpen, onOpenChange }) => {
  const [modalType, setModalType] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({});
  const [registerForm, setRegisterForm] = useState({});

  const handleLogin = async () => {
    if (!!loginForm?.email && !!loginForm?.password) {
      setIsLoading(true);
      await axios
        .post("/api/query", {
          query: `SELECT ID, NICKNAME FROM T_USUARIOS TU WHERE TU.EMAIL = "${loginForm?.email}" AND TU.PASSWORD = "${loginForm?.password}"`,
        })
        .then((res) => {
          if (!!res?.data?.results?.[0]) {
            toast.success("Logado com sucesso!");
            localStorage.setItem("SESSION_ID", res?.data?.results?.[0]?.ID);
            localStorage.setItem(
              "SESSION_NAME",
              res?.data?.results?.[0]?.NICKNAME
            );
            setTimeout(() => {
              window.location.reload();
            }, 800);
          } else {
            setIsLoading(false);
            toast.error("Credenciais inválidas!");
          }
        });
    } else {
      toast.error("Preencha todos os campos!");
    }
  };

  const handleRegister = async () => {
    if (
      !!registerForm?.nickname &&
      !!registerForm?.email &&
      !!registerForm?.password &&
      !!registerForm?.confirmPassword
    ) {
      setIsLoading(true);
      if (registerForm?.password === registerForm?.confirmPassword) {
        await axios
          .post("/api/query", {
            query: `INSERT INTO T_USUARIOS (NICKNAME, EMAIL, PASSWORD) VALUES ("${registerForm?.nickname}", "${registerForm?.email}", "${registerForm?.password}")`,
          })
          .then((res) => {
            if (!!res?.data?.results) {
              localStorage.setItem("SESSION_ID", res?.data?.results?.id);
              localStorage.setItem(
                "SESSION_NAME",
                res?.data?.results?.[0]?.NICKNAME
              );
              setTimeout(() => {
                window.location.reload();
              }, 800);
              toast.success("Conta criada com sucesso!");
            } else {
              setIsLoading(false);
              toast.error("Erro ao criar conta!");
            }
          })
          .catch(() => {
            setIsLoading(false);
            toast.error("Usuário ja existente!");
          });
      } else {
        setIsLoading(false);
        toast.error("Senhas diferentes!");
      }
    } else {
      toast.error("Preencha todos os campos!");
    }
  };

  useEffect(() => {
    setModalType("login");
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom-center"
      //className="h-[800px] lg:h-auto"
      size="lg"
    >
      <ModalContent>
        {(onClose) => (
          <div className="flex flex-col items-start justify-between w-full h-full gap-12 py-8">
            {/* <ModalHeader className="flex flex-col gap-1">Entrar</ModalHeader> */}
            {modalType === "login" && (
              <>
                <ModalBody className="w-full flex flex-col justify-between gap-12">
                  <div className="flex flex-col gap-4">
                    <div className="w-full flex items-center justify-center">
                      <h1 className="text-2xl font-bold">Entrar</h1>
                    </div>
                    <Input
                      endContent={
                        <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                      value={loginForm?.email}
                      onChange={(e) => {
                        setLoginForm((prevState) => ({
                          ...prevState,
                          email: e.target.value,
                        }));
                      }}
                      placeholder="E-mail"
                      variant="bordered"
                    />
                    <Input
                      endContent={
                        <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                      value={loginForm?.password}
                      onChange={(e) => {
                        setLoginForm((prevState) => ({
                          ...prevState,
                          password: e.target.value,
                        }));
                      }}
                      placeholder="Senha"
                      type="password"
                      variant="bordered"
                    />
                    <Button
                      className="w-full text-white rounded-full font-bold"
                      color="primary"
                      isLoading={isLoading}
                      onPress={() => {
                        handleLogin();
                        //onClose
                      }}
                    >
                      CONFIRMAR
                    </Button>
                  </div>

                  <Divider />

                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <h1
                      onClick={() => setModalType("register")}
                      className="cursor-pointer"
                    >
                      Criar uma conta
                    </h1>
                    <h1
                      //onClick={() => setModalType("register")}
                      className="cursor-pointer"
                    >
                      Esqueci minha senha
                    </h1>
                  </div>
                </ModalBody>
              </>
            )}

            {modalType === "register" && (
              <>
                <ModalBody className="w-full flex flex-col gap-12">
                  <div className="w-full flex items-center justify-center">
                    <h1 className="text-2xl font-bold">Criar nova conta</h1>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Input
                      value={registerForm?.nickname}
                      onChange={(e) => {
                        setRegisterForm((prevState) => ({
                          ...prevState,
                          nickname: e.target.value,
                        }));
                      }}
                      endContent={
                        <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                      placeholder="Usuário"
                      variant="bordered"
                    />
                    <Input
                      value={registerForm?.email}
                      onChange={(e) => {
                        setRegisterForm((prevState) => ({
                          ...prevState,
                          email: e.target.value,
                        }));
                      }}
                      endContent={
                        <MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                      placeholder="E-mail"
                      variant="bordered"
                    />
                    <Input
                      value={registerForm?.password}
                      onChange={(e) => {
                        setRegisterForm((prevState) => ({
                          ...prevState,
                          password: e.target.value,
                        }));
                      }}
                      endContent={
                        <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                      placeholder="Senha"
                      type="password"
                      variant="bordered"
                    />
                    <Input
                      value={registerForm?.confirmPassword}
                      onChange={(e) => {
                        setRegisterForm((prevState) => ({
                          ...prevState,
                          confirmPassword: e.target.value,
                        }));
                      }}
                      endContent={
                        <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                      placeholder="Confirmar Senha"
                      type="password"
                      variant="bordered"
                    />
                  </div>

                  <Button
                    className="w-full text-white rounded-full font-bold"
                    color="primary"
                    isLoading={isLoading}
                    onPress={handleRegister}
                  >
                    CADASTRAR
                  </Button>

                  <Divider />

                  <div className="w-full flex items-center justify-center">
                    <h1
                      onClick={() => setModalType("login")}
                      className="cursor-pointer"
                    >
                      Entrar em uma conta existente
                    </h1>
                  </div>
                </ModalBody>
              </>
            )}
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalLogin;

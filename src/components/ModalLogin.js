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
import { LockIcon, MailIcon, UserIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';

const ModalLogin = ({ isOpen, onOpenChange }) => {
  const [modalType, setModalType] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({});
  const [registerForm, setRegisterForm] = useState({});

  const [registerStep, setRegisterStep] = useState(1)

  const [emailForgot, setEmailForgot] = useState('')

  const handleLogin = async () => {
    if (!!loginForm?.email && !!loginForm?.password) {
      setIsLoading(true);
      await axios
        .post("/api/query", {
          query: `SELECT ID, NICKNAME, ADMIN FROM T_USUARIOS TU WHERE TU.EMAIL = "${loginForm?.email}" AND TU.PASSWORD = "${loginForm?.password}" AND TU.ACTIVE = 1`,
        })
        .then((res) => {
          if (!!res?.data?.results?.[0]) {
            toast.success("Logado com sucesso!");
            localStorage.setItem("SESSION_ID_V2", res?.data?.results?.[0]?.ID);
            localStorage.setItem(
              "SESSION_NAME_V2",
              res?.data?.results?.[0]?.NICKNAME
            );
            localStorage.setItem(
              "ADMIN",
              res?.data?.results?.[0]?.ADMIN?.data?.[0]
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

  function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }


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
            query: `INSERT INTO T_USUARIOS (id, NICKNAME, EMAIL, PASSWORD) VALUES ("${generateRandomString(9)}", "${registerForm?.nickname}", "${registerForm?.email}", "${registerForm?.password}")`,
          })
          .then(async (res) => {
            if (!!res?.data?.results) {
              if (res?.data?.results?.[0]?.id) {
                console.log(res?.data?.results?.[0]?.id)
                await axios.post('/api/send-email', {
                  email: registerForm?.email,
                  user_id: res?.data?.results?.[0]?.id
                })
                toast.success("Conta criada com sucesso!");
                setRegisterStep(2)
                setIsLoading(false);
              } else {
                setIsLoading(false);
                toast.error("Erro ao criar conta!");
              }
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

  const handleForgotPassword = async () => {

    if (!!emailForgot) {

      await axios
        .post("/api/query", {
          query: `
            UPDATE T_USUARIOS SET FORGOT_PASS = 1 WHERE EMAIL = "${emailForgot}"
          `,
        })
        .then(async (res) => {
          if (res?.data?.results?.affectedRows > 0) {
            await axios
              .post("/api/send-email-forgot-pass", {
                email: emailForgot,
              })
              .then((res) => {
                toast.success("Email enviado!");
                onOpenChange()
              });
          } else {
            toast.error("Usuario não encontrado!");
          }
        })
    }

  }

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
                      onClick={() => setModalType("forgotPassword")}
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
                  {registerStep === 1 && (
                    <>
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
                            <UserIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
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
                    </>
                  )}

                  {registerStep === 2 && (
                    <>
                      <div className="flex flex-col items-center justify-center gap-4 p-4">
                        <h1 className="font-bold text-xl text-center">Clique no link enviado ao seu email para confirmar sua conta!</h1>
                        <h1>{`Não esqueça de checar a caixa de spam ;)`}</h1>

                        <Button onPress={onClose} variant="bordered" className="text-purple-600 border-purple-600">Voltar</Button>
                      </div>
                    </>
                  )}

                </ModalBody>
              </>
            )}

            {modalType === "forgotPassword" && (
              <>
                <ModalBody className="w-full flex flex-col gap-12">
                  <div className="w-full flex items-center justify-center">
                    <h1 className="text-2xl font-bold">Esqueci minha senha</h1>
                  </div>
                  <div>
                    <Input
                      value={emailForgot}
                      type="email"
                      onChange={(e) => {
                        setEmailForgot(e.target.value);
                      }}
                      endContent={
                        <UserIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                      }
                      placeholder="Email"
                      variant="bordered"
                    />

                  </div>

                  <Button
                    className="w-full text-white rounded-full font-bold"
                    color="primary"
                    isLoading={isLoading}
                    onPress={handleForgotPassword}
                  >
                    ENVIAR EMAIL DE RECUPERAÇÃO
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

import React, { useEffect, useRef, useState } from 'react'
import { 
    Button,
    Checkbox,
    Chip,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Spinner,
    Textarea,
    useDisclosure,
 } from '@nextui-org/react'
import { CheckCheck } from "lucide-react";
import axios from 'axios'
import { isAdmin, loggedID } from '@/utils/useAuth';
import { useRouter } from 'next/router';
import moment from 'moment';

const ChatComp = () => {

    const router = useRouter()

    const [messageList, setMessageList] = useState([])
    const [messageTyped, setMessageTyped] = useState("");

    const [messageToEdit, setMessageToEdit] = useState(null)
    const [messageEdited, setMessageEdited] = useState('')

    const [userData, setUserData] = useState({})

    const [isLoadingMessage, setIsLoadingMessage] = useState(false);

    const fileInputRef = useRef(null);

    const handleDivClick = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'b650rwr0');

        try {
            const response = await axios.post(
                'https://api.cloudinary.com/v1_1/matheussanchez/image/upload',
                formData
            );

            await axios.post("/api/query", {
                query: `
              INSERT INTO T_MENSAGENS_PRIVADO (FK_USUARIO, FK_CHAT, MENSAGEM) VALUES ("${loggedID}", "${router?.query?.id}", "${response.data.secure_url}")
          `,
            });

            await getMessages()

        } catch (error) {
            console.error('Erro ao fazer upload para o Cloudinary:', error);
        }
    };

    const getMessages = async () => {
        await axios
            .post("/api/query", {
                query: `
            SELECT TMP.*, TU.NICKNAME FROM T_MENSAGENS_PRIVADO TMP 
            INNER JOIN T_USUARIOS TU ON TU.id = TMP.FK_USUARIO
            WHERE TMP.FK_CHAT = "${router?.query?.id}"
            `,
            })
            .then((response) => {
                const results = response.data.results;


                setMessageList(results);
            })
    };

    const getUserData = async () => {
        await axios
            .post("/api/query", {
                query: `
            SELECT TU.EMAIL, TU.id FROM T_USUARIOS TU 
            INNER JOIN T_CHAT_PRIVADO TCP ON TCP.FK_USUARIO = TU.id
            WHERE TCP.id = "${router?.query?.id}"
            `,
            })
            .then((response) => {
                setUserData(response?.data?.results?.[0]);
            })
    };


    const handleSendMessage = async () => {
        setIsLoadingMessage(true);

        await axios
            .post("/api/query", {
                query: `
            INSERT INTO T_MENSAGENS_PRIVADO (FK_USUARIO, FK_CHAT, MENSAGEM) VALUES ("${loggedID}", "${router?.query?.id}", "${messageTyped}")
          `,
            })
            .then(async () => {
                setIsLoadingMessage(false);
                setMessageTyped("");

                if (loggedID !== userData.id) {
                    await axios
                        .post("/api/send-email-private", {
                            email: userData?.EMAIL,
                            chat: router?.query?.id
                        })

                    await axios
                        .post("/api/query", {   
                            query: `INSERT INTO T_NOTIFICACOES (FK_USUARIO, MENSAGEM, FK_VENDA, REDIRECT_TO) VALUES 
                  ("${userData?.id}", "Você possui uma nova mensagem! <br/> <span style=\\"color: #8234E9\\">clique aqui</span> para ver", "${router?.query?.id}", "/chat?id=${router?.query?.id}")`,
                        })
                }


            })
            .catch((err) => {
                setIsLoadingMessage(false);
            });
    };

    const renderContent = (mensagem) => {
        const cloudinaryPngRegex = /https:\/\/res\.cloudinary\.com/;
        if (cloudinaryPngRegex.test(mensagem)) {
          return <img className='h-[300px] rounded-lg' src={mensagem} alt="Cloudinary Image" />;
        } else {
          return (
            <pre
              style={{
                fontFamily: "inherit",
                margin: "0",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {mensagem}
            </pre>
          );
        }
      };

    useEffect(() => {
        const fetchMessages = () => {
          getMessages();
        };
    
        fetchMessages();
        
        const messagesInterval = setInterval(fetchMessages, 2000);
    
        getUserData()
        return () => {
          clearInterval(messagesInterval);
        };

      }, [router?.query]);

      const handleEditMessage = async (el) => {
        await axios.post("/api/query", {
          query: `
                UPDATE T_MENSAGENS_PRIVADO 
                SET MENSAGEM = "${messageEdited}"
                WHERE id = "${el?.id}"
            `,
        });
    
        getMessages()
      }
    
      const handleDeleteMessage = async (el) => {
        await axios.post("/api/query", {
          query: `
                DELETE FROM T_MENSAGENS_PRIVADO WHERE id = "${el?.id}";
            `,
        });
    
        getMessages()
    
      }

    return (
        <div className="w-[100%] lg:w-[70%] flex flex-col gap-4 items-center justify-center py-12 mb-24 mt-32">

            <div className='w-full flex items-center justify-between'>
                <h1 className='text-4xl'>Chat Privado</h1>
            </div>

            <div className="flex flex-col items-center justify-center gap-8 w-full">

                <div className="flex flex-col w-full items-center justify-end gap-4 h-[auto]">
                    {messageList?.length > 0 ? (
                        messageList?.map((el, index) => (
                            <div
                                key={index}
                                className={`w-[80%] flex flex-col ${el?.FK_USUARIO === loggedID
                                    ? "items-end"
                                    : "items-start"
                                    } justify-center`}
                            >
                                <div
                                    className={`${isAdmin ? "w-[100%]" : "w-[60%]"
                                        } border-1 p-4 rounded-lg`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h1 className="text-md font-bold">
                                            {el?.NICKNAME}
                                        </h1>

                                        {el?.FK_USUARIO === 20 && (
                                            <Chip
                                                size="sm"
                                                className="text-white font-bold bg-purple-600"
                                            >
                                                Suporte
                                            </Chip>
                                        )}
                                    </div>
                                    <div style={{ overflow: "hidden" }}>
                                        {renderContent(el?.MENSAGEM)}

                                    </div>
                                    <div className="w-full flex justify-between">
                                        <div>
                                            {el?.FK_USUARIO === loggedID && (
                                                <div className="flex gap-2 mt-2">
                                                    <Button onClick={() => {
                                                        setMessageEdited(el?.MENSAGEM)
                                                        setMessageToEdit(el)
                                                    }} size="sm">Editar</Button>
                                                    <Button onClick={() => handleDeleteMessage(el)} size="sm">Apagar</Button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full flex flex-col items-end" style={{ overflow: "hidden", marginTop: '12px' }}>
                                            <pre style={{
                                                fontFamily: "inherit",
                                                margin: "0",
                                                whiteSpace: "pre-wrap",
                                                wordWrap: "break-word",
                                            }}>{moment(el?.created_at).format('DD/MM/YYYY HH:mm')}</pre>
                                            {el?.LIDO == 1 && (
                                                <CheckCheck size={15} color="purple" />
                                            )}
                                        </div>
                                    </div>


                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full flex items-center justify-center">

                        </div>
                    )}

                    <Divider />
                </div>
                <div className="w-full flex items-center justify-center flex-col gap-2">
                    <div className="w-[80%] flex items-center justify-center gap-4">
                        <Textarea
                            variant="bordered"
                            placeholder="Digite sua mensagem"
                            value={messageTyped}
                            isDisabled={isLoadingMessage}
                            onChange={(e) => {
                                setMessageTyped(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    const { selectionStart, selectionEnd, value } = e.target;
                                    const newValue =
                                        value.substring(0, selectionStart) +
                                        "\n" +
                                        value.substring(selectionEnd);
                                    setMessageTyped(newValue);
                                }
                            }}
                        />
                        <Button
                            onPress={() => {
                                handleSendMessage();
                            }}
                            isLoading={isLoadingMessage}
                            className="font-bold text-white rounded-full bg-purple-600"
                        >
                            Enviar
                        </Button>
                    </div>
                    <div className="w-[80%] flex items-center justify-start gap-4">
                        <Button onClick={handleDivClick} size="sm">Adicionar mídia</Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: 'none' }}
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>
            </div>

            <Modal
                size="xl"
                isOpen={!!messageToEdit}
                onOpenChange={() =>
                  setMessageToEdit(null)
                }
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Editar mensagem
                      </ModalHeader>
                      <ModalBody>
                        <div className="flex flex-col items-center justify-center gap-6 w-full">
                          <Textarea
                            value={messageEdited}
                            onChange={(e) => {
                              setMessageEdited(e.target.value);
                            }}
                            label={"Edite sua mensagem"}
                            labelPlacement="outside"
                            placeholder="Escreva aqui"
                            variant="bordered"
                          />
                        </div>
                      </ModalBody>
                      <Divider className="mt-8" />
                      <ModalFooter>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-4 mb-2">
                            <Button
                              onPress={async () => {
                                await handleEditMessage(messageToEdit);
                                onClose();
                              }}
                              variant="bordered"
                              className="border-purple-600"
                            >
                              Editar mensagem
                            </Button>
                          </div>
                        </div>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>

        </div>
    )
}

export default ChatComp
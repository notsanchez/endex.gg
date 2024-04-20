import ProductList from "@/pages/product-list";
import { formatCurrency } from "@/utils/formatCurrency";
import { isAdmin, loggedID, loggedName } from "@/utils/useAuth";
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
} from "@nextui-org/react";
import axios from "axios";
import { Star } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const router = useRouter();

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  const [paymentSelected, setPaymentSelected] = useState(null);
  const [qrCodePix, setQrCodePix] = useState("");
  const [codePix, setCodePix] = useState("");

  const [messageList, setMessageList] = useState([]);
  const [messageTyped, setMessageTyped] = useState("");

  const [canRefund, setCanRefund] = useState(false);
  const [reembolsoForm, setReembolsoForm] = useState({});
  const [isLoadingReembolso, setIsLoadingReembolso] = useState(false);

  const [canRate, setCanRate] = useState(false);
  const [isOpenModalRating, setIsOpenModalRating] = useState(false);
  const [avalicaoText, setAvaliacaoText] = useState("");
  const [avalicaoRange, setAvaliacaoRange] = useState(0);
  const [isLoadingAvalicao, setIsLoadingAvalicao] = useState(false);

  const { isOpen, onOpenChange } = useDisclosure();

  const getProducts = async () => {
    await axios
      .post("/api/query", {
        query: `
        SELECT 
            TV.id, 
            TP.id AS ID_PRODUTO, 
            TV.COMISSAO_ENDEX AS COMISSAO_ENDEX_VENDA, 
            TV.VALOR_A_RECEBER AS VALOR_A_RECEBER_VENDA, 
            TV.VALOR_AFILIADO AS VALOR_AFILIADO_VENDA, 
            TP.TITULO, 
            TP.PRECO, 
            TV.QTD, 
            TSV.NOME AS STATUS, 
            TU.NICKNAME, 
            TV.FK_USUARIO_COMPRADOR, 
            TP.FK_USUARIO AS FK_USUARIO_VENDEDOR, 
            TVP.TITULO AS VARIACAO,
            (SELECT TUS.EMAIL AS EMAIL_VENDEDOR FROM T_USUARIOS TUS WHERE TUS.ID = TV.FK_USUARIO_VENDEDOR) AS EMAIL_VENDEDOR,
            (SELECT TUS.EMAIL AS EMAIL_COMPRADOR FROM T_USUARIOS TUS WHERE TUS.ID = TV.FK_USUARIO_COMPRADOR) AS EMAIL_COMPRADOR,
            TV.created_at 
        FROM T_VENDAS TV 
        INNER JOIN T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO 
        INNER JOIN T_STATUS_VENDA TSV ON TSV.id = TV.FK_STATUS
        INNER JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO
        LEFT JOIN T_VARIACOES_PRODUTO TVP ON TVP.id = TV.FK_VARIACAO
        WHERE TV.id = "${router?.query?.id}"
        `,
      })
      .then((res) => {
        setProductsList(res?.data?.results?.[0]);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const verifyIfCanRateAndRefund = async () => {
    await axios
      .post("/api/query", {
        query: `
        SELECT 
          CASE
              WHEN (
                  SELECT COUNT(*)
                  FROM T_AVALIACOES
                  WHERE FK_VENDA = ${router?.query?.id} AND FK_USUARIO = "${loggedID}"
              ) > 0 THEN 0
              ELSE 1
          END AS Resultado_avaliacao,
          CASE
              WHEN (
                  SELECT COUNT(*)
                  FROM T_REEMBOLSOS
                  WHERE FK_VENDA = ${router?.query?.id}
              ) > 0 THEN 0
              ELSE 1
          END AS Resultado_reembolso;
        `,
      })
      .then((res) => {
        if (res?.data?.results?.[0]?.Resultado_avaliacao === 1) {
          setCanRate(true);
        }

        if (res?.data?.results?.[0]?.Resultado_reembolso === 1) {
          setCanRefund(true);
        }
      })
      .catch((err) => { });
  };

  const getMessages = async () => {
    await axios
      .post("/api/query", {
        query: `
        SELECT TMV.*, TU.NICKNAME FROM T_MENSAGENS_VENDA TMV
        INNER JOIN T_USUARIOS TU ON TU.id = TMV.FK_USUARIO
        WHERE FK_VENDA = "${router?.query?.id}"
        `,
      })
      .then((response) => {
        const results = response.data.results;

        // Filtrar mensagens com created_at único
        const filteredResults = results.filter(
          (message, index, self) =>
            index === self.findIndex((m) => m.created_at === message.created_at)
        );

        setMessageList(filteredResults);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const generatePixQrCode = async () => {
    const resQrCode = await axios.post("/api/gen-qr-code-pix", {
      price: parseFloat(
        String(Number(productsList?.COMISSAO_ENDEX_VENDA) + Number(productsList?.VALOR_A_RECEBER_VENDA) + Number(productsList?.VALOR_AFILIADO_VENDA))
      ).toFixed(2),
      external_id: Number(router?.query?.id),
    });

    if (!!resQrCode) {
      setQrCodePix(resQrCode?.data?.qrcode);
      setCodePix(resQrCode?.data?.code);
    }
  };

  const handleSendMessage = async () => {
    setIsLoadingMessage(true);

    await axios
      .post("/api/query", {
        query: `
        INSERT INTO T_MENSAGENS_VENDA (FK_USUARIO, FK_VENDA, MENSAGEM) VALUES ("${loggedID}", "${router?.query?.id}", "${messageTyped}")
      `,
      })
      .then(async () => {
        setIsLoadingMessage(false);
        setMessageTyped("");
        if(productsList?.EMAIL_COMPRADOR !== loggedID){
          axios
          .post("/api/send-email-message", {
            email: productsList?.EMAIL_COMPRADOR,
          })

          axios
          .post("/api/query", {
            query: `INSERT INTO T_NOTIFICACOES (FK_USUARIO, MENSAGEM, FK_VENDA, REDIRECT_TO) VALUES 
              ("${productsList?.FK_USUARIO_COMPRADOR}", "Você possui uma nova mensagem! <br/> <span style=\\"color: #8234E9\\">clique aqui</span> para ver", "${router?.query?.id}", "/order/${router?.query?.id}")`,
          })
        }

        if(productsList?.EMAIL_VENDEDOR !== loggedID){
          axios
          .post("/api/send-email-message", {
            email: productsList?.EMAIL_VENDEDOR,
          })

          axios
          .post("/api/query", {
            query: `INSERT INTO T_NOTIFICACOES (FK_USUARIO, MENSAGEM, FK_VENDA, REDIRECT_TO) VALUES 
              ("${productsList?.FK_USUARIO_VENDEDOR}", "Você possui uma nova mensagem! <br/> <span style=\\"color: #8234E9\\">clique aqui</span> para ver", "${router?.query?.id}", "/order/${router?.query?.id}")`,
          })
        }
        
        
      })
      .catch((err) => {
        setIsLoadingMessage(false);
      });
  };

  const handleSendReembolso = async () => {
    setIsLoadingReembolso(true);

    await axios
      .post("/api/query", {
        query: `
        INSERT INTO T_REEMBOLSOS (FK_VENDA, TIPO_CHAVE, CHAVE_PIX, MOTIVO) VALUES ("${router?.query?.id}", "${productsList?.tipoChave}", "${reembolsoForm?.chave}", "${reembolsoForm?.motivo}")
      `,
      })
      .then((res) => {
        setIsLoadingReembolso(false);
        verifyIfCanRateAndRefund();
        setReembolsoForm({});
        setCanRefund(false);
      })
      .catch((err) => {
        setIsLoadingReembolso(false);
      });
  };

  const handleSendAvaliacao = async () => {
    setIsLoadingAvalicao(true);

    await axios
      .post("/api/query", {
        query: `
        INSERT INTO T_AVALIACOES (FK_VENDA, FK_PRODUTO, FK_USUARIO, RATING, MENSAGEM) VALUES ("${router?.query?.id}", "${productsList?.ID_PRODUTO}", "${loggedID}", "${avalicaoRange}", "${avalicaoText}")
      `,
      })
      .then((res) => {
        setIsLoadingAvalicao(false);
        setCanRate(false);
        verifyIfCanRateAndRefund();
      })
      .catch((err) => {
        setIsLoadingAvalicao(false);
      });
  };

  useEffect(() => {
    const fetchProducts = () => {
      getProducts();
      verifyIfCanRateAndRefund();
    };

    const fetchMessages = () => {
      getMessages();
    };

    fetchProducts();
    fetchMessages();

    const productsInterval = setInterval(fetchProducts, 5000);

    const messagesInterval = setInterval(fetchMessages, 2000);

    return () => {
      clearInterval(productsInterval);
      clearInterval(messagesInterval);
    };
  }, [router?.query]);

  useEffect(() => {
    if (
      !!productsList?.FK_USUARIO_COMPRADOR &&
      !!productsList?.FK_USUARIO_VENDEDOR
    ) {
      if (
        productsList?.FK_USUARIO_COMPRADOR === loggedID ||
        productsList?.FK_USUARIO_VENDEDOR === loggedID ||
        isAdmin
      ) {
        setIsLoading(false);
      } else {
        router?.push("/");
      }
    }
  }, [productsList]);


  return (
    <div className="w-[100%] lg:w-[60%] flex flex-col gap-12 mb-24 mt-32">
      {!isLoading ? (
        <>
          {productsList?.STATUS === "Pagamento confirmado" && (
            <Button onClick={() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
              });

            }} variant="bordered" color="primary" className="fixed right-20 bottom-10 rounded-full">
              Mensagens recentes
            </Button>
          )}

          <div className="w-[100%] lg:w-[100%] flex flex-col items-center justify-center py-12 mt-12 border-1 rounded-lg">
            <div className="flex flex-col items-center justify-center gap-8 w-full">
              <h1 className="text-4xl font-bold text-center">
                Detalhes da compra
              </h1>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-12">
                  <h1>Número da compra:</h1>
                  <h1>{router?.query?.id}</h1>
                </div>
                <div className="flex items-center justify-between gap-12">
                  <h1>Data da compra:</h1>
                  <h1>
                    {moment(productsList?.created_at).format("DD/MM/YYYY")}
                  </h1>
                </div>
                <div className="flex items-center justify-between gap-12">
                  <h1>Item:</h1>
                  <h1>{productsList?.TITULO}</h1>
                </div>
                {!!productsList?.VARIACAO && (
                  <div className="flex items-center justify-between gap-12">
                    <h1>Variação:</h1>
                    <h1>{productsList?.VARIACAO}</h1>
                  </div>
                )}
                <div className="flex items-center justify-between gap-12">
                  <h1>Vendedor:</h1>
                  <h1>{productsList?.NICKNAME}</h1>
                </div>
                <div className="flex items-center justify-between gap-12">
                  <h1>Valor:</h1>
                  <h1>
                    {formatCurrency((Number(productsList?.COMISSAO_ENDEX_VENDA) + Number(productsList?.VALOR_A_RECEBER_VENDA) + Number(productsList?.VALOR_AFILIADO_VENDA)))}
                  </h1>
                </div>
                <div className="flex items-center justify-between gap-12">
                  <h1>Taxas:</h1>
                  <h1>
                    {formatCurrency(((Number(productsList?.COMISSAO_ENDEX_VENDA) + Number(productsList?.VALOR_A_RECEBER_VENDA) + Number(productsList?.VALOR_AFILIADO_VENDA)) / 100) * 0.99)}
                  </h1>
                </div>
                <div className="flex items-center justify-between gap-12">
                  <h1>Quantidade:</h1>
                  <h1>{productsList?.QTD}</h1>
                </div>
                <div className="flex items-center justify-between gap-12">
                  <h1>Status:</h1>
                  <Chip
                    color={
                      productsList?.STATUS === "Aguardando pagamento"
                        ? "warning"
                        : "success"
                    }
                  >
                    {productsList?.STATUS}
                  </Chip>
                </div>
              </div>
            </div>
          </div>

          {productsList?.STATUS === "Pagamento confirmado" && (
            <div className="w-full h-full flex flex-col items-end mt-12 gap-2">
              <div className="w-[100%] lg:w-[100%] flex flex-col items-center justify-center py-12 border-1 rounded-lg">
                <div className="flex flex-col items-center justify-center gap-8 w-full">
                  <h1 className="text-4xl font-bold text-center">
                    Chat com vendedor
                  </h1>

                  <Divider />

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
                              {el?.FK_USUARIO ===
                                productsList?.FK_USUARIO_VENDEDOR && (
                                  <Chip
                                    color="primary"
                                    size="sm"
                                    className="text-white font-bold"
                                  >
                                    Vendedor
                                  </Chip>
                                )}
                            </div>
                            <div style={{ overflow: "hidden" }}>
                              <pre style={{
                                fontFamily: "inherit",
                                margin: "0",
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                              }}>{el?.MENSAGEM}</pre>
                            </div>

                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex items-center justify-center">
                        <h1 className="opacity-50">
                          {loggedID === productsList?.FK_USUARIO_VENDEDOR
                            ? "Entre em contato com o comprador por aqui"
                            : "Entre em contato com o vendedor por aqui"}
                        </h1>
                      </div>
                    )}

                    <Divider />
                  </div>
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
                      color="primary"
                      className="font-bold text-white rounded-full"
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {loggedID !== productsList?.FK_USUARIO_VENDEDOR && (
                  <>
                    <Button
                      isDisabled={!canRate}
                      onPress={() => setIsOpenModalRating(true)}
                      color="warning"
                      variant="bordered"
                    >
                      Avaliar vendedor <Star size={15} />
                    </Button>

                    <Button
                      isDisabled={!canRefund}
                      onPress={onOpenChange}
                      color="danger"
                      variant="bordered"
                    >
                      Solicitar reembolso
                    </Button>
                  </>
                )}
              </div>
              <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Dados para solicitação de reembolso
                      </ModalHeader>
                      <ModalBody>
                        <div className="flex flex-col items-center justify-center gap-6 w-full">
                          <Textarea
                            value={reembolsoForm?.motivo}
                            onChange={(e) => {
                              setReembolsoForm((prevState) => ({
                                ...prevState,
                                motivo: e.target.value,
                              }));
                            }}
                            label={"Descreva o motivo da solicitação"}
                            labelPlacement="outside"
                            placeholder="Escreva aqui"
                            variant="bordered"
                          />
                          <div className="flex items-center justify-center gap-4 w-full">
                            <Select
                              value={reembolsoForm?.tipoChave}
                              onChange={(e) => {
                                setReembolsoForm((prevState) => ({
                                  ...prevState,
                                  tipoChave: e.target.value,
                                }));
                              }}
                              variant="bordered"
                              label="Selecione o tipo da chave PIX"
                              labelPlacement="outside"
                            >
                              <SelectItem key={"Email"} value={"Email"}>
                                Email
                              </SelectItem>
                              <SelectItem key={"CPF"} value={"CPF"}>
                                CPF
                              </SelectItem>
                              <SelectItem key={"CNPJ"} value={"CNPJ"}>
                                CNPJ
                              </SelectItem>
                              <SelectItem key={"Telefone"} value={"Telefone"}>
                                Telefone
                              </SelectItem>
                              <SelectItem
                                key={"Chave aleatória"}
                                value={"Chave aleatória"}
                              >
                                Chave aleatória
                              </SelectItem>
                            </Select>
                            <div className="flex items-center justify-center gap-4 w-full">
                              <Input
                                onChange={(e) => {
                                  setReembolsoForm((prevState) => ({
                                    ...prevState,
                                    chave: e.target.value,
                                  }));
                                }}
                                value={reembolsoForm?.chave}
                                label={"Chave PIX"}
                                labelPlacement="outside"
                                variant="bordered"
                              />
                            </div>
                          </div>
                        </div>
                      </ModalBody>
                      <Divider className="mt-8" />
                      <ModalFooter>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-4 mb-2">
                            <Button
                              isLoading={isLoadingReembolso}
                              onPress={async () => {
                                await handleSendReembolso();
                                onClose();
                              }}
                              variant="bordered"
                              color="danger"
                            >
                              Enviar solicitação de reembolso
                            </Button>
                          </div>
                        </div>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>

              <Modal
                size="xl"
                isOpen={isOpenModalRating}
                onOpenChange={() =>
                  setIsOpenModalRating((prevState) => !prevState)
                }
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Avalie o vendedor
                      </ModalHeader>
                      <ModalBody>
                        <div className="flex flex-col items-center justify-center gap-6 w-full">
                          <div className="flex gap-4">
                            <Star
                              className="cursor-pointer"
                              onClick={() => setAvaliacaoRange(1)}
                              fill={`${avalicaoRange >= 1 ? "orange" : "transparent"
                                }`}
                              color="orange"
                            />
                            <Star
                              className="cursor-pointer"
                              onClick={() => setAvaliacaoRange(2)}
                              fill={`${avalicaoRange >= 2 ? "orange" : "transparent"
                                }`}
                              color="orange"
                            />
                            <Star
                              className="cursor-pointer"
                              onClick={() => setAvaliacaoRange(3)}
                              fill={`${avalicaoRange >= 3 ? "orange" : "transparent"
                                }`}
                              color="orange"
                            />
                            <Star
                              className="cursor-pointer"
                              onClick={() => setAvaliacaoRange(4)}
                              fill={`${avalicaoRange >= 4 ? "orange" : "transparent"
                                }`}
                              color="orange"
                            />
                            <Star
                              className="cursor-pointer"
                              onClick={() => setAvaliacaoRange(5)}
                              fill={`${avalicaoRange >= 5 ? "orange" : "transparent"
                                }`}
                              color="orange"
                            />
                          </div>
                          <Textarea
                            value={avalicaoText}
                            onChange={(e) => {
                              setAvaliacaoText(e.target.value);
                            }}
                            label={"Descreva sobre o vendedor"}
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
                              isLoading={isLoadingAvalicao}
                              onPress={async () => {
                                await handleSendAvaliacao();
                                onClose();
                              }}
                              variant="bordered"
                              color="warning"
                            >
                              Enviar avaliação
                            </Button>
                          </div>
                        </div>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          )}

          {productsList?.STATUS === "Aguardando pagamento" && (
            <div className="w-[100%] lg:w-[100%] flex flex-col items-center justify-center py-12 mb-24 border-1 rounded-lg">
              <div className="flex flex-col items-center justify-center gap-8 w-full">
                <h1 className="text-4xl font-bold text-center">Pagamento</h1>
                {!qrCodePix ? (
                  <h1 className="text-xl text-center">
                    Selecione o meio de pagamento
                  </h1>
                ) : (
                  <h1 className="text-xl text-center">
                    Escaneie o QR-CODE para efetuar o pagamento
                  </h1>
                )}

                <div className="flex flex-col gap-4 w-[50%]">
                  {!qrCodePix && (
                    <>
                      <div
                        onClick={() => {
                          setPaymentSelected(1);
                        }}
                        className="flex items-center justify-between gap-2 border-1 p-4 rounded-lg w-full cursor-pointer"
                      >
                        <h1 className="font-bold">
                          Pix{" "}
                          <span className="font-normal">
                            - Aprovação imediata
                          </span>
                        </h1>
                        <Checkbox
                          className="text-white"
                          disabled
                          isSelected={paymentSelected === 1}
                        ></Checkbox>
                      </div>

                      {/* <div
                        onClick={() => {
                          //setPaymentSelected(2);
                        }}
                        className="flex items-center justify-between gap-2 border-1 p-4 rounded-lg w-full cursor-pointer opacity-50"
                      >
                        <h1 className="font-bold">
                          Cartão de crédito / débito
                        </h1>
                        <Checkbox
                          className="text-white"
                          disabled
                          isSelected={paymentSelected === 2}
                        ></Checkbox>
                      </div> */}
                    </>
                  )}

                  <div className="w-full h-full flex flex-col items-center justify-center">
                    {!!qrCodePix && (
                      <>
                        <img
                          className="w-60"
                          src={`data:image/png;base64,${qrCodePix}`}
                        />
                        <Button
                          onPress={() => {
                            navigator.clipboard.writeText(codePix).then(() => {
                              toast.success(
                                "Copiado para área de transferência!"
                              );
                            });
                          }}
                        >
                          Copiar código copia e cola
                        </Button>
                      </>
                    )}
                  </div>

                  {!qrCodePix && (
                    <div className="flex items-center justify-center w-full">
                      <Button
                        onClick={() => {
                          generatePixQrCode();
                        }}
                        isDisabled={!paymentSelected}
                        color="primary"
                        className="text-white font-bold rounded-full"
                      >
                        Continuar para pagamento
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full flex items-center justify-center my-24">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default OrderDetails;

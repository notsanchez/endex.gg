import { loggedID, loggedName } from "@/utils/useAuth";
import {
  Button,
  Checkbox,
  Chip,
  Divider,
  Input,
  Spinner,
} from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const OrderDetails = () => {
  const router = useRouter();

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  const [paymentSelected, setPaymentSelected] = useState(null);
  const [qrCodePix, setQrCodePix] = useState("");

  const [messageList, setMessageList] = useState([]);
  const [messageTyped, setMessageTyped] = useState("");

  const getProducts = async () => {
    await axios
      .post("/api/query", {
        query: `
        SELECT TV.id, TP.TITULO, TP.PRECO, TV.QTD, TSV.NOME AS STATUS, TU.NICKNAME, TV.FK_USUARIO_COMPRADOR, TP.FK_USUARIO AS FK_USUARIO_VENDEDOR FROM T_VENDAS TV 
        INNER JOIN T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO 
        INNER JOIN T_STATUS_VENDA TSV ON TSV.id = TV.FK_STATUS
        INNER JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO
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

  const getMessages = async () => {
    await axios
      .post("/api/query", {
        query: `
        SELECT TMV.*, TU.NICKNAME FROM T_MENSAGENS_VENDA TMV
        INNER JOIN T_USUARIOS TU ON TU.id = TMV.FK_USUARIO
        WHERE FK_VENDA = "${router?.query?.id}"
        `,
      })
      .then((res) => {
        setMessageList(res?.data?.results);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const generatePixQrCode = async () => {
    const resQrCode = await axios.post("/api/gen-qr-code-pix", {
      price: Number(productsList?.PRECO),
      external_id: Number(router?.query?.id),
    });

    if (!!resQrCode) {
      setQrCodePix(resQrCode?.data?.qrcode);
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
      .then((res) => {
        setIsLoadingMessage(false);
        setMessageTyped("");
      })
      .catch((err) => {
        setIsLoadingMessage(false);
      });
  };

  useEffect(() => {
    const fetchProducts = () => {
      getProducts();
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
        productsList?.FK_USUARIO_VENDEDOR === loggedID
      ) {
        setIsLoading(false);
      } else {
        router?.push("/");
      }
    }
  }, [productsList]);

  return (
    <div className="w-[100%] lg:w-[60%] flex flex-col gap-12 mb-24">
      {!isLoading ? (
        <>
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
                  <h1>quinta-feira, 21 de março de 2024 23:23:35</h1>
                </div>
                <div className="flex items-center justify-between gap-12">
                  <h1>Item:</h1>
                  <h1>{productsList?.TITULO}</h1>
                </div>
                <div className="flex items-center justify-between gap-12">
                  <h1>Vendedor:</h1>
                  <h1>{productsList?.NICKNAME}</h1>
                </div>
                <div className="flex items-center justify-between gap-12">
                  <h1>Preço:</h1>
                  <h1>R$ {productsList?.PRECO}</h1>
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
            <div className="w-[100%] lg:w-[100%] flex flex-col items-center justify-center py-12 mt-12 border-1 rounded-lg">
              <div className="flex flex-col items-center justify-center gap-8 w-full">
                <h1 className="text-4xl font-bold text-center">
                  Chat com vendedor
                </h1>

                <Divider />

                <div className="flex flex-col w-full items-center justify-end gap-4 h-[auto] overflow-visible">
                  {messageList?.length > 0 ? (
                    messageList?.map((el, index) => (
                      <div
                        key={index}
                        className={`w-[80%] flex flex-col ${
                          el?.FK_USUARIO === loggedID
                            ? "items-end"
                            : "items-start"
                        } justify-center`}
                      >
                        <div className="w-[60%] border-1 p-4 rounded-lg">
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
                          <p>{el?.MENSAGEM}</p>
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
                  <Input
                    variant="bordered"
                    placeholder="Digite sua mensagem"
                    value={messageTyped}
                    isDisabled={isLoadingMessage}
                    onChange={(e) => {
                      setMessageTyped(e.target.value);
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

                      <div
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
                      </div>
                    </>
                  )}

                  <div className="w-full h-full flex flex-col items-center justify-center">
                    {!!qrCodePix && (
                      <>
                        <img
                          className="w-60"
                          src={`data:image/png;base64,${qrCodePix}`}
                        />
                        <Button>Copiar código copia e cola</Button>
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

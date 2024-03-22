import { loggedID } from "@/utils/useAuth";
import { Button, Checkbox, Chip, Spinner } from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const OrderDetails = () => {
  const router = useRouter();

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [paymentSelected, setPaymentSelected] = useState(null);
  const [qrCodePix, setQrCodePix] = useState("");

  const getProducts = async () => {
    await axios
      .post("/api/query", {
        query: `
        SELECT TV.id, TP.TITULO, TP.PRECO, TV.QTD, TSV.NOME AS STATUS, TU.NICKNAME, TV.FK_USUARIO_COMPRADOR FROM T_VENDAS TV 
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

  const generatePixQrCode = async () => {
    const resQrCode = await axios.post("/api/gen-qr-code-pix", {
      price: Number(productsList?.PRECO),
      external_id: Number(router?.query?.id),
    });

    if (!!resQrCode) {
      setQrCodePix(resQrCode?.data?.qrcode);
    }
  };

  useEffect(() => {
    getProducts(); 
    const interval = setInterval(getProducts, 5000); 
    return () => clearInterval(interval);
  }, [router?.query]);
  

  useEffect(() => {
    if (!!productsList?.FK_USUARIO_COMPRADOR) {
      if (productsList?.FK_USUARIO_COMPRADOR !== loggedID) {
        router?.push("/");
      } else {
        setIsLoading(false);
      }
    }
  }, [productsList]);

  return (
    <div className="w-[100%] lg:w-[60%] flex flex-col gap-12">
      {!isLoading ? (
        <>
          <div className="w-[100%] lg:w-[100%] flex flex-col items-center justify-center py-12 mt-12 border-1 rounded-lg">
            <div className="flex flex-col items-center justify-center gap-8 w-full">
              <h1 className="text-4xl font-bold text-center">
                Detalhes da compra
              </h1>

              <div className="flex flex-col">
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
                  <h1>{productsList?.PRECO}</h1>
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

          {productsList?.STATUS === "Aguardando pagamento" && (
            <div className="w-[100%] lg:w-[100%] flex flex-col items-center justify-center py-12 mb-24 border-1 rounded-lg">
              <div className="flex flex-col items-center justify-center gap-8 w-full">
                <h1 className="text-4xl font-bold text-center">Pagamento</h1>
                <h1 className="text-xl text-center">
                  Selecione o meio de pagamento
                </h1>

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
                          setPaymentSelected(2);
                        }}
                        className="flex items-center justify-between gap-2 border-1 p-4 rounded-lg w-full cursor-pointer"
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
                      <img
                        className="w-60"
                        src={`data:image/png;base64,${qrCodePix}`}
                      />
                    )}
                    <Button>Copiar código copia e cola</Button>
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

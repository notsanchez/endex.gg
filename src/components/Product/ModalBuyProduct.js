import { formatCurrency } from "@/utils/formatCurrency";
import { loggedID } from "@/utils/useAuth";
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
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const ModalBuyProduct = ({ isOpen, onOpenChange, valorProduto, variation }) => {
  const router = useRouter();

  const [qtd, setQtd] = useState(1);
  const [productData, setProductData] = useState({});

  const getProductData = async () => {
    const resProductData = await axios.post("/api/query", {
      query: `
                    SELECT TP.*, TPA.TAXA FROM T_PRODUTOS TP 
                    INNER JOIN T_CATEGORIAS TC ON TC.id = TP.FK_CATEGORIA
                    INNER JOIN T_TIPOS_DE_ANUNCIO TPA ON TPA.id = TP.FK_TIPO_DE_ANUNCIO
                    INNER JOIN T_USUARIOS TU ON TP.FK_USUARIO = TU.id
                    WHERE TP.id = "${router?.query?.id}" OR TP.SLUG = "${router?.query?.id}"
                `,
    });

    if (resProductData?.data?.results?.length > 0) {
      setProductData(resProductData?.data?.results?.[0]);
    } else {
      router.push("/");
    }
  };

  const handleCreateOrder = async () => {

    const resCreateOrder = await axios.post("/api/query", {
      query: `
            INSERT INTO T_VENDAS 
            (FK_PRODUTO, FK_USUARIO_COMPRADOR, QTD, FK_STATUS, FK_USUARIO_AFILIADO, FK_USUARIO_VENDEDOR, COMISSAO_ENDEX, VALOR_A_RECEBER, VALOR_AFILIADO, FK_VARIACAO) 
            VALUES (
              "${productData?.id}", 
              "${loggedID}", 
              "${qtd}",
              "1", 
              ${!!router?.query?.code ? `"${router?.query?.code}"` : "NULL"}, 
              "${productData?.FK_USUARIO}", 
              "${(((Number(productData?.TAXA) / 100) * Number(valorProduto)) * qtd).toFixed(2)}", 
              ${!!router?.query?.code ? `"${((valorProduto * qtd) - (((Number(valorProduto) * qtd) * 0.25) + (((Number(productData?.TAXA) / 100) * Number(valorProduto)) * qtd))).toFixed(2)}"` : `"${((Number(valorProduto) - ((Number(productData?.TAXA) / 100) * Number(valorProduto))) * qtd).toFixed(2)}"`}, 
              ${!!router?.query?.code ? `"${((Number(valorProduto) * qtd) * 0.25).toFixed(2)}"` : "NULL"},
              ${!!variation?.id ? `"${variation?.id}"` : "NULL"}
            )
        `.trim(),
    });

    if (resCreateOrder?.data?.results?.length > 0) {
      router.push(`/order/${resCreateOrder?.data?.results?.[0]?.id}`);
    } else {
      router.push("/");
    }

  }

  useEffect(() => {
    if (!!router?.query?.id) {
      getProductData()
    }
  }, [router?.query])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom-center"
      size="lg"
    >
      <ModalContent>
        {(onClose) => (
          <div className="flex flex-col items-start justify-between w-full h-full gap-12 py-8">
            <>
              <ModalBody className="w-full flex flex-col justify-between gap-12">
                <div className="flex flex-col gap-4">
                  <div className="w-full flex items-center justify-start">
                    <h1 className="text-2xl font-bold">
                      {productData?.TITULO}
                    </h1>
                  </div>

                  <Divider />

                  <div className="w-full flex items-center justify-start">
                    <h1 className="text-xl">
                      Preço: <span className="font-bold">{formatCurrency(valorProduto * qtd)}</span>
                    </h1>
                  </div>
                  <div className="w-full flex items-center justify-start gap-4">
                    <h1 className="text-xl">Quantidade: </h1>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => {
                          if (qtd > 1) {
                            setQtd((prevState) => prevState - 1);
                          }
                        }}
                        color="primary"
                        variant="bordered"
                        className="font-bold text-xl"
                        isIconOnly
                        size="sm"
                      >
                        -
                      </Button>
                      <h1 className="text-xl font-bold">{qtd}</h1>
                      <Button
                        onClick={() => {
                          if (qtd < productData?.QTD_DISPONIVEL) {
                            setQtd((prevState) => prevState + 1)
                          }
                        }}
                        color="primary"
                        variant="bordered"
                        className="font-bold text-xl"
                        isIconOnly
                        size="sm"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>

                <Divider />

                <div className="w-full flex items-center justify-end gap-2">
                  <Button onClick={onOpenChange} className="font-bold rounded-full">Voltar</Button>
                  <Button
                    onClick={() => {
                      handleCreateOrder()
                    }}
                    color="primary"
                    className="text-white font-bold rounded-full"
                  >
                    Ir para checkout
                  </Button>
                </div>
              </ModalBody>
            </>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalBuyProduct;

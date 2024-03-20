import {
  Button,
  Card,
  Chip,
  Divider,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import axios from "axios";
import { Heart } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const ProductPage = () => {
  const router = useRouter();
  const [productData, setProductData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const getProductData = async () => {
    await axios
      .post("/api/query", {
        query: `
                SELECT TP.TITULO, TP.DESCRICAO, TP.QTD_DISPONIVEL, TP.PRECO, TPA.NOME AS TIPO_ANUNCIO, TU.NICKNAME, TC.NOME AS CATEGORIA FROM T_PRODUTOS TP 
                INNER JOIN T_CATEGORIAS TC ON TC.id = TP.FK_CATEGORIA
                INNER JOIN T_TIPOS_DE_ANUNCIO TPA ON TPA.id = TP.FK_TIPO_DE_ANUNCIO
                INNER JOIN T_USUARIOS TU ON TP.FK_USUARIO = TU.id
                WHERE TP.id = "${router?.query?.id}"
            `,
      })
      .then((res) => {
        if (res?.data?.results?.length > 0) {
          setProductData(res?.data?.results?.[0]);
          setIsLoading(false);
        } else {
          router.push("/");
        }
      })
      .catch((err) => {
        router.push("/");
      });
  };

  useEffect(() => {
    if (!router?.query?.id) {
      return;
    }
    getProductData();
  }, [router?.query]);

  return (
    <div className="w-[100%] lg:w-[70%] flex flex-col items-center justify-between p-4 lg:py-12 lg:px-0 h-auto gap-12">
      {isLoading ? (
        <div className="w-full flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="w-full h-full lg:h-[auto] flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 mt-4 lg:mt-0">
            <div className="flex flex-col lg:flex-col items-center justify-start gap-12 w-full">
              <div className="w-full h-[300px] bg-purple-300 rounded-lg"></div>
{/* 
              <div className="w-[1px] h-[300px] bg-black opacity-10 hidden lg:block"></div> */}

              <div className="flex flex-col gap-12 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start gap-8 w-full">
                    <div>
                      <h1 className="text-2xl font-bold">
                        {productData?.TITULO}
                      </h1>
                      <h1 className="text-sm">{productData?.CATEGORIA}</h1>
                    </div>
                    <Chip className="bg-orange-400 text-white font-bold">
                      {productData?.TIPO_ANUNCIO}
                    </Chip>
                  </div>
                  <div>
                    <Button size="sm" variant="bordered" color="danger">
                      Salvar produto <Heart size={16} />{" "}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full">
                <div className="flex w-full items-center justify-center lg:justify-start gap-8">
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="font-bold">DISPONÍVEIS</h1>
                    <span>{productData?.QTD_DISPONIVEL}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="font-bold">VENDAS</h1>
                    <span>0</span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-center lg:justify-end gap-4">
                  <h1 className="text-xl font-bold text-[#8234E9]">
                    R$ {productData?.PRECO}
                  </h1>
                  <Button
                    color="primary"
                    size="lg"
                    className="text-white font-bold"
                  >
                    COMPRAR
                  </Button>
                </div>
                </div>
              </div>
              <Divider />
            </div>

            <div className="p-8 h-full border-1 rounded-lg w-[30%]">
              <div className="flex items-center justify-center">
                <h1 className="font-bold text-2xl text-center">Vendedor</h1>
              </div>
              <div className="flex flex-col items-center justify-center mt-8 gap-4">
                <div className="w-20 h-20 bg-[#8234E9] rounded-full"></div>
                <h1 className="text-[#8234E9] font-bold">
                  {productData?.NICKNAME} (100)
                </h1>
                <h1 className="text-center">Número de avaliações: 900</h1>
              </div>
            </div>
          </div>
          <div className="w-full h-full flex flex-col gap-24">
            <div className="w-full flex flex-col gap-4">
              <h1 className="font-bold text-2xl">DESCRIÇÃO DO ANUNCIO</h1>
              <div className="w-full lg:w-[80%] p-8 border-1 rounded-lg gap-12 flex flex-col">
                <p>
                  Válido somente para League of Legends no PC. 355 RP + 10 Bônus
                  = R$ 12,00 735 RP + 20 Bônus = R$ 23,00 915 RP + 45 Bônus = R$
                  28,00 1470 RP + 115 Bônus = R$ 45,00 1835 RP + 155 Bônus = R$
                  55,00 3670 RP + 365 Bônus = R$ 105,00 Para utilizar seu Cartão
                  Pré-Pago League of Legends Virtual, acesse o jogo e entre na
                  sua conta. O crédito do seu Cartão Pré-Pago será utilizado no
                  valor integral. É permitido cadastrar quantos cartões quiser
                  por conta, com o limite de 5 cartões por dia. Seu saldo não
                  poderá ser cancelado, trocado, devolvido ou ser convertido em
                  dinheiro. Tenha responsabilidade ao ativar o seu código.
                </p>
                <div className="flex flex-col gap-2">
                  <Divider />
                  <p className="text-sm opacity-70">
                    Anuncio criado em: 20/03/2024 às 17:30
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <h1 className="font-bold text-2xl">PERGUNTAS</h1>
              <div className="w-full lg:w-[80%] p-8 border-1 rounded-lg gap-12 flex flex-col">
                <div>
                  <div className="flex gap-2">
                    <h1 className="font-bold">Williams007</h1>
                    <p>-</p>
                    <p>há 5 dias</p>
                  </div>
                  <p className="opacity-70">está on ?</p>
                </div>
                <div className="w-full h-full flex flex-col gap-4">
                  <h1 className="font-bold text-2xl">FAÇA UMA PERGUNTA</h1>
                  <Textarea
                    variant="bordered"
                    placeholder="Digite sua pergunta aqui"
                    className="w-full"
                  />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-sm hidden lg:block">
                      ATENÇÃO: Não é permitido enviar contatos externos como o
                      WhatsApp, Discord, Facebook, Instagram, E-mail e
                      semelhantes.
                    </p>
                    <Button color="primary" className="text-white font-bold">
                      Perguntar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPage;

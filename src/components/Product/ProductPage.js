import { isLogged, loggedID, loggedName } from "@/utils/useAuth";
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
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProductPage = ({ onOpen }) => {
  const router = useRouter();
  const [productData, setProductData] = useState({});
  const [perguntasData, setPerguntasData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageIndexShow, setImageIndexShow] = useState("IMAGEM_1");
  const [showReplyButton, setShowReplyButton] = useState(null);

  const [perguntaInput, setPerguntaInput] = useState("");
  const [limitPerguntas, setLimitPerguntas] = useState(5);
  const [isLoadingPerguntas, setIsLoadingPerguntas] = useState(false);

  const getProductData = async () => {
    setIsLoadingPerguntas(true);
    const resProductData = await axios.post("/api/query", {
      query: `
                SELECT TP.TITULO, TP.FK_USUARIO, TP.IMAGEM_1, TP.IMAGEM_2, TP.IMAGEM_3, TP.created_at AS CRIADO_EM, TP.DESCRICAO, TP.QTD_DISPONIVEL, TP.PRECO, TPA.NOME AS TIPO_ANUNCIO, TU.NICKNAME, TC.NOME AS CATEGORIA FROM T_PRODUTOS TP 
                INNER JOIN T_CATEGORIAS TC ON TC.id = TP.FK_CATEGORIA
                INNER JOIN T_TIPOS_DE_ANUNCIO TPA ON TPA.id = TP.FK_TIPO_DE_ANUNCIO
                INNER JOIN T_USUARIOS TU ON TP.FK_USUARIO = TU.id
                WHERE TP.id = "${router?.query?.id}"
            `,
    });

    if (resProductData?.data?.results?.length > 0) {
      setProductData(resProductData?.data?.results?.[0]);

      const resPerguntasData = await axios.post("/api/query", {
        query: `
                  SELECT TPE.PERGUNTA, TPE.RESPOSTA, TU.NICKNAME FROM T_PERGUNTAS TPE
                  INNER JOIN T_PRODUTOS TP ON TP.id = TPE.FK_PRODUTO
                  INNER JOIN T_USUARIOS TU ON TU.id = TPE.FK_USUARIO
                  WHERE TP.id = "${router?.query?.id}"
                  ORDER BY TPE.created_at DESC
                  LIMIT ${limitPerguntas}
              `,
      });

      if (resPerguntasData?.data?.results?.length > 0) {
        setPerguntasData(resPerguntasData?.data?.results);
        setIsLoadingPerguntas(false);
      } else {
        setIsLoadingPerguntas(false);
      }

      setIsLoading(false);
    } else {
      router.push("/");
    }
  };

  const handleSendPergunta = async () => {
    if (!!perguntaInput) {
      await axios
        .post("/api/query", {
          query: `INSERT INTO T_PERGUNTAS (FK_USUARIO, FK_PRODUTO, PERGUNTA) VALUES ("${loggedID}", "${router?.query?.id}", "${perguntaInput}")`,
        })
        .then((res) => {
          if (res?.data?.results?.length > 0) {
            setPerguntasData((prevState) =>
              prevState?.concat({
                PERGUNTA: perguntaInput,
                RESPOSTA: null,
                NICKNAME: loggedName,
              })
            );
            toast.success("Pergunta enviada");
            setPerguntaInput("");
          }
        })
        .catch(() => {
          toast.error("Erro ao enviar pergunta");
          setPerguntaInput("");
        });
    }
  };

  useEffect(() => {
    if (!router?.query?.id) {
      return;
    }
    getProductData();
  }, [router?.query, limitPerguntas]);

  return (
    <div className="w-[100%] lg:w-[65%] flex flex-col items-center justify-between p-4 lg:py-12 lg:px-0 h-auto gap-12">
      {isLoading ? (
        <div className="w-full flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="w-full h-full lg:h-[auto] flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 mt-4 lg:mt-0">
            <div className="flex flex-col lg:flex-col items-start justify-start gap-12 w-full">
              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-start w-full h-full gap-4">
                <div
                  className="w-[300px] lg:w-[700px] h-[300px] rounded-lg"
                  style={{
                    backgroundImage: `url(${productData?.[imageIndexShow]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
                <div className="flex flex-row lg:flex-col gap-2">
                  {!!productData?.IMAGEM_1 && (
                    <div
                      onClick={() => {
                        setImageIndexShow("IMAGEM_1");
                      }}
                      className={`w-[80px] h-[50px] lg:w-[150px] lg:h-[80px] rounded-lg cursor-pointer ${
                        imageIndexShow === "IMAGEM_1"
                          ? "opacity-100"
                          : "opacity-50"
                      } transition-all duration-75`}
                      style={{
                        backgroundImage: `url(${productData?.IMAGEM_1})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                  )}
                  {!!productData?.IMAGEM_2 && (
                    <div
                      onClick={() => {
                        setImageIndexShow("IMAGEM_2");
                      }}
                      className={`w-[80px] h-[50px] lg:w-[150px] lg:h-[80px] rounded-lg cursor-pointer ${
                        imageIndexShow === "IMAGEM_2"
                          ? "opacity-100"
                          : "opacity-50"
                      } transition-all duration-75`}
                      style={{
                        backgroundImage: `url(${productData?.IMAGEM_2})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                  )}

                  {!!productData?.IMAGEM_3 && (
                    <div
                      onClick={() => {
                        setImageIndexShow("IMAGEM_3");
                      }}
                      className={`w-[80px] h-[50px] lg:w-[150px] lg:h-[80px] rounded-lg cursor-pointer ${
                        imageIndexShow === "IMAGEM_3"
                          ? "opacity-100"
                          : "opacity-50"
                      } transition-all duration-75`}
                      style={{
                        backgroundImage: `url(${productData?.IMAGEM_3})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                  )}
                </div>
              </div>

              {/* <div className="w-full h-[300px] bg-purple-300 rounded-lg"></div> */}

              <div className="flex flex-col gap-12 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between gap-8 w-full">
                    <div>
                      <h1 className="text-2xl font-bold">
                        {productData?.TITULO}
                      </h1>
                      <h1 className="text-sm">{productData?.CATEGORIA}</h1>
                    </div>
                    <Chip className="bg-purple-400 text-white font-bold">
                      {productData?.TIPO_ANUNCIO}
                    </Chip>
                  </div>
                  <div>
                    <Button size="sm" variant="bordered" color="danger">
                      Salvar produto <Heart size={16} />{" "}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12">
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
                  <Divider className="block lg:hidden" />
                  <div className="flex flex-col lg:flex-row w-full items-center justify-center lg:justify-end gap-4">
                    <h1 className="text-xl font-bold text-[#8234E9]">
                      R$ {productData?.PRECO}
                    </h1>
                    {loggedID !== productData?.FK_USUARIO && (
                      <Button
                        color="primary"
                        onPress={() => {
                          if (!isLogged) {
                            onOpen();
                          }
                        }}
                        size="lg"
                        className="text-white font-bold"
                      >
                        COMPRAR
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <Divider className="hidden lg:block" />
            </div>

            <div className="p-8 h-full border-1 rounded-lg w-[100%] lg:w-[30%]">
              <div className="flex items-center justify-center">
                <h1 className="font-bold text-2xl text-center">Vendedor</h1>
              </div>
              <div className="flex flex-col items-center justify-center mt-8 gap-4">
                <div className="w-20 h-20 bg-[#8234E9] rounded-full"></div>
                <h1 className="text-[#8234E9] font-bold">
                  {productData?.NICKNAME}
                </h1>
                {/* <h1 className="text-center">Número de avaliações: 900</h1> */}
              </div>
            </div>
          </div>
          <div className="w-full h-full flex flex-col gap-24">
            <div className="w-full flex flex-col gap-4">
              <h1 className="font-bold text-2xl">DESCRIÇÃO DO ANUNCIO</h1>
              <div className="w-full lg:w-[80%] p-8 border-1 rounded-lg gap-12 flex flex-col">
                <p>{productData?.DESCRICAO}</p>
                <div className="flex flex-col gap-2">
                  <Divider />
                  <p className="text-sm opacity-70">
                    Anuncio criado em:{" "}
                    {moment(productData?.CRIADO_EM).format(
                      "DD/MM/YYYY [às] HH:mm:ss"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-4">
              <h1 className="font-bold text-2xl">PERGUNTAS</h1>
              <div className="w-full lg:w-[80%] p-8 border-1 rounded-lg gap-4 flex flex-col">
                {perguntasData?.length > 0 ? (
                  perguntasData?.map((el, index) => (
                    <div
                      onMouseEnter={() => setShowReplyButton(index)}
                      onMouseLeave={() => setShowReplyButton(null)}
                      id="pergunta"
                      className="flex flex-col w-full border-1 p-4 rounded-lg items-start"
                    >
                      <div className="flex items-center justify-center gap-8">
                        <div>
                          <div className="flex gap-2">
                            <h1 className="font-bold">{el?.NICKNAME}</h1>
                            {/* <p>-</p> */}
                            {/* <p>há 5 dias</p> */}
                          </div>
                          <p className="opacity-70">{el?.PERGUNTA}</p>
                        </div>
                        {!el?.RESPOSTA &&
                          showReplyButton === index &&
                          productData?.FK_USUARIO === loggedID && (
                            <Button>Responder</Button>
                          )}
                      </div>
                      {!!el?.RESPOSTA && (
                        <div className="ml-12 mt-2">
                          <div className="flex gap-2">
                            <h1 className="font-bold">
                              {productData?.NICKNAME}{" "}
                            </h1>
                            <Chip
                              className="font-bold text-white"
                              color="primary"
                              size="sm"
                            >
                              Vendedor
                            </Chip>
                            {/* <p>-</p> */}
                            {/* <p>há 5 dias</p> */}
                          </div>
                          <p className="opacity-70">{el?.RESPOSTA}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <h1 className="opacity-50">Nenhuma pergunta</h1>
                  </div>
                )}

                {perguntasData?.length > 0 && (
                  <>
                    <Divider />
                    <Button
                      isLoading={isLoadingPerguntas}
                      variant="light"
                      onClick={() => {
                        setLimitPerguntas((prevState) => prevState + 5);
                      }}
                    >
                      Mostrar mais perguntas
                    </Button>
                  </>
                )}

                {loggedID !== productData?.FK_USUARIO && (
                  <div className="w-full h-full flex flex-col gap-4 mt-4">
                  <h1 className="font-bold text-2xl">FAÇA UMA PERGUNTA</h1>
                  <Textarea
                    variant="bordered"
                    placeholder="Digite sua pergunta aqui"
                    className="w-full"
                    value={perguntaInput}
                    onChange={(e) => {
                      setPerguntaInput(e.target.value);
                    }}
                  />
                  <div className="flex items-center justify-between w-full">
                    <p className="text-sm hidden lg:block">
                      ATENÇÃO: Não é permitido enviar contatos externos como o
                      WhatsApp, Discord, Facebook, Instagram, E-mail e
                      semelhantes.
                    </p>
                    <Button
                      onPress={() => {
                        if(isLogged){
                          handleSendPergunta()
                        } else {
                          onOpen()
                        }
                        
                      }}
                      color="primary"
                      className="text-white font-bold"
                    >
                      Perguntar
                    </Button>
                  </div>
                </div>
                )}
                
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPage;

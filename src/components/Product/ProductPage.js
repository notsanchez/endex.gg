import { formatCurrency } from "@/utils/formatCurrency";
import { isAdmin, isLogged, loggedID, loggedName } from "@/utils/useAuth";
import {
  Button,
  Card,
  Select,
  SelectItem,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import { Heart, Star } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ModalBuyProduct from "./ModalBuyProduct";

const ProductPage = ({ onOpen }) => {
  const router = useRouter();
  const [productData, setProductData] = useState({});
  const [perguntasData, setPerguntasData] = useState([]);
  const [avaliacoesData, setAvaliacoesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageIndexShow, setImageIndexShow] = useState("IMAGEM_1");
  const [showReplyButton, setShowReplyButton] = useState(null);

  const [perguntaInput, setPerguntaInput] = useState("");
  const [limitPerguntas, setLimitPerguntas] = useState(5);
  const [isLoadingPerguntas, setIsLoadingPerguntas] = useState(false);

  const [canAffiliate, setCanAffiliate] = useState(false);

  const { isOpen, onOpenChange } = useDisclosure();
  const [isOpenResponseModal, setIsOpenResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({});

  const [variations, setVariations] = useState([]);
  const [variantSelected, setVariantSelected] = useState(null)

  const [valorProduto, setValorProduto] = useState(null)

  const [openModalBuy, setOpenModalBuy] = useState(false)


  const handleOpenModalBuy = () => {
    setOpenModalBuy((prevState) => !prevState)
  }

  const getProductData = async () => {
    setIsLoadingPerguntas(true);
    const resProductData = await axios.post("/api/query", {
      query: `
          SELECT 
          TP.TITULO,
          TP.id AS ID_PRODUTO,
          TP.FK_USUARIO, 
          TP.IMAGEM_1, 
          TP.IMAGEM_2, 
          TP.IMAGEM_3, 
          TP.created_at AS CRIADO_EM, 
          TP.DESCRICAO, 
          TP.QTD_DISPONIVEL, 
          TP.PRECO,
          TP.PRECO_A_RECEBER,
          TP.AFILIADOS,
          TPA.NOME AS TIPO_ANUNCIO, 
          TU.NICKNAME, 
          TU.created_at as MEMBRO_DESDE,
          TC.NOME AS CATEGORIA,
          TP.FK_STATUS,
          (SELECT COUNT(*) FROM T_VENDAS TV WHERE TV.FK_PRODUTO = TP.id AND TV.FK_STATUS = 2) AS QTD_VENDAS,
          (SELECT COUNT(*) FROM T_AVALIACOES TA INNER JOIN T_PRODUTOS TPA ON TPA.id = TA.FK_PRODUTO INNER JOIN T_USUARIOS TUA ON TUA.id = TPA.FK_USUARIO WHERE TUA.id = TU.id) AS QTD_AVALIACOES,
          (SELECT AVG(TA.RATING) FROM T_AVALIACOES TA INNER JOIN T_PRODUTOS TPA ON TPA.id = TA.FK_PRODUTO INNER JOIN T_USUARIOS TUA ON TUA.id = TPA.FK_USUARIO WHERE TUA.id = TU.id) AS MEDIA_AVALIACAO
          FROM 
              T_PRODUTOS TP 
              INNER JOIN T_CATEGORIAS TC ON TC.id = TP.FK_CATEGORIA
              INNER JOIN T_TIPOS_DE_ANUNCIO TPA ON TPA.id = TP.FK_TIPO_DE_ANUNCIO
              INNER JOIN T_USUARIOS TU ON TP.FK_USUARIO = TU.id
          WHERE TP.id = "${router?.query?.id}" OR TP.SLUG = "${router?.query?.id}"
      `,
    });

    if (resProductData?.data?.results?.length > 0) {
      setProductData(resProductData?.data?.results?.[0]);

      setValorProduto(resProductData?.data?.results?.[0]?.PRECO)

      const resPerguntasData = await axios.post("/api/query", {
        query: `
                  SELECT TPE.id, TPE.PERGUNTA, TPE.RESPOSTA, TU.NICKNAME FROM T_PERGUNTAS TPE
                  INNER JOIN T_PRODUTOS TP ON TP.id = TPE.FK_PRODUTO
                  INNER JOIN T_USUARIOS TU ON TU.id = TPE.FK_USUARIO
                  WHERE TP.id = "${resProductData?.data?.results?.[0]?.ID_PRODUTO}"
                  ORDER BY TPE.created_at DESC
                  LIMIT ${limitPerguntas}
              `,
      });

      const resAvaliacoesData = await axios.post("/api/query", {
        query: `
            SELECT TA.MENSAGEM,
            TA.RATING,
            TU.NICKNAME 
            FROM T_AVALIACOES TA 
            INNER JOIN T_USUARIOS TU ON TU.id = TA.FK_USUARIO 
            WHERE TA.FK_PRODUTO = ${resProductData?.data?.results?.[0]?.ID_PRODUTO} ORDER BY TA.created_at DESC
              `,
      });

      if (resPerguntasData?.data?.results?.length > 0) {
        setPerguntasData(resPerguntasData?.data?.results);
        setIsLoadingPerguntas(false);
      } else {
        setIsLoadingPerguntas(false);
      }

      const resProductVariationsData = await axios.post("/api/query", {
        query: `
            SELECT * FROM T_VARIACOES_PRODUTO WHERE FK_PRODUTO = "${resProductData?.data?.results?.[0]?.ID_PRODUTO}"
        `,
      });

      setVariations(resProductVariationsData?.data?.results)

      if (resAvaliacoesData?.data?.results?.length > 0) {
        setAvaliacoesData(resAvaliacoesData?.data?.results);

      }

      setIsLoading(false);
    } 
    else {
      router.push("/");
    }
  };

  const handleSendPergunta = async () => {
    const hasLinks = /https?:\/\/\S+/.test(perguntaInput);
    const hasLinksHttp = /http?:\/\/\S+/.test(perguntaInput);

    if (hasLinks || hasLinksHttp) {
      toast.error("A pergunta não pode conter links!");
      return;
    }

    if (!!perguntaInput) {
      await axios
        .post("/api/query", {
          query: `INSERT INTO T_PERGUNTAS (FK_USUARIO, FK_PRODUTO, PERGUNTA) VALUES ("${loggedID}", "${productData?.ID_PRODUTO}", "${perguntaInput}")`,
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

  const handleAddAfiliado = async () => {
    await axios
      .post("/api/query", {
        query: `INSERT INTO T_AFILIADOS (FK_USUARIO, FK_PRODUTO) VALUES ("${loggedID}", "${productData?.ID_PRODUTO}")`,
      })
      .then((res) => {
        if (res?.data?.results?.length > 0) {
          toast.success("Link de afiliado criado com sucesso!");
          router?.push("/wallet?page=affiliate");
        }
      })
      .catch(() => {
        toast.error("Erro ao criar link");
      });
  };

  const doVerifyIfIsAffiliate = async () => {
    if (!isLogged) {
      setCanAffiliate(true);
    } else {
      await axios
        .post("/api/query", {
          query: `
        SELECT
            CASE 
                WHEN (SELECT COUNT(*) FROM T_AFILIADOS WHERE FK_USUARIO = '14') >= 1 THEN 1 
                ELSE 0 
            END AS AFILIADO_AO_PRODUTO 
        FROM 
            T_AFILIADOS 
        WHERE 
            FK_USUARIO = '${loggedID}' AND FK_PRODUTO = '${productData?.ID_PRODUTO}';
        `,
        })
        .then((res) => {
          if (res?.data?.results?.length > 0) {
            setCanAffiliate(false);
          } else {
            setCanAffiliate(true);
          }
          if (router?.query?.code === loggedID) {
            router?.push(`/product/${productData?.ID_PRODUTO}`);
          }
        })
        .catch(() => {
          setCanAffiliate(false);
        });
    }
  };

  const handleResponseComment = async () => {
    await axios
      .post("/api/query", {
        query: `
          UPDATE T_PERGUNTAS SET RESPOSTA = '${responseData?.RESPOSTA}' WHERE id = ${responseData?.id}
        `,
      })
      .then((res) => {
        setIsOpenResponseModal(false);
        getProductData();
      })
      .catch(() => { });
  };

  useEffect(() => {
    if (!!router?.query?.id) {
      getProductData();

      doVerifyIfIsAffiliate();
    }
  }, [router?.query, limitPerguntas]);

  return (
    <div
      className={`w-[100%] lg:w-[65%] ${isLoading && "h-[90vh]"
        } flex flex-col items-center justify-between p-4 lg:py-12 lg:px-0 gap-12 mt-32`}
    >
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
                      className={`w-[80px] h-[50px] lg:w-[150px] lg:h-[80px] rounded-lg cursor-pointer ${imageIndexShow === "IMAGEM_1"
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
                      className={`w-[80px] h-[50px] lg:w-[150px] lg:h-[80px] rounded-lg cursor-pointer ${imageIndexShow === "IMAGEM_2"
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
                      className={`w-[80px] h-[50px] lg:w-[150px] lg:h-[80px] rounded-lg cursor-pointer ${imageIndexShow === "IMAGEM_3"
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
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12">
                  <div className="flex w-full items-center justify-center lg:justify-start gap-8">
                    <div className="flex flex-col items-center justify-center">
                      <h1 className="font-bold">DISPONÍVEIS</h1>
                      <span>{productData?.QTD_DISPONIVEL}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <h1 className="font-bold">VENDAS</h1>
                      <span>{productData?.QTD_VENDAS}</span>
                    </div>
                  </div>
                  <Divider className="block lg:hidden" />
                  <div className="flex flex-col items-end gap-4 w-full">
                    <div className="flex flex-row w-full items-center justify-center lg:justify-end gap-4">
                      <h1 className="text-4xl font-bold text-[#8234E9]">
                        {formatCurrency(valorProduto)}
                      </h1>
                      {variations?.length > 0 && (
                        <Select
                          label="Selecione uma variação"
                          className="w-full"
                          value={variantSelected?.id}
                        >
                          {variations.map((el) => (
                            <SelectItem onClick={() => {
                              if(variantSelected?.id === el?.id){
                                setVariantSelected(null)
                                setValorProduto(() => Number(productData?.PRECO))
                              } else {
                                setVariantSelected(el)
                              setValorProduto(() => Number(productData?.PRECO) + Number(el?.VALOR))
                              }
                              
                              }} key={el.id} value={el.id}>
                              {el.TITULO}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                     
                    </div>
                    <div className="flex flex-col items-center justify-start gap-4 w-full">
                    {loggedID !== productData?.FK_USUARIO && productData?.FK_STATUS == 2 && !isAdmin &&
                        productData?.QTD_DISPONIVEL >
                        productData?.QTD_VENDAS && (
                          <Button
                            color="primary"
                            onPress={() => {
                              if (!isLogged) {
                                onOpen();
                              } else {
                                handleOpenModalBuy();
                              }
                            }}
                            size="lg"
                            className="text-white font-bold w-full"
                          >
                            COMPRAR
                          </Button>
                        )}
                      {loggedID !== productData?.FK_USUARIO &&
                        !isAdmin &&
                        productData?.AFILIADOS == 1 &&
                        canAffiliate && (
                          <>
                            <Button
                              onPress={onOpenChange}
                              size="md"
                              variant="bordered"
                              color="primary"
                              className="w-full"
                            >
                              Afiliar-se ao produto
                            </Button>
                            <Modal
                              size="xl"
                              isOpen={isOpen}
                              onOpenChange={onOpenChange}
                            >
                              <ModalContent>
                                {(onClose) => (
                                  <>
                                    <ModalHeader className="flex flex-col gap-1">
                                      Afiliação em produtos
                                    </ModalHeader>
                                    <ModalBody>
                                      <div className="flex flex-col items-center justify-center gap-6 w-full">
                                        <h1>
                                          Ao se afiliar a esse produto você
                                          receberá uma comissão por todas as
                                          vendas realizadas através do seu link
                                          de afiliado.
                                        </h1>

                                        <Divider />
                                        <h1>
                                          Receba uma comissão de:{" "}
                                          <span className="font-bold">
                                            {formatCurrency(
                                              productData?.PRECO_A_RECEBER *
                                              0.25
                                            )}
                                          </span>{" "}
                                          por venda.
                                        </h1>
                                      </div>
                                    </ModalBody>
                                    <Divider className="mt-8" />
                                    <ModalFooter>
                                      <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-4 mb-2">
                                          <Button
                                            onPress={async () => {
                                              if (!isLogged) {
                                                onClose();
                                                onOpen();
                                              } else {
                                                await handleAddAfiliado();
                                                onClose();
                                              }
                                            }}
                                            variant="bordered"
                                            color="primary"
                                          >
                                            Afiliar-se ao produto
                                          </Button>
                                        </div>
                                      </div>
                                    </ModalFooter>
                                  </>
                                )}
                              </ModalContent>
                            </Modal>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <Divider className="hidden lg:block" />
            </div>

            <div className="py-8 h-full border-1 rounded-lg w-[100%] lg:w-[30%]">
              <div className="flex items-center justify-center">
                <h1 className="font-bold text-2xl text-center">
                  Dados do vendedor
                </h1>
              </div>
              <div className="flex flex-col items-center justify-center mt-8 gap-4">
                <h1 onClick={() => router?.push(`/user/${productData?.FK_USUARIO}`)} className="text-[#8234E9] font-bold cursor-pointer">
                  {productData?.NICKNAME}
                </h1>
                <Divider />
                <h1 className="text-[#8234E9] font-bold text-center text-sm">
                  Total de avaliações: {productData?.QTD_AVALIACOES}
                </h1>
                <h1 className="text-[#8234E9] font-bold text-center text-sm">
                  Média das avaliações:{" "}
                  {!!productData?.MEDIA_AVALIACAO
                    ? productData?.MEDIA_AVALIACAO
                    : 0}{" "}
                  / 5
                </h1>
                <h1 className="text-[#8234E9] font-bold text-center text-sm">
                  Membro desde:{" "}
                  {moment(productData?.MEMBRO_DESDE).format("DD/MM/YYYY")}
                </h1>
              </div>
            </div>
          </div>
          <div className="w-full h-full flex flex-col gap-24">
            <div className="w-full flex flex-col gap-4">
              <h1 className="font-bold text-2xl">DESCRIÇÃO DO ANUNCIO</h1>
              <div className="w-full lg:w-[80%] p-8 border-1 rounded-lg gap-12 flex flex-col">
                <div style={{ overflow: "hidden" }}>
                  <pre
                    style={{
                      fontFamily: "inherit",
                      margin: "0",
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                    }}
                  >
                    {productData?.DESCRICAO}
                  </pre>
                </div>
                <div className="flex flex-col gap-2">
                  <Divider />
                  <p className="text-sm opacity-70">
                    Anúncio criado em:{" "}
                    {moment(productData?.CRIADO_EM).format("DD/MM/YYYY")}
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
                            <Button
                              onClick={() => {
                                setIsOpenResponseModal(true);
                                setResponseData(el);
                              }}
                            >
                              Responder
                            </Button>
                          )}
                        <>
                          <Modal
                            size="xl"
                            isOpen={isOpenResponseModal}
                            onOpenChange={() =>
                              setIsOpenResponseModal((prevState) => !prevState)
                            }
                          >
                            <ModalContent>
                              {(onClose) => (
                                <>
                                  <ModalHeader className="flex flex-col gap-1">
                                    Responder comentário
                                  </ModalHeader>
                                  <ModalBody>
                                    <div className="flex flex-col items-start">
                                      <p className="font-bold bg-purple-500 px-2 rounded-full text-sm text-white">
                                        {responseData?.NICKNAME}
                                      </p>
                                      <p>{responseData?.PERGUNTA}</p>
                                    </div>
                                    <Textarea
                                      value={responseData?.RESPOSTA}
                                      onChange={(e) => {
                                        setResponseData((prevState) => ({
                                          ...prevState,
                                          RESPOSTA: e.target.value,
                                        }));
                                      }}
                                      placeholder="Digite aqui sua resposta"
                                      variant="bordered"
                                    />
                                  </ModalBody>
                                  <Divider className="mt-8" />
                                  <ModalFooter>
                                    <div className="flex flex-col items-end gap-2">
                                      <div className="flex gap-4 mb-2">
                                        <Button
                                          onPress={() => {
                                            if (responseData?.RESPOSTA) {
                                              handleResponseComment();
                                            }
                                          }}
                                          variant="bordered"
                                          color="primary"
                                        >
                                          Responder
                                        </Button>
                                      </div>
                                    </div>
                                  </ModalFooter>
                                </>
                              )}
                            </ModalContent>
                          </Modal>
                        </>
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

                {perguntasData?.length >= 5 && (
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
                          if (isLogged) {
                            handleSendPergunta();
                          } else {
                            onOpen();
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

            <div className="w-full flex flex-col gap-4">
              <h1 className="font-bold text-2xl">Avaliações</h1>
              <div className="w-full lg:w-[80%] p-8 border-1 rounded-lg gap-4 flex flex-col">
                {avaliacoesData?.length > 0 ? (
                  avaliacoesData?.map((el, index) => (
                    <div
                      id="pergunta"
                      className="flex flex-col w-full border-1 p-4 rounded-lg items-start"
                    >
                      <div className="flex items-center justify-center gap-8">
                        <div>
                          <div className="flex gap-2">
                            <div className="flex gap-4">
                              <h1 className="font-bold">{el?.NICKNAME}</h1>
                              <div className="flex">
                                <Star
                                  size={12}
                                  fill={`${el?.RATING >= 1 ? "orange" : "transparent"
                                    }`}
                                  color="orange"
                                />
                                <Star
                                  size={12}
                                  fill={`${el?.RATING >= 2 ? "orange" : "transparent"
                                    }`}
                                  color="orange"
                                />
                                <Star
                                  size={12}
                                  fill={`${el?.RATING >= 3 ? "orange" : "transparent"
                                    }`}
                                  color="orange"
                                />
                                <Star
                                  size={12}
                                  fill={`${el?.RATING >= 4 ? "orange" : "transparent"
                                    }`}
                                  color="orange"
                                />
                                <Star
                                  size={12}
                                  fill={`${el?.RATING >= 5 ? "orange" : "transparent"
                                    }`}
                                  color="orange"
                                />
                              </div>
                            </div>
                          </div>
                          <p className="opacity-70">{el?.MENSAGEM}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <h1 className="opacity-50">Nenhuma avaliação</h1>
                  </div>
                )}

                {/* {perguntasData?.length >= 5 && (
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
                )} */}
              </div>
            </div>
          </div>
        </>
      )}
      <ModalBuyProduct isOpen={openModalBuy} onOpenChange={handleOpenModalBuy} valorProduto={valorProduto} variation={variantSelected}/>
    </div>
  );
};

export default ProductPage;

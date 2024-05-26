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
  Input,
  Textarea,
  Checkbox,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import { Heart, Star } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const UserDetails = ({ onOpen, currentUrl }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)

  const [userData, setUserData] = useState({})
  const [avaliacoes, setAvaliacoes] = useState([])
  const [produtos, setProdutos] = useState([])

  const [todosOsProdutos, setTodosOsProdutos] = useState([])
  const [produtosSelecionados, setProdutosSelecionados] = useState([])
  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState([])
  const [modalInput, setModalInput] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fileInputRef = useRef(null);
  const fileInputRefWallpaper = useRef(null);

  const handleDivClick = () => {
    if (loggedID === router?.query?.id) {
      fileInputRef.current.click();
    }
  };

  function cleanJSONString(str) {
    return str
      .replace(/\\n/g, "\\n")
      .replace(/\\'/g, "\\'")
      .replace(/\\"/g, '\\"')
      .replace(/\\&/g, "\\&")
      .replace(/\\r/g, "\\r")
      .replace(/\\t/g, "\\t")
      .replace(/\\b/g, "\\b")
      .replace(/\\f/g, "\\f")
      .replace(/[\u0000-\u0019]+/g, "");
  }

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
              UPDATE T_USUARIOS 
              SET PHOTO_URL = "${response.data.secure_url}"
              WHERE ID = "${router?.query?.id}"
          `,
      });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer upload para o Cloudinary:', error);
    }
  };

  const handleDivClickWallpaper = () => {
    if (loggedID === router?.query?.id) {
      fileInputRefWallpaper.current.click();
    }
  };

  const handleFileUploadWallpaper = async (event) => {
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
              UPDATE T_USUARIOS 
              SET PHOTO_WALLPAPER = "${response.data.secure_url}"
              WHERE ID = "${router?.query?.id}"
          `,
      });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer upload para o Cloudinary:', error);
    }
  };

  const getProductList = async () => {
    const resUserData = await axios.post("/api/query", {
      query: `
          SELECT TP.*, 0 AS AFILIADO
          FROM T_PRODUTOS TP
          WHERE TP.FK_USUARIO = "${router?.query?.id}"

          UNION

          SELECT TP.*, 1 AS AFILIADO
          FROM T_PRODUTOS TP
          INNER JOIN T_AFILIADOS TA ON TP.id = TA.FK_PRODUTO
          WHERE TA.FK_USUARIO = "${router?.query?.id}";
      `,
    });

    if (resUserData?.data?.results?.length > 0) {
      setTodosOsProdutos(resUserData?.data?.results);
    }
  }

  const getCategoriasPersonalizadas = async () => {
    const resUserData = await axios.post("/api/query", {
      query: `
          SELECT * FROM T_CATEGORIAS_PERSONALIZADAS TCP
          WHERE TCP.FK_USUARIO = "${router?.query?.id}";
      `,
    });

    if (resUserData?.data?.results?.length > 0) {
      setCategoriasPersonalizadas(resUserData?.data?.results);
    }
  }

  const handleCreateCategory = async () => {

    await axios.post("/api/query", {
      query: `
          INSERT INTO T_CATEGORIAS_PERSONALIZADAS (FK_USUARIO, NOME, PRODUTOS) VALUES ("${router?.query?.id}", "${modalInput}", "${cleanJSONString(JSON.stringify(produtosSelecionados).replace(/"/g, '\\"'))}")
      `,
    });

  }

  const getUserData = async () => {
    const resUserData = await axios.post("/api/query", {
      query: `
          SELECT TU.nickname, TU.created_at, TU.PHOTO_URL, TU.PHOTO_WALLPAPER FROM T_USUARIOS TU WHERE TU.ID = "${router?.query?.id}"
      `,
    });

    if (resUserData?.data?.results?.length > 0) {
      setUserData(resUserData?.data?.results?.[0]);
    }
  };

  const getAvaliacoes = async () => {
    const res = await axios.post("/api/query", {
      query: `
        SELECT 
            TA.*, 
            TP.TITULO,
            (SELECT TUS.NICKNAME FROM T_USUARIOS TUS WHERE TA.FK_USUARIO = TUS.id) AS NICKNAME_COMPRADOR
            FROM T_AVALIACOES TA INNER JOIN T_PRODUTOS TP ON TP.id = TA.FK_PRODUTO INNER JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO WHERE TU.ID = "${router?.query?.id}"
      `,
    });
    setAvaliacoes(res?.data?.results);
  };

  const getProdutos = async () => {
    const res = await axios.post("/api/query", {
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
        (
          SELECT TVP.VALOR 
          FROM T_VARIACOES_PRODUTO TVP 
          WHERE TVP.FK_PRODUTO = TP.id AND TVP.ACTIVE = 1
          ORDER BY TVP.created_at DESC 
          LIMIT 1
        ) AS PRECO,
        TP.PRECO_A_RECEBER,
        TP.AFILIADOS,
        TPA.NOME AS TIPO_ANUNCIO, 
        TU.NICKNAME, 
        TU.created_at as MEMBRO_DESDE,
        TC.NOME AS CATEGORIA,
        TP.FK_STATUS,
        TP.SLUG,
        (SELECT COUNT(*) FROM T_VENDAS TV WHERE TV.FK_PRODUTO = TP.id AND TV.FK_STATUS = 2) AS QTD_VENDAS,
        (SELECT COUNT(*) FROM T_AVALIACOES TA INNER JOIN T_PRODUTOS TPA ON TPA.id = TA.FK_PRODUTO INNER JOIN T_USUARIOS TUA ON TUA.id = TPA.FK_USUARIO WHERE TUA.id = TU.id) AS QTD_AVALIACOES,
        (SELECT AVG(TA.RATING) FROM T_AVALIACOES TA INNER JOIN T_PRODUTOS TPA ON TPA.id = TA.FK_PRODUTO INNER JOIN T_USUARIOS TUA ON TUA.id = TPA.FK_USUARIO WHERE TUA.id = TU.id) AS MEDIA_AVALIACAO
        FROM 
            T_PRODUTOS TP 
            INNER JOIN T_CATEGORIAS TC ON TC.id = TP.FK_CATEGORIA
            INNER JOIN T_TIPOS_DE_ANUNCIO TPA ON TPA.id = TP.FK_TIPO_DE_ANUNCIO
            INNER JOIN T_USUARIOS TU ON TP.FK_USUARIO = TU.id
        WHERE TU.ID = "${router?.query?.id}" AND TP.FK_STATUS = 2
        `,
    });
    setProdutos(res?.data?.results);
  };

  useEffect(() => {
    if (!!router?.query?.id) {
      getUserData()
      getProductList()
      getCategoriasPersonalizadas()
    }

    getAvaliacoes()
    getProdutos()
  }, [router?.query?.id])

  const defaultImageUrl = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/271deea8-e28c-41a3-aaf5-2913f5f48be6/de7834s-6515bd40-8b2c-4dc6-a843-5ac1a95a8b55.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzI3MWRlZWE4LWUyOGMtNDFhMy1hYWY1LTI5MTNmNWY0OGJlNlwvZGU3ODM0cy02NTE1YmQ0MC04YjJjLTRkYzYtYTg0My01YWMxYTk1YThiNTUuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.BopkDn1ptIwbmcKHdAOlYHyAOOACXW0Zfgbs0-6BY-E';

  const handleCheckboxChange = (product) => {
    setProdutosSelecionados((prevSelected) => {
      if (prevSelected.find((p) => p.id === product.id)) {
        return prevSelected.filter((p) => p.id !== product.id);
      } else {
        return [...prevSelected, product];
      }
    });
  };

  const isProductSelected = (product) => {
    return produtosSelecionados.some((p) => p.id === product.id);
  };
  
  
  return (
    <div
      className={`w-[100%] lg:w-[70%] ${isLoading && "h-[90vh]"
        } flex flex-col items-center justify-between p-4 lg:py-12 lg:px-0 gap-12 mt-32`}
    >
      <div className="w-full min-h-[50vh] flex flex-col lg:flex-row items-start justify-center gap-4">
        <div className="w-[100%] lg:w-[30%] h-full flex flex-col items-center justify-center gap-4 border rounded-lg p-4 relative">
          <div
            style={{
              backgroundImage: `url(${userData?.PHOTO_WALLPAPER || ''})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={handleDivClickWallpaper} className={`${loggedID == router?.query?.id && 'hover:opacity-50 cursor-pointer'} absolute w-full h-[40%] top-0 z-20 bg-purple-400`}></div>
          <div className="absolute w-full h-[40%] bg-black top-0 z-10"></div>
          <input
            ref={fileInputRefWallpaper}
            type="file"
            style={{ display: 'none' }}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileUploadWallpaper}
          />
          <div
            onClick={handleDivClick}
            className={`${loggedID == router?.query?.id && 'hover:opacity-50 cursor-pointer'} w-40 h-40 rounded-full z-40 absolute top-[100px]`}
            style={{
              backgroundImage: `url(${userData?.PHOTO_URL || defaultImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <div
            className={`bg-black w-40 h-40 rounded-full z-30 absolute top-[100px]`}
          ></div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileUpload}
          />
          <h1 className="text-xl font-bold text-primary mt-[270px]">{userData?.nickname}</h1>
          <Divider />
          <h1 className="text-xl font-bold">Detalhes</h1>
          <h1>Desde: {moment(userData?.created_at).format("DD/MM/YYYY")}</h1>
          <h1>Número de avaliações: {avaliacoes.length}</h1>
          <h1>Produtos ativos: {produtos.length}</h1>
        </div>
        <div className="w-[100%] lg:w-[70%] flex flex-col gap-4">
          <div className="w-full p-4 flex flex-col gap-4 border rounded-lg">
            <h1 className="font-bold text-xl">Últimas avaliações recebidas</h1>
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 w-full`}>
              {avaliacoes?.map((el) => (
                <div className="w-full h-full border rounded-lg p-4 flex flex-col gap-2">
                  <h1 className="opacity-70">"{el?.MENSAGEM}"</h1>
                  <h1 className="text-primary font-bold">{el?.TITULO}</h1>
                  <div>
                    <h1>{moment(el?.created_at).format("DD/MM/YYYY")}</h1>
                    <h1>Por <span className="text-primary font-bold">{el?.NICKNAME_COMPRADOR}</span></h1>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {categoriasPersonalizadas?.map((el) => (
            <div className="w-full p-4 flex flex-col gap-4 border rounded-lg">
              <div className="flex w-full justify-between items-center">
              <h1 className="font-bold text-xl">{el?.NOME}</h1>
              {el?.FK_USUARIO === loggedID && (
                <Button onClick={async () => {
                  await axios.post("/api/query", {
                    query: `
                      DELETE FROM T_CATEGORIAS_PERSONALIZADAS WHERE ID = "${el?.id}";
                    `,
                  });
                  window.location.reload()
                }} size="sm" className="font-bold">X</Button>
              )}
              
              </div>
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 w-full`}>
              {JSON?.parse(cleanJSONString(el?.PRODUTOS)).map((el) => (
            
                  <div
                    onClick={() => {
                      if(el?.AFILIADO == 1){
                        router.push(`/product/${el?.id}?code=${router?.query?.id}`)  
                      } else {
                        router.push(`/product/${el?.id}`)
                      }
                    }}
                    className="flex flex-col items-center justify-start gap-2 w-full cursor-pointer border-2 rounded-lg hover:shadow-2xl transition-all duration-75 hover:shadow-purple-300"
                  >
                    <div
                      style={{ backgroundImage: `url("${el?.IMAGEM_1}")` }}
                      className={`w-full h-52 rounded-t-lg bg-cover bg-center`}
                    ></div>
                    <div className="w-full flex flex-col justify-between h-full">
                      <div className="flex flex-col items-center justify-center px-6">
                        <p className="font-bold mt-4 text-center text-sm">
                          {el?.TITULO}
                        </p>
                        <p className="text-sm">{el?.NICKNAME}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <Button
                          onClick={() => {
                            router.push(`/product/${el?.SLUG}`);
                          }}
                          className="my-4"
                          variant="bordered"
                          color="primary"
                        >
                          {formatCurrency(el?.PRECO)}
                        </Button>
                      </div>
                    </div>
                  </div>
                
              ))}
              {/* {avaliacoes?.map((el) => (
                <div className="w-full h-full border rounded-lg p-4 flex flex-col gap-2">
                  <h1 className="opacity-70">"{el?.MENSAGEM}"</h1>
                  <h1 className="text-primary font-bold">{el?.TITULO}</h1>
                  <div>
                    <h1>{moment(el?.created_at).format("DD/MM/YYYY")}</h1>
                    <h1>Por <span className="text-primary font-bold">{el?.NICKNAME_COMPRADOR}</span></h1>
                  </div>
                </div>
              ))} */}

            </div>
          </div>
          ))}

          

          {router?.query?.id == loggedID && (
            <div className="w-full p-4 flex flex-col gap-4">
              <Button onClick={() => setShowModal(true)}>Adicionar categoria</Button>
            </div>
          )}

          <Modal
            size="xl"
            isOpen={showModal}
            onOpenChange={() =>
              setShowModal(false)
            }
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Criar categoria
                  </ModalHeader>
                  <ModalBody>
                    <div className="flex flex-col items-center justify-center gap-6 w-full">
                      <Input
                        value={modalInput}
                        onChange={(e) => {
                          setModalInput(e.target.value);
                        }}
                        label={"Titulo da categoria"}
                        labelPlacement="outside"
                        placeholder="Escreva aqui"
                        variant="bordered"
                      />
                      <div className="h-[100px] w-full overflow-auto">
                        {todosOsProdutos?.map((el) => (
                          <div className="flex items-center justify-center gap-2 overflow-hidden">
                            <Checkbox
                          
                              checked={isProductSelected(el)}
                              onChange={() => handleCheckboxChange(el)}
                  
                            />
                            <h1>{el?.TITULO}</h1>
                          </div>
                        ))}

                      </div>
                    </div>
                  </ModalBody>
                  <Divider className="mt-8" />
                  <ModalFooter>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-4 mb-2">
                        <Button
                          //isLoading={isLoadingAvalicao}
                          onPress={async () => {
                            await handleCreateCategory();
                            window.location.reload();
                            onClose();
                          }}
                          variant="bordered"
                          className="border-purple-600"
                        >
                          Criar categoria
                        </Button>
                      </div>
                    </div>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>


          {/* <div className="w-full p-4 flex flex-col gap-4 border rounded-lg">
            <h1 className="font-bold text-xl">Anúncios ativos de {userData?.nickname}</h1>
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 w-full`}>
              {produtos?.map((el) => (
                <div
                  onClick={() => {
                    router.push(`/product/${el?.ID_PRODUTO}`);
                  }}
                  className="flex flex-col items-center justify-start gap-2 w-full cursor-pointer border-2 rounded-lg hover:shadow-2xl transition-all duration-75 hover:shadow-purple-300"
                >
                  <div
                    style={{ backgroundImage: `url("${el?.IMAGEM_1}")` }}
                    className={`w-full h-52 rounded-t-lg bg-cover bg-center`}
                  ></div>
                  <div className="w-full flex flex-col justify-between h-full">
                    <div className="flex flex-col items-center justify-center px-6">
                      <p className="font-bold mt-4 text-center text-sm">
                        {el?.TITULO}
                      </p>
                      <p className="text-sm">{el?.NICKNAME}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <Button
                        onClick={() => {
                          router.push(`/product/${el?.SLUG}`);
                        }}
                        className="my-4"
                        variant="bordered"
                        color="primary"
                      >
                        {formatCurrency(el?.PRECO)}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}



            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;

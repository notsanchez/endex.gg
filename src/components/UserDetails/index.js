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
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const UserDetails = ({ onOpen, currentUrl }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)

  const [userData, setUserData] = useState({})
  const [avaliacoes, setAvaliacoes] = useState([])
  const [produtos, setProdutos] = useState([])

  const fileInputRef = useRef(null);

  const handleDivClick = () => {
    if (loggedName === currentUrl) {
      fileInputRef.current.click();
    }
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
              UPDATE T_USUARIOS 
              SET PHOTO_URL = "${response.data.secure_url}"
              WHERE NICKNAME = "${currentUrl}"
          `,
      });

      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer upload para o Cloudinary:', error);
    }
  };


  const getUserData = async () => {
    const resUserData = await axios.post("/api/query", {
      query: `
          SELECT TU.nickname, TU.created_at, TU.PHOTO_URL FROM T_USUARIOS TU WHERE TU.NICKNAME = "${currentUrl}"
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
            FROM T_AVALIACOES TA INNER JOIN T_PRODUTOS TP ON TP.id = TA.FK_PRODUTO INNER JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO WHERE TU.NICKNAME = "${currentUrl}"
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
        WHERE TU.NICKNAME = "${currentUrl}" AND TP.FK_STATUS = 2
        `,
    });
    setProdutos(res?.data?.results);
  };

  useEffect(() => {
    if (!!currentUrl) {
      getUserData()
    }

    getAvaliacoes()
    getProdutos()
  }, [currentUrl])

  const defaultImageUrl = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/271deea8-e28c-41a3-aaf5-2913f5f48be6/de7834s-6515bd40-8b2c-4dc6-a843-5ac1a95a8b55.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzI3MWRlZWE4LWUyOGMtNDFhMy1hYWY1LTI5MTNmNWY0OGJlNlwvZGU3ODM0cy02NTE1YmQ0MC04YjJjLTRkYzYtYTg0My01YWMxYTk1YThiNTUuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.BopkDn1ptIwbmcKHdAOlYHyAOOACXW0Zfgbs0-6BY-E';

  return (
    <div
      className={`w-[100%] lg:w-[70%] ${isLoading && "h-[90vh]"
        } flex flex-col items-center justify-between p-4 lg:py-12 lg:px-0 gap-12 mt-32`}
    >
      <div className="w-full min-h-[50vh] flex flex-col lg:flex-row items-start justify-center gap-4">
        <div className="w-[100%] lg:w-[30%] h-full flex flex-col items-center justify-center gap-4 border rounded-lg p-4 relative">
          <div className="absolute w-full h-[30%] bg-purple-300 top-0 z-20"></div>
          <div className="absolute w-full h-[30%] bg-black top-0 z-10"></div>
          <div
            onClick={handleDivClick}
            className={`${loggedName == currentUrl && 'hover:opacity-50 cursor-pointer'} w-40 h-40 rounded-full z-40 absolute top-5`}
            style={{
              backgroundImage: `url(${userData?.PHOTO_URL || defaultImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <div
            onClick={handleDivClick}
            className={`bg-black w-40 h-40 rounded-full z-30 absolute top-5`}
          ></div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept=".png"
            onChange={handleFileUpload}
          />
          <h1 className="text-xl font-bold text-primary mt-[180px]">{userData?.nickname}</h1>
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

          <div className="w-full p-4 flex flex-col gap-4 border rounded-lg">
            <h1 className="font-bold text-xl">Anúncios ativos de {userData?.nickname}</h1>
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-4 w-full`}>
              {produtos?.map((el) => (
                <div
                  onClick={() => {
                    router.push(`https://www.endexgg.com/product/${el?.ID_PRODUTO}`);
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
                          router.push(`https://www.endexgg.com/product/${el?.id}`);
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;

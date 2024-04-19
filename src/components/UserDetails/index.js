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

const UserDetails = ({ onOpen }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)

  const [userData, setUserData] = useState({})
  const [avaliacoes, setAvaliacoes] = useState([])
  const [produtos, setProdutos] = useState([])

  const getUserData = async () => {
    const resUserData = await axios.post("/api/query", {
      query: `
          SELECT TU.nickname, TU.created_at FROM T_USUARIOS TU WHERE TU.id = "${router?.query?.id}"
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
            FROM T_AVALIACOES TA INNER JOIN T_PRODUTOS TP ON TP.id = TA.FK_PRODUTO INNER JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO WHERE TU.id = "${router?.query?.id}"
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
        WHERE TU.id = "${router?.query?.id}" AND TP.FK_STATUS = 2
        `,
    });
    setProdutos(res?.data?.results);
  };
  
  useEffect(() => {
    if(!!router?.query?.id){
        getUserData()
    }

    getAvaliacoes()
    getProdutos()
  },[router?.query?.id])

  return (
    <div
      className={`w-[100%] lg:w-[70%] ${isLoading && "h-[90vh]"
        } flex flex-col items-center justify-between p-4 lg:py-12 lg:px-0 gap-12 mt-32`}
    >
      <div className="w-full min-h-[50vh] flex flex-col lg:flex-row items-start justify-center gap-4">
        <div className="w-[100%] lg:w-[30%] h-full flex flex-col items-center justify-center gap-4 border rounded-lg p-4">
            <h1 className="text-xl font-bold text-primary">{userData?.nickname}</h1>
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
                                router.push(`/product/${el?.id}`);
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

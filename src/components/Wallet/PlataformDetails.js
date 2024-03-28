import { loggedID } from "@/utils/useAuth";
import { Button, Card, Spinner } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

const PlatformDetails = () => {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getUserData = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
        SELECT
		COALESCE(COUNT(TP.id), 0) AS PRODUTOS_CADASTRADOS,
            COALESCE(COUNT(TV.id), 0) AS TOTAL_DE_VENDAS,
            COALESCE(SUM(TP.PRECO), 0) AS VALOR_BRUTO_VENDIDO,
            COALESCE(SUM(TP.PRECO_A_RECEBER), 0) AS VALOR_LIQUIDO_DOS_USUARIOS,
            (COALESCE(SUM(TP.PRECO), 0) - COALESCE(SUM(TP.PRECO_A_RECEBER), 0)) AS VALOR_LUCRO
        FROM
            T_VENDAS TV
        INNER JOIN
            T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO
        WHERE
            TV.FK_STATUS = 2
        `,
      })
      .then((res) => {
        setUserData(res?.data?.results?.[0]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <>
      <div className="flex flex-col w-full gap-6">

      <div className="w-full h-full flex flex-col lg:flex-row items-start justify-center gap-6">
          <div className="w-full flex flex-col gap-4">
            <Card className="w-full h-full flex items-start justify-center p-8 gap-2 rounded-lg">
              <h1 className="font-bold text-xl text-purple-600">Lucro sobre as vendas (Disponivel para retirada)</h1>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <h1 className="text-xl">R$ {userData?.VALOR_LUCRO}</h1>
              )}
            </Card>
          </div>
        </div>

        <div className="w-full h-full flex flex-col lg:flex-row items-start justify-center gap-6">
          <div className="w-full flex flex-col gap-4">
            <Card className="w-full flex items-start justify-center p-8 gap-2 rounded-lg">
              <h1 className="font-bold text-xl text-purple-600">
                Produtos cadastrados
              </h1>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <h1 className="text-xl">{userData?.PRODUTOS_CADASTRADOS}</h1>
              )}
            </Card>
          </div>
          <Card className="w-full h-full flex-grow flex items-start justify-center p-8 gap-2 rounded-lg">
            <h1 className="font-bold text-xl text-purple-600">Vendas realizadas</h1>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <h1 className="text-xl">{userData?.TOTAL_DE_VENDAS}</h1>
            )}
          </Card>
        </div>

        <div className="w-full h-full flex flex-col lg:flex-row items-start justify-center gap-6">
          <div className="w-full flex flex-col gap-4">
            <Card className="w-full h-full flex items-start justify-center p-8 gap-2 rounded-lg">
              <h1 className="font-bold text-xl text-purple-600">Valor bruto das vendas</h1>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <h1 className="text-xl">R$ {userData?.VALOR_BRUTO_VENDIDO}</h1>
              )}
            </Card>
          </div>
          <Card className="w-full h-full flex items-start justify-center p-8 gap-2 rounded-lg">
            <h1 className="font-bold text-xl text-purple-600">Valor liquido para clientes</h1>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <h1 className="text-xl">
                R$ {userData?.VALOR_LIQUIDO_DOS_USUARIOS}
              </h1>
            )}
          </Card>
        </div>

        
      </div>
    </>
  );
};

export default PlatformDetails;

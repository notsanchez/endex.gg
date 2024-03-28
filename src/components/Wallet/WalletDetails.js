import { loggedID } from "@/utils/useAuth";
import { Button, Card, Spinner } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

const WalletDetails = () => {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getUserData = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
        SELECT
            COALESCE(SUM(TP.PRECO_A_RECEBER), 0) AS SALDO,
            (COALESCE(SUM(CASE
                            WHEN TIMESTAMPDIFF(HOUR, TV.created_at, NOW()) >= 120 THEN TP.PRECO_A_RECEBER
                            ELSE 0
                        END), 0) - COALESCE((SELECT SUM(VALOR) FROM T_SAQUES WHERE FK_USUARIO = "${loggedID}"), 0)) AS SALDO_DISPONIVEL
        FROM
            T_VENDAS TV
        INNER JOIN
            T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO
        WHERE
            TP.FK_USUARIO = "${loggedID}"
            AND TV.FK_STATUS = 2;

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
      <div className="flex flex-col w-full ">
        <div className="w-full h-full flex flex-col lg:flex-row items-start justify-center gap-6">
          <div className="w-full flex flex-col gap-4">
            <Card className="w-full h-full flex items-start justify-center p-8 gap-2">
              <h1 className="font-bold text-2xl">
                Saldo disponivel para saque
              </h1>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <h1 className="text-xl">R$ {userData?.SALDO_DISPONIVEL}</h1>
              )}
            </Card>
            <Button color="primary" className="text-white font-bold">
              Solicitar saque
            </Button>
          </div>
          <div className="w-full flex flex-col gap-4">
          <Card className="w-full h-full flex items-start justify-center p-8 gap-2">
            <h1 className="font-bold text-2xl">Saldo</h1>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <h1 className="text-xl">R$ {userData?.SALDO}</h1>
            )}
          </Card>
          <Button className="text-purple-600 bg-transparent border-2 border-purple-600 font-bold">
              Como funciona o saldo na ENDEX?
            </Button>
            </div>
        </div>
      </div>
    </>
  );
};

export default WalletDetails;

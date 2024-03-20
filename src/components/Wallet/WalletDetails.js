import { loggedID } from "@/utils/useAuth";
import { Button, Card, Spinner } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

const WalletDetails = () => {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false)

  const getUserData = async () => {
    setIsLoading(true)
    await axios
      .post("/api/query", {
        query: `SELECT SALDO, SALDO_DISPONIVEL FROM T_USUARIOS WHERE ID = "${loggedID}"`,
      })
      .then((res) => {
        setUserData(res?.data?.results?.[0]);
        setIsLoading(false)
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
          <Card className="w-full h-full flex items-start justify-center p-8 gap-2">
            <h1 className="font-bold text-2xl">Saldo</h1>
            {isLoading ? (
                <Spinner size="sm"/>
              ) : (
                <h1 className="text-xl">R$ {userData?.SALDO}</h1>
              )}
            
          </Card>
        </div>
      </div>
    </>
  );
};

export default WalletDetails;

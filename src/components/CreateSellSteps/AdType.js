import {
  Button,
  Checkbox,
  Divider,
  Spinner,
} from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
const AdType = ({
  sellForm,
  setSellForm,
  isLoading,
  handleSubmit,
  stepAdTypeFormSubmit,
  step,
  setStep
}) => {
  const [adTypes, setAdTypes] = useState([]);

  const getAdTypes = async () => {
    await axios
      .post("/api/query", {
        query: "SELECT * FROM T_TIPOS_DE_ANUNCIO",
      })
      .then((res) => {
        setAdTypes(res?.data?.results);
      });
  };

  useEffect(() => {
    getAdTypes();
  }, []);

  console.log(sellForm)

  return (
    <div className="w-[80%] flex flex-col gap-12 items-center justify-center">
      <h1>Escolha o tipo do seu anúncio</h1>

      <Divider />

      <div className="w-full flex flex-col lg:flex-row gap-4">
        {adTypes?.length > 0 ? (
          adTypes?.map((el) => (
            <div
              key={el?.id}
              onClick={() => {
                setSellForm((prevState) => ({
                  ...prevState,
                  ad_type_id: el?.id,
                  ad_type_name: el?.NOME,
                  ad_type_tax: el?.TAXA
                }));
              }}
              className={`
                h-32 w-full 
                ${el?.NOME === "Ouro" && "bg-orange-500"} 
                ${el?.NOME === "Platina" && "bg-cyan-500"} 
                ${el?.NOME === "Diamante" && "bg-indigo-500"} 
                rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-75 ${
                  sellForm?.ad_type_id === el?.id ? "opacity-100 border-2 border-black" : "opacity-70"
                } `}
            >
              <h1 className="text-xl font-bold text-white">
                {el?.NOME}
                {" "}
                {el?.NOME === "Ouro" && "⭐"}
                {el?.NOME === "Platina" && "🚀"}
                {el?.NOME === "Diamante" && "🏆"}
              </h1>
              <h1 className="text-sm font-bold text-white">
                Taxa: {el?.TAXA}%
              </h1>
            </div>
          ))
        ) : (
          <div className="w-full flex items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <Checkbox defaultSelected={sellForm?.affiliate} onChange={(e) => {
          setSellForm((prevState) => ({
            ...prevState,
            affiliate: e.target.checked,
          }));
        }} />
        <h1>Permitir afiliações? (25%)</h1>
      </div>

      <h1>Quanto maior o nível, mais visibilidade seu anúncio tem!</h1>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-2 w-full">
      <Button
          onClick={() => {
            setStep((prevState) => prevState - 1);
          }}
          variant="bordered"
          className="font-bold rounded-full w-full"
        >
          Voltar
        </Button>
        <Button
          isDisabled={!stepAdTypeFormSubmit}
          isLoading={isLoading}
          onClick={() => {
            handleSubmit();
          }}
          color="primary"
          className="text-white font-bold rounded-full w-full"
        >
          Ir para resumo
        </Button>
      </div>
    </div>
  );
};

export default AdType;

import { loggedID } from "@/utils/useAuth";
import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Details from "./CreateSellSteps/Details";
import AdType from "./CreateSellSteps/AdType";
import Summary from "./CreateSellSteps/Summary";

const CreateSellForm = () => {
  const [sellForm, setSellForm] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(1);

  const stepOneFormSubmit = !!sellForm?.title && !!sellForm?.description && !!sellForm?.quantity && !!sellForm?.price && !!sellForm?.categorie_id

  const handleSubmit = async () => {
    if (stepOneFormSubmit) {
      setIsLoading(true);
      if (step === 1) {
        setTimeout(() => {
          setStep((prevState) => prevState + 1);
          setIsLoading(false);
        },800)
      } else if (step === 2){
        setTimeout(() => {
          setStep((prevState) => prevState + 1);
          setIsLoading(false);
        },800)
      } else {
        await axios
          .post("/api/query", {
            query: `
            INSERT INTO T_PRODUTOS (FK_USUARIO, TITULO, DESCRICAO, QTD_DISPONIVEL, PRECO, FK_CATEGORIA, FK_TIPO_DE_ANUNCIO, PRECO_A_RECEBER) 
            VALUES 
          ("${loggedID}", "${sellForm?.title}", "${sellForm?.description}", "${sellForm?.quantity}", "${sellForm?.price}", "${sellForm?.categorie_id}", "${sellForm?.ad_type_id}", "${Number(sellForm?.price) - ((Number(sellForm?.ad_type_tax) / 100) * Number(sellForm?.price))}")
        `,
          })
          .then((res) => {
            if (res?.data?.results?.length > 0) {
              toast.success("Anuncio criado com sucesso!");
            }
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
    } else {
      toast.error("Preencha todos os campos!");
    }
  };

  return (
    <div className="w-[100%] lg:w-[60%] flex items-center justify-center py-12 mb-24 mt-12 border-1 rounded-lg">
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        <h1 className="text-4xl font-bold text-center">Criar novo anuncio</h1>
        {step === 1 && (
          <Details
            sellForm={sellForm}
            setSellForm={setSellForm}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            stepOneFormSubmit={stepOneFormSubmit}
          />
        )}
        {step === 2 && (
          <AdType
            sellForm={sellForm}
            setSellForm={setSellForm}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            stepOneFormSubmit={stepOneFormSubmit}
            step={step}
            setStep={setStep}
          />
        )}
        {step === 3 && (
          <Summary
            sellForm={sellForm}
            setSellForm={setSellForm}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            stepOneFormSubmit={stepOneFormSubmit}
            step={step}
            setStep={setStep}
          />
        )}
      </div>
    </div>
  );
};

export default CreateSellForm;

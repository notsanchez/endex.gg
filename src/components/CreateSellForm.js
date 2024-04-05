import { loggedID } from "@/utils/useAuth";
import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Details from "./CreateSellSteps/Details";
import AdType from "./CreateSellSteps/AdType";
import Summary from "./CreateSellSteps/Summary";
import { useRouter } from "next/router";

const CreateSellForm = () => {
  const router = useRouter();
  const [sellForm, setSellForm] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(1);

  const stepOneFormSubmit =
    !!sellForm?.title &&
    !!sellForm?.description &&
    !!sellForm?.quantity &&
    !!sellForm?.price &&
    !!sellForm?.categorie_id &&
    sellForm?.images?.length >= 1;
  const stepAdTypeFormSubmit = !!sellForm?.ad_type_id;

  const uploadImages = async () => {
    let imageUrls = [];

    await Promise.all(
      sellForm?.images?.map(async (el) => {
        const formData = new FormData();
        formData.append("file", el);
        formData.append("upload_preset", "oyw4tthu");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/sanchez1321/image/upload",
          formData
        );

        imageUrls.push(response.data.secure_url);
      })
    );

    return imageUrls;
  };

  console.log(sellForm)

  const handleSubmit = async () => {
    if (stepOneFormSubmit) {
      setIsLoading(true);
      if (step === 1) {
        setTimeout(() => {
          setStep((prevState) => prevState + 1);
          setIsLoading(false);
        }, 800);
      } else if (step === 2) {
        setTimeout(() => {
          setStep((prevState) => prevState + 1);
          setIsLoading(false);
        }, 800);
      } else {
        try {
          const imageUrls = await uploadImages();

          const res = await axios.post("/api/query", {
            query: `
            INSERT INTO T_PRODUTOS (FK_USUARIO, TITULO, DESCRICAO, QTD_DISPONIVEL, PRECO, FK_CATEGORIA, FK_TIPO_DE_ANUNCIO, PRECO_A_RECEBER, FK_STATUS, IMAGEM_1, IMAGEM_2, IMAGEM_3, AFILIADOS, PRIMEIRA_MENSAGEM) 
            VALUES 
          ("${loggedID}", "${sellForm?.title}", "${sellForm?.description}", "${
              sellForm?.quantity
            }", "${parseFloat(
              String(sellForm?.price).replace("R$", "").replace(",", ".")
            ).toFixed(2)}", "${sellForm?.categorie_id}", "${
              sellForm?.ad_type_id
            }", "${
              parseFloat(
                String(sellForm?.price).replace("R$", "").replace(",", ".")
              ).toFixed(2) -
              (Number(sellForm?.ad_type_tax) / 100) * parseFloat(
                String(sellForm?.price).replace("R$", "").replace(",", ".")
              ).toFixed(2)
            }", "1", "${imageUrls[0] || ""}", "${imageUrls[1] || ""}", "${
              imageUrls[2] || ""
            }", "${!!sellForm?.affiliate ? "1" : "0"}", "${sellForm?.firstMessage}")
        `,
          });

          if (res?.data?.results?.length > 0) {
            toast.success("Anuncio criado com sucesso!");
            router.push("/wallet?page=my-products");
          }
        } catch {
          setIsLoading(false);
        }
      }
    } else {
      toast.error("Preencha todos os campos!");
    }
  };
  

  return (
    <div className="w-[100%] lg:w-[70%] flex items-center justify-center py-12 mb-24 border-1 rounded-lg mt-32">
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
            stepAdTypeFormSubmit={stepAdTypeFormSubmit}
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

import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Divider,
  Input,
  Textarea,
} from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
const Summary = ({
  sellForm,
  setSellForm,
  isLoading,
  handleSubmit,
  stepOneFormSubmit,
  step,
  setStep
}) => {

  console.log(sellForm);

  return (
    <div className="w-[80%] flex flex-col items-center justify-center gap-12">
      <h1>Resumo do seu anúncio</h1>

      <Divider />

      <div className="w-full flex items-center justify-between mt-12">
        <div className="flex flex-col gap-2 w-full">
          <h1>
            Titulo: <span className="font-bold">{sellForm?.title}</span>
          </h1>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <h1>
            Preço: <span className="font-bold">R$ {sellForm?.price}</span>
          </h1>
        </div>
      </div>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col gap-2 w-full">
          <h1>
            Quantidade: <span className="font-bold">{sellForm?.quantity}</span>
          </h1>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <h1>
            Categoria:{" "}
            <span className="font-bold">{sellForm?.categorie_name}</span>
          </h1>
        </div>
      </div>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col gap-2 w-full">
          <h1>
            Tipo de anuncio: <span className="font-bold">{sellForm?.ad_type_name} - Taxa de {sellForm?.ad_type_tax}%</span>
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <h1>
          Descrição: <span className="font-bold">{sellForm?.description}</span>
        </h1>
      </div>

      <div className="flex flex-col gap-2 w-full items-center justify-center">
        <h1>
          Quanto você vai receber: <span className="font-bold">R$ {Number(sellForm?.price) - ((Number(sellForm?.ad_type_tax) / 100) * Number(sellForm?.price))}</span>
        </h1>
      </div>

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
          isDisabled={!stepOneFormSubmit}
          isLoading={isLoading}
          onClick={() => {
            handleSubmit();
          }}
          color="primary"
          className="text-white font-bold rounded-full w-full"
        >
          Publicar anuncio
        </Button>
      </div>
    </div>
  );
};

export default Summary;

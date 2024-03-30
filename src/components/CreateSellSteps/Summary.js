import { formatCurrency } from "@/utils/formatCurrency";
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
  setStep,
}) => {
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
            Preço: <span className="font-bold">{sellForm?.price}</span>
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
            Tipo de anuncio:{" "}
            <span className="font-bold">
              {sellForm?.ad_type_name} - Taxa de {sellForm?.ad_type_tax}%
            </span>
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <h1>
          Descrição: <span className="font-bold">{sellForm?.description}</span>
        </h1>
      </div>
      <div className="flex flex-col gap-2 w-full items-center justify-center">
        <div className="flex flex-col gap-2 items-start justify-center">
          <h1>
            Quanto você vai receber:{" "}
            <span className="font-bold">
              {formatCurrency(
                parseFloat(
                  String(sellForm?.price).replace("R$", "").replace(",", ".")
                ).toFixed(2) -
                  (Number(sellForm?.ad_type_tax) / 100) *
                    parseFloat(
                      String(sellForm?.price)
                        .replace("R$", "")
                        .replace(",", ".")
                    ).toFixed(2)
              )}
            </span>
          </h1>
          {sellForm?.affiliate && (
            <h1>
              Quanto você vai receber por afiliado:{" "}
              <span className="font-bold">
                {formatCurrency(
                  (parseFloat(
                    String(sellForm?.price).replace("R$", "").replace(",", ".")
                  ).toFixed(2) -
                    (Number(sellForm?.ad_type_tax) / 100) *
                      parseFloat(
                        String(sellForm?.price)
                          .replace("R$", "")
                          .replace(",", ".")
                      ).toFixed(2)) *
                    0.75
                )}
              </span>
            </h1>
          )}
        </div>
        <Textarea onChange={(e) => {
          setSellForm((prevState) => ({
            ...prevState,
            firstMessage: e.target.value,
          }));
          
        }} value={sellForm?.firstMessage} label={"Mensagem de primeira venda"} labelPlacement="outside" variant="bordered" placeholder="Escreva aqui a mensagem que o comprador irá receber no momento em que a compra for aprovada" />
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

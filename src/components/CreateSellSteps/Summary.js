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
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
const Summary = ({
  sellForm,
  setSellForm,
  isLoading,
  handleSubmit,
  handleUpdate,
  stepOneFormSubmit,
  step,
  setStep,
}) => {

  const router = useRouter()

  const totalQuantity = sellForm?.variations?.reduce((acc, curr) => {
    const quantity = parseInt(curr.quantity);
    return acc + quantity;
  }, 0);

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
            Preço: <span className="font-bold">{sellForm?.variations[0]?.value}</span>
          </h1>
        </div>
      </div>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col gap-2 w-full">
          <h1>
            Quantidade: <span className="font-bold">{totalQuantity}</span>
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
          Descrição: <span className="font-bold">
            <pre style={{ fontFamily: 'inherit', margin: '0' }}>{sellForm?.description}</pre>
          </span>
        </h1>
      </div>
      <div className="flex flex-col gap-2 w-full items-center justify-center">
        <div className="flex flex-col gap-2 items-start justify-center">
          <h1>
            Quanto você vai receber:{" "}
            <span className="font-bold">
            {formatCurrency(
                parseFloat(
                  sellForm?.variations?.[0]?.value?.replace(/[^\d,]/g, '').replace(",", ".")
                ).toFixed(2) -
                (Number(sellForm?.ad_type_tax) / 100) *
                parseFloat(
                  sellForm?.variations?.[0]?.value?.replace(/[^\d,]/g, '').replace(",", ".")
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
                    sellForm?.price.replace(/[^\d,]/g, '').replace(",", ".")
                  ).toFixed(2) -
                    (Number(sellForm?.ad_type_tax) / 100) *
                    parseFloat(
                      sellForm?.price.replace(/[^\d,]/g, '').replace(",", ".")
                    ).toFixed(2)) *
                  0.75
                )}
              </span>
            </h1>
          )}
        </div>
        {sellForm?.messagesPerQuantity?.map((el, index) => (
          <div className="flex flex-col w-full mb-4">
            <h1>Mensagem automatica para o item: {index + 1}</h1>
            <Input
              key={index}
              placeholder="Escreva aqui a mensagem que o comprador irá receber no momento em que a compra for aprovada"
              value={sellForm.messagesPerQuantity[index]}
              onChange={(e) => {
                const newMessagesPerQuantity = [...sellForm.messagesPerQuantity];
                newMessagesPerQuantity[index] = e.target.value;
                setSellForm((prevState) => ({
                  ...prevState,
                  messagesPerQuantity: newMessagesPerQuantity,
                }));
              }}
            />
          </div>
        ))}
      </div>
      {sellForm?.variations?.map((el, variationIndex) => (
        <div className="flex flex-col gap-2 w-full">
          <h1>
            Variação {variationIndex + 1}: <span className="font-bold">
              <pre style={{ fontFamily: 'inherit', margin: '0' }}>{el?.name}</pre>
            </span>
          </h1>
          {el?.messagesPerItem?.map((el, messageIndex) => (
            <div className="mb-4">
              <h1>Mensagem automatica para o item: {messageIndex + 1}</h1>
              <Input
                placeholder="Digite aqui a mensagem personalizada para este item"
                value={el}
              onChange={(e) => {
                setSellForm(prevState => {
                  const updatedVariations = [...prevState.variations];
                  updatedVariations[variationIndex].messagesPerItem[messageIndex] = e.target.value;
                  return { ...prevState, variations: updatedVariations };
                });
              }}
              />
            </div>
          ))}
        </div>
      ))}


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
            if(!router?.query?.id){
              handleSubmit();
            } else {
              handleUpdate()
            }
            
          }}
          className="text-white font-bold rounded-full w-full bg-purple-600"
        >
          Publicar anuncio
        </Button>
      </div>
    </div>
  );
};

export default Summary;

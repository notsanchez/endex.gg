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
const Details = ({
  sellForm,
  setSellForm,
  isLoading,
  handleSubmit,
  stepOneFormSubmit,
}) => {
  const [categories, setCategories] = useState([]);

  const getCategories = async () => {
    await axios
      .post("/api/query", {
        query: "SELECT * FROM T_CATEGORIAS",
      })
      .then((res) => {
        var arr = [];

        res.data.results.map((el) => {
          arr.push({
            label: el?.NOME,
            value: el?.id,
          });
        });

        setCategories(arr);
      });
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="w-[80%] flex flex-col items-center justify-center gap-12">
      <h1>Escolha o tipo do seu anúncio</h1>

      <Divider />

      <div className="flex flex-col gap-2 w-full">
        <Input
          label={"Titulo do seu anuncio *"}
          variant="bordered"
          labelPlacement="outside"
          placeholder="Digite o titulo do seu anuncio"
          className="w-full"
          value={sellForm?.title}
          onChange={(e) => {
            setSellForm((prevState) => ({
              ...prevState,
              title: e.target.value,
            }));
          }}
        />
        <h1 className="text-sm opacity-50">
          Exemplos: Conta de League of Legends, Elo Boost Valorant, Conta NFA
          Valorant
        </h1>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Autocomplete
          variant="bordered"
          labelPlacement="outside"
          label="Selecione a categoria do seu anuncio *"
          placeholder="Selecione aqui"
          className="w-full"
          defaultItems={categories}
          defaultSelectedKey={3}
        >
          {(categorie) => (
            <AutocompleteItem
              onClick={() => {
                setSellForm((prevState) => ({
                  ...prevState,
                  categorie_id: categorie.value,
                  categorie_name: categorie.label
                }));
              }}
              key={categorie.value}
            >
              {categorie.label}
            </AutocompleteItem>
          )}
        </Autocomplete>
      </div>

      <div className="flex gap-12 w-full items-center justify-center">
        <div className="flex flex-col gap-2 w-full">
          <Input
            label={"Preço *"}
            variant="bordered"
            labelPlacement="outside"
            placeholder="Digite o preço do seu produto"
            className="w-full"
            value={sellForm?.price}
            onChange={(e) => {
              setSellForm((prevState) => ({
                ...prevState,
                price: e.target.value,
              }));
            }}
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Input
            label={"Quantidade *"}
            variant="bordered"
            labelPlacement="outside"
            placeholder="Digite a quantidade que deseja vender"
            className="w-full"
            type="number"
            value={sellForm?.quantity}
            onChange={(e) => {
              setSellForm((prevState) => ({
                ...prevState,
                quantity: e.target.value,
              }));
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Textarea
          label="Descrição do seu anuncio"
          variant="bordered"
          labelPlacement="outside"
          placeholder="Digite sua descrição, e tudo que o cliente precisa saber sobre seu produto"
          className="w-full"
          value={sellForm?.description}
          onChange={(e) => {
            setSellForm((prevState) => ({
              ...prevState,
              description: e.target.value,
            }));
          }}
        />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button
          isDisabled={!stepOneFormSubmit}
          isLoading={isLoading}
          onClick={() => {
            handleSubmit();
          }}
          color="primary"
          className="text-white font-bold rounded-full"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default Details;

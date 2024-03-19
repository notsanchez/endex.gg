import { loggedID } from "@/utils/useAuth";
import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const CreateSellForm = () => {
  const [categories, setCategories] = useState([]);
  const [sellForm, setSellForm] = useState({});
  const [isLoading, setIsLoading] = useState(false)

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

  const canCreate = !!sellForm?.title && !!sellForm?.description && !!sellForm?.quantity && !!sellForm?.price && !!sellForm?.categorie_id

  const handleCreateSell = async () => {
    if(canCreate){
      setIsLoading(true)
      await axios.post("/api/query", {
        query: `
          INSERT INTO T_PRODUTOS (FK_USUARIO, TITULO, DESCRICAO, QTD_DISPONIVEL, PRECO, FK_CATEGORIA) 
            VALUES 
          ("${loggedID}", "${sellForm?.title}", "${sellForm?.description}", "${sellForm?.quantity}", "${sellForm?.price}", "${sellForm?.categorie_id}")
        `
      }).then((res) => {
        if(res?.data?.results?.length > 0){
          toast.success("Anuncio criado com sucesso!")
        }
        setIsLoading(false)
      }).catch(() => {
        setIsLoading(false)
      })
    } else {
      toast.error("Preencha todos os campos!")
    }
    
  }

  useEffect(() => {
    getCategories();
  }, []);


  return (
    <div className="w-[100%] lg:w-[60%] flex items-center justify-center py-12 mb-6 border-1 rounded-lg">
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        <h1 className="text-4xl font-bold text-center">Criar novo anuncio</h1>
        <div className="w-[80%] flex flex-col gap-12">
          <div className="flex flex-col gap-2">
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
              Exemplos: Conta de League of Legends, Elo Boost Valorant, Conta
              NFA Valorant
            </h1>
          </div>
          <div className="flex flex-col gap-2">
            <Select
              items={categories}
              variant="bordered"
              labelPlacement="outside"
              label="Selecione a categoria do seu anuncio *"
              placeholder="Selecione aqui"
              className="w-full"
              value={sellForm?.categorie_id}
              onChange={(e) => {
                setSellForm((prevState) => ({
                  ...prevState,
                  categorie_id: e.target.value,
                }));
              }}
            >
              {(categorie) => (
                <SelectItem key={categorie.value}>{categorie.label}</SelectItem>
              )}
            </Select>
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
              isDisabled={!canCreate}
              isLoading={isLoading}
              onClick={() => {
                handleCreateSell()
              }}
              color="primary"
              className="text-white font-bold rounded-full"
            >
              Criar anuncio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSellForm;

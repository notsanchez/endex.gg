import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Divider,
  Input,
  Textarea,
} from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const Details = ({
  sellForm,
  setSellForm,
  isLoading,
  handleSubmit,
  stepOneFormSubmit,
}) => {
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);

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

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];

    if (!newFile.type.startsWith('image/')) {
      toast.error("Tipo de arquivo não permitido");
      return;
    }

    if (sellForm?.images?.length === 3) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;

      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          setSellForm((prevState) => ({
            ...prevState,
            images:
              prevState?.images?.length > 0
                ? prevState?.images?.concat(blob)
                : [blob],
          }));
        }, 'image/webp');
      };
    };

    reader.readAsDataURL(newFile);
  };



  useEffect(() => {
    getCategories();
  }, []);

  const handlePriceChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatAsCurrency(rawValue);

    setSellForm((prevState) => ({
      ...prevState,
      price: formattedValue,
    }));

  };

  console.log(sellForm)

  const formatAsCurrency = (value) => {
    const cleanedValue = value.replace(/[^\d]/g, "");
    const floatValue = parseFloat(cleanedValue) / 100;
    const formattedValue = floatValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
    return formattedValue;
  };

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
                  categorie_name: categorie.label,
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
        {/* <div className="flex flex-col gap-2 w-full">
          <Input
            label={"Preço *"}
            variant="bordered"
            labelPlacement="outside"
            placeholder="Digite o preço do seu produto"
            className="w-full"
            value={sellForm?.price}
            onChange={handlePriceChange}
          />
        </div> */}

        {/* <div className="flex flex-col gap-2 w-full">
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
                messagesPerQuantity: Array.from({ length: e.target.value }, () => '')
              }));
            }}
          />
        </div> */}
      </div>

      <div className="flex gap-12 w-full items-center justify-center">
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const { selectionStart, selectionEnd, value } = e.target;
                const newValue =
                  value.substring(0, selectionStart) +
                  "\n" +
                  value.substring(selectionEnd);
                setSellForm((prevState) => ({
                  ...prevState,
                  description: newValue,
                }));
              }
            }}
          />
        </div>
      </div>

      <div className="p-4 border-1 rounded-lg w-full flex flex-col gap-4">
        {/* <h1>O valor de cada variações será somado com o valor original do produto.</h1> */}
        <div className="flex flex-col gap-12 w-full items-center justify-center">
          {sellForm?.variations?.map((el, index) => (
            <div className="flex flex-col gap-12 w-full items-start justify-center">

              <div className="flex gap-2 w-full items-end justify-center">
                <Input value={el.name} onChange={(e) => {
                  setSellForm(prevState => {
                    const updatedVariations = [...prevState.variations];
                    updatedVariations[index].name = e.target.value;
                    return { ...prevState, variations: updatedVariations };
                  });

                }} variant="bordered" labelPlacement="outside" label="Nome da variação" placeholder="Digite o nome da variação" />

                <Input value={el.value} onChange={(e) => {

                  const rawValue = e.target.value;
                  const formattedValue = formatAsCurrency(rawValue);

                  setSellForm(prevState => {
                    const updatedVariations = [...prevState.variations];
                    updatedVariations[index].value = formattedValue;
                    return { ...prevState, variations: updatedVariations };
                  });



                }} variant="bordered" labelPlacement="outside" label="Valor" placeholder="Digite o valor da variação" />

                <Input type="number" value={el.quantity} onChange={(e) => {
                  setSellForm(prevState => {
                    const updatedVariations = [...prevState.variations];
                    updatedVariations[index].quantity = e.target.value;
                    updatedVariations[index].messagesPerItem = Array.from({ length: e.target.value }, () => '');
                    return { ...prevState, variations: updatedVariations };
                  });

                }} variant="bordered" labelPlacement="outside" label="Quantidade" placeholder="Quantidade" />

                <Button onClick={() => {
                  setSellForm(prevState => {
                    const updatedVariations = [...prevState.variations];
                    updatedVariations.splice(index, 1);
                    return { ...prevState, variations: updatedVariations };
                  });

                }} color="danger" size="sm">X</Button>
              </div>
            </div>
          ))}

        </div>

        <div className="flex gap-12 w-full items-center justify-center">
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={() => {
              setSellForm((prevState) => ({
                ...prevState,
                variations: [
                  ...(prevState?.variations || []),
                  {
                    name: "",
                    value: "R$ 0,00"
                  }
                ],
              }));
            }}>Adicionar variação</Button>
          </div>
        </div>

      </div>



      <div className="flex flex-col gap-2 w-full">
        <h1>
          {!!sellForm?.images ? sellForm?.images?.length : 0} de 3 imagens
          adicionadas
        </h1>
        <div className="grid grid-cols-3 gap-8 h-full">
          {sellForm?.images?.map((file, index) => (
            <div className="flex flex-col items-end w-full gap-2" key={index}>
              <Button
                onPress={() => {
                  setSellForm((prevState) => ({
                    ...prevState,
                    images: prevState.images.filter(
                      (_, indexImg) => indexImg !== index
                    ),
                  }));
                }}
                isIconOnly
                variant="ghost"
                color="danger"
                size="sm"
              >
                X
              </Button>
              <div
                style={{
                  backgroundImage: typeof file === 'string' ? `url(${file})` : `url(${URL.createObjectURL(file)})`,
                  width: "100%",
                  height: "300px",
                  borderRadius: "8px",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          ))}
        </div>

        <Button
          isDisabled={sellForm?.images?.length === 3}
          onPress={handleButtonClick}
          variant="bordered"
          className="font-bold h-12"
        >
          Adicionar imagem
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/png, image/jpeg, image/jpg, image/webp"
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

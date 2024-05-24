import { loggedID } from "@/utils/useAuth";
import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Details from "./CreateSellSteps/Details";
import AdType from "./CreateSellSteps/AdType";
import Summary from "./CreateSellSteps/Summary";
import { useRouter } from "next/router";

const CreateSellForm = ({ productID }) => {
  const router = useRouter();
  const [sellForm, setSellForm] = useState({
    price: 'R$ 0,00',
    variations: [{ name: '', value: 'R$ 0,00' }]
  });

  const [isLoading, setIsLoading] = useState(false);

  const [step, setStep] = useState(1);

  const isInvalidValue = (value) => {
    if (value == 'R$ 0,00') {
      return true;
    }

    const numericValue = parseFloat(value.replace('R$', '').replace(',', '.'));
    if (isNaN(numericValue)) {
      return true;
    } else if (numericValue == 0) {
      return true;
    }

    return false;
  };

  const stepOneFormSubmit =
    !!sellForm?.title &&
    !!sellForm?.description &&
    !!sellForm?.categorie_id &&
    sellForm?.images?.length >= 1 &&
    !sellForm.variations.some(variation => isInvalidValue(variation.value));


  const stepAdTypeFormSubmit = !!sellForm?.ad_type_id;

  const uploadImages = async () => {
    let imageUrls = [];

    await Promise.all(
      sellForm?.images?.map(async (el) => {
        if (typeof el === 'string') {
          imageUrls.push(el);
        } else {
          const formData = new FormData();
          formData.append("file", el);
          formData.append("upload_preset", "b650rwr0");

          const response = await axios.post(
            "https://api.cloudinary.com/v1_1/matheussanchez/image/upload",
            formData
          );

          imageUrls.push(response.data.secure_url);
        }
      })
    );

    return imageUrls;
  };


  const totalQuantity = sellForm?.variations?.reduce((acc, curr) => {
    const quantity = parseInt(curr.quantity);
    return acc + quantity;
  }, 0);

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

          const sellFormWithUrls = {
            ...sellForm,
            images: imageUrls
          };

          const hasLinks = /https?:\/\/\S+/.test(sellForm?.description);
          const hasLinksHttp = /http?:\/\/\S+/.test(sellForm?.description);
          const hasAtSymbol = /@/.test(sellForm?.description);
          const hasIntagram = /instagram/.test(sellForm?.description);
          const hasFacebook = /facebook/.test(sellForm?.description);
          const hasWhatsapp = /whatsapp/.test(sellForm?.description);

          if (hasLinks || hasLinksHttp || hasAtSymbol || hasIntagram || hasFacebook || hasWhatsapp) {
            toast.error("A descrição não pode conter links!");
            setIsLoading(false);
            return;
          }

          function generateSlug(title) {
            const cleanTitle = title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');

            const randomSequence = Math.random().toString(36).substring(7);

            const slug = `${cleanTitle}-${randomSequence}`;

            return slug;
          }


          const res = await axios.post("/api/query", {
            query: `
    INSERT INTO T_PRODUTOS (FK_USUARIO, TITULO, DESCRICAO, QTD_DISPONIVEL, PRECO, FK_CATEGORIA, FK_TIPO_DE_ANUNCIO, PRECO_A_RECEBER, FK_STATUS, IMAGEM_1, IMAGEM_2, IMAGEM_3, AFILIADOS, PRIMEIRA_MENSAGEM, SLUG, SELL_FORM) 
    VALUES 
    ("${loggedID}", "${sellForm?.title}", "${sellForm?.description}", "${totalQuantity
              }", "${parseFloat(
                sellForm?.price.replace(/[^\d,]/g, '').replace(",", ".")
              ).toFixed(2)}", "${sellForm?.categorie_id}", "${sellForm?.ad_type_id
              }", "${parseFloat(
                sellForm?.price.replace(/[^\d,]/g, '').replace(",", ".")
              ).toFixed(2) -
              (Number(sellForm?.ad_type_tax) / 100) *
              parseFloat(
                sellForm?.price.replace(/[^\d,]/g, '').replace(",", ".")
              ).toFixed(2)
              }", "1", "${imageUrls[0] || ""}", "${imageUrls[1] || ""}", "${imageUrls[2] || ""
              }", "${!!sellForm?.affiliate ? "1" : "0"}", ${!!sellForm?.firstMessage ? `"${sellForm?.firstMessage}"` : "NULL"
              }, "${generateSlug(sellForm?.title)}", "${JSON.stringify(sellFormWithUrls).replace(/"/g, '\\"')}")
  `,
          });

          await sellForm?.variations?.map(async (el) => {
            await axios.post("/api/query", {
              query: `INSERT INTO T_VARIACOES_PRODUTO (FK_PRODUTO, TITULO, VALOR, MENSAGEM_AUTOMATICA) VALUES ("${res?.data?.results?.[0]?.id}", "${el?.name}", "${parseFloat(
                el?.value?.replace(/[^\d,]/g, '').replace(",", ".")
              ).toFixed(2)}", '${JSON.stringify(el?.messagesPerItem)}')`
            })
          })



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

  const handleUpdate = async () => {
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

          const sellFormWithUrls = {
            ...sellForm,
            images: imageUrls
          };

          const hasLinks = /https?:\/\/\S+/.test(sellForm?.description);
          const hasLinksHttp = /http?:\/\/\S+/.test(sellForm?.description);
          const hasAtSymbol = /@/.test(sellForm?.description);
          const hasIntagram = /instagram/.test(sellForm?.description);
          const hasFacebook = /facebook/.test(sellForm?.description);
          const hasWhatsapp = /whatsapp/.test(sellForm?.description);

          if (hasLinks || hasLinksHttp || hasAtSymbol || hasIntagram || hasFacebook || hasWhatsapp) {
            toast.error("A descrição não pode conter links!");
            setIsLoading(false);
            return;
          }


          await axios.post("/api/query", {
            query: `
                UPDATE T_PRODUTOS 
                SET 
                    TITULO = "${sellForm?.title}",
                    DESCRICAO = "${sellForm?.description}",
                    QTD_DISPONIVEL = "${totalQuantity}",
                    PRECO = "${parseFloat(sellForm?.price.replace(/[^\d,]/g, '').replace(",", ".")).toFixed(2)}",
                    FK_CATEGORIA = "${sellForm?.categorie_id}",
                    FK_TIPO_DE_ANUNCIO = "${sellForm?.ad_type_id}",
                    PRECO_A_RECEBER = "${(parseFloat(sellForm?.price.replace(/[^\d,]/g, '').replace(",", ".")).toFixed(2)) - (Number(sellForm?.ad_type_tax) / 100) * parseFloat(sellForm?.price.replace(/[^\d,]/g, '').replace(",", ".")).toFixed(2)}",
                    IMAGEM_1 = "${imageUrls[0] || ""}",
                    IMAGEM_2 = "${imageUrls[1] || ""}",
                    IMAGEM_3 = "${imageUrls[2] || ""}",
                    AFILIADOS = "${!!sellForm?.affiliate ? "1" : "0"}",
                    PRIMEIRA_MENSAGEM = ${!!sellForm?.firstMessage ? `"${sellForm?.firstMessage}"` : "NULL"},
                    SELL_FORM = "${JSON.stringify(sellFormWithUrls).replace(/"/g, '\\"')}"
                WHERE
                    FK_USUARIO = "${loggedID}" AND
                    ID = "${productID}"
            `,
          });

          await axios.post("/api/query", {
            query: `
                  UPDATE T_VARIACOES_PRODUTO 
                  SET ACTIVE = 0
                  WHERE FK_PRODUTO = "${productID}"
              `,
          });

          await sellForm?.variations?.map(async (el) => {
            await axios.post("/api/query", {
              query: `INSERT INTO T_VARIACOES_PRODUTO (FK_PRODUTO, TITULO, VALOR, MENSAGEM_AUTOMATICA) VALUES ("${productID}", "${el?.name}", "${parseFloat(
                el?.value?.replace(/[^\d,]/g, '').replace(",", ".")
              ).toFixed(2)}", '${JSON.stringify(el?.messagesPerItem)}')`
            })
          })

          toast.success("Anuncio criado com sucesso!");
          router.push("/wallet?page=my-products");


        } catch {
          setIsLoading(false);
        }
      }
    } else {
      toast.error("Preencha todos os campos!");
    }
  };
  const getSellForm = async () => {
    await axios
      .post("/api/query", {
        query: `
        SELECT TP.SELL_FORM FROM T_PRODUTOS TP WHERE TP.ID = ${productID} 
        `,
      })
      .then((res) => {
        console.log(JSON.parse(res?.data?.results?.[0]?.SELL_FORM))
        setSellForm(JSON.parse(res?.data?.results?.[0]?.SELL_FORM));
      })
      .catch((err) => {
      });
  };

  useEffect(() => {
    if (productID) {
      getSellForm()
    }
  }, [productID])

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
            handleUpdate={handleUpdate}
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

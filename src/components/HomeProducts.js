"use client";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button, Divider, Select, SelectItem, Spinner } from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const HomeProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterSelected, setFilterSelected] = useState('ORDER BY TP.created_at ASC')

  const router = useRouter();

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `SELECT TP.id, TP.IMAGEM_1, TP.TITULO, TU.NICKNAME, TP.PRECO,
        (SELECT COUNT(*) FROM T_VENDAS TV WHERE TV.FK_PRODUTO = TP.id) AS QTD_VENDAS
        FROM T_PRODUTOS TP INNER JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO WHERE TP.FK_STATUS = 2 ${!!router?.query?.category
            ? `AND TP.FK_CATEGORIA = ${router?.query?.category}`
            : ""
          }
        ${!!router?.query?.search
            ? `AND TP.TITULO LIKE "%${router?.query?.search}%"`
            : ""
          }
        ${filterSelected}`,
      })
      .then((res) => {
        setProducts(res?.data?.results);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const getCategories = async () => {

    await axios
      .post("/api/query", {
        query: `SELECT id, NOME FROM T_CATEGORIAS WHERE id = ${router?.query?.category}`,
      })
      .then((res) => {
        setCategories(res?.data?.results?.[0]);
      })
      .catch(() => { });
  };

  useEffect(() => {
    getProducts();
    getCategories();
  }, [router?.query, filterSelected]);

  return (
    <div
      className={`w-[100%] lg:w-[70%] flex items-start justify-center py-12 px-12 lg:px-0 mt-32 ${isLoading || products?.length <= 0 && "h-[90vh]"
        }`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-center lg:items-start lg:justify-start gap-12 w-full">
        {/* <div className="gap-2 flex flex-col border-1 p-4 rounded-lg w-full lg:w-auto">
          <h1 className="font-bold">CATEGORIAS</h1>
          <Divider />
          {categories?.map((el) => (
            <Button
              onPress={() => {
                router.push(`/product-list?category=${el?.id}`);
              }}
              variant={`${
                el?.id == router?.query?.category ? "solid" : "light"
              }`}
              className="text-start"
            >
              {el?.NOME}
            </Button>
          ))}
          <Button
              onPress={() => {
                router.push(`/categories`);
              }}
              variant={`bordered`}
              className="border-purple-600 text-purple-600"
            >
              Ver todas as categorias
            </Button>
        </div> */}
        <div className="flex flex-col gap-6 w-full">
          <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between">
            {!!categories?.NOME && !router?.query?.search && (
              <h1 className="text-2xl">{categories?.NOME}</h1>

            )}
            {!!router?.query?.search && (
              <h1 className="text-2xl">Pesquisa por: {router?.query?.search}</h1>
            )}
            <Select
              variant={"bordered"}
              label="Ordenar"
              className="max-w-xs"
              defaultSelectedKeys={[filterSelected]}
              onChange={(e) => setFilterSelected(e.target.value)}
            >
              <SelectItem key={'ORDER BY TP.created_at ASC'} value={'ORDER BY TP.created_at ASC'}>Mais recentes</SelectItem>
              <SelectItem key={'ORDER BY QTD_VENDAS DESC'} value={'ORDER BY QTD_VENDAS DESC'}>Mais vendidos</SelectItem>
              <SelectItem key={'ORDER BY TP.PRECO ASC'} value={'ORDER BY TP.PRECO ASC'}>Maior valor</SelectItem>
              <SelectItem key={'ORDER BY TP.PRECO DESC'} value={'ORDER BY TP.PRECO DESC'}>Menor valor</SelectItem>
              {/* <SelectItem key={''} value={''}>Reputação</SelectItem> */}
            </Select>
          </div>
          <Divider />
          <div
            className={`grid grid-cols-1 ${products?.length > 0 && !isLoading
                ? "lg:grid-cols-4"
                : "lg:grid-cols-1"
              } gap-4 w-full`}
          >
            {!isLoading ? (
              products?.map((el) => (
                <div
                  onClick={() => {
                    router.push(`/product/${el?.id}`);
                  }}
                  className="flex flex-col items-center justify-start gap-2 w-full cursor-pointer border-2 rounded-lg hover:shadow-2xl transition-all duration-75 hover:shadow-purple-300"
                >
                  <div
                    style={{ backgroundImage: `url("${el?.IMAGEM_1}")` }}
                    className={`w-full h-52 rounded-t-lg bg-cover bg-center`}
                  ></div>
                  <div className="w-full flex flex-col justify-between h-full">
                    <div className="flex flex-col items-center justify-center px-6">
                      <p className="font-bold mt-4 text-center text-sm">
                        {el?.TITULO}
                      </p>
                      <p className="text-sm">{el?.NICKNAME}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <Button
                        onClick={() => {
                          router.push(`/product/${el?.id}`);
                        }}
                        className="my-4"
                        variant="bordered"
                        color="primary"
                      >
                        {formatCurrency(el?.PRECO)}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full flex items-center justify-center">
                <Spinner />
              </div>
            )}
            {products?.length === 0 && !isLoading && (
              <div className="w-full flex items-center justify-center">
                <h1>Nenhum produto encontrado</h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeProducts;

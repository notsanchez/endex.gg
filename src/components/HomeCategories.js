"use client";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button, Spinner } from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const HomeCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const router = useRouter();

  const getCategories = async () => {
    await axios
      .post("/api/query", {
        query: "SELECT id, NOME, BACKGROUND FROM T_CATEGORIAS LIMIT 5",
      })
      .then((res) => {
        setCategories(res?.data?.results);
      });
  };

  const getProducts = async () => {
    await axios
      .post("/api/query", {
        query: `SELECT TP.id, TP.IMAGEM_1, TP.TITULO, TU.NICKNAME, TP.PRECO FROM T_PRODUTOS TP INNER JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO WHERE TP.FK_STATUS = 2 ${
          !!router?.query?.category
            ? `AND TP.FK_CATEGORIA = ${router?.query?.category}`
            : ""
        } LIMIT 4`,
      })
      .then((res) => {
        setProducts(res?.data?.results);
      })
      .catch(() => {});
  };

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  return (
    <div className="w-[100%] lg:w-[70%] flex flex-col items-center justify-center py-12 px-6 lg:px-0 gap-24 mb-24">
      <div className="flex flex-col items-start justify-center gap-6 w-full">
        <h1 className="text-2xl">Categorias Populares</h1>
        <div className="flex flex-row lg:flex-row items-start justify-between w-full gap-4">
          {categories?.length > 0 ? (
            categories?.map((el, index) => (
              <div
                onClick={() => {
                  router.push(`/product-list?category=${el?.id}`);
                }}
                className={`flex flex-col ${index >= 3 && 'hidden lg:flex'} items-center justify-center gap-2 lg:gap-4 w-full cursor-pointer transition-all duration-75`}
              >
                <div
                  style={{ backgroundImage: `url("${el?.BACKGROUND}")` }}
                  className={`w-full h-32 lg:h-60 rounded-lg bg-cover bg-center`}
                ></div>
                <h1 className="font-bold text-center text-sm lg:text-md">{el?.NOME}</h1>
              </div>
            ))
          ) : (
            <div className="w-full flex items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>
      </div>

      {products?.length > 0 && (
        <div className="flex flex-col items-start justify-center gap-6 w-full">
          <h1 className="text-2xl">Anúncios em destaque</h1>
          <div
            className={`grid grid-cols-2 ${
              products?.length > 0 ? "lg:grid-cols-4" : "lg:grid-cols-1"
            } gap-4 w-full`}
          >
            {products?.length > 0 ? (
              products?.map((el) => (
                <div
                  onClick={() => {
                    router.push(`/product/${el?.id}`);
                  }}
                  className="flex flex-col items-center justify-start gap-2 w-full cursor-pointer border-2 rounded-lg hover:shadow-2xl transition-all duration-75 hover:shadow-purple-300"
                >
                  <div
                    style={{ backgroundImage: `url("${el?.IMAGEM_1}")` }}
                    className={`w-full h-32 lg:h-60 rounded-t-lg bg-cover bg-center`}
                  ></div>
                    <div className="p-4 flex flex-col items-center justify-between h-full">
                      <div className="flex flex-col items-center justify-center">
                      <h1 className="font-bold text-center">{el?.TITULO}</h1>
                      <p className="text-sm">{el?.NICKNAME}</p>
                      </div>
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
              ))
            ) : (
              <div className="w-full flex items-center justify-center">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeCategories;

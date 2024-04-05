"use client";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button, Spinner } from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter();

  const getCategories = async () => {
    setIsLoading(true)
    await axios
      .post("/api/query", {
        query: "SELECT id, NOME, BACKGROUND FROM T_CATEGORIAS",
      })
      .then((res) => {
        setCategories(res?.data?.results);
        setIsLoading(false)
      }).catch(() => {
        setIsLoading(false)
      });
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className={`w-[100%] mt-32 lg:w-[70%] ${
        isLoading && "h-[90vh]"
      } flex flex-col items-center justify-start py-12 px-6 lg:px-0 gap-24 mb-24`}>
      <div className="flex flex-col items-start justify-center gap-6 w-full">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-2xl text-purple-600">Categorias</h1>
        </div>
        <div
            className={`grid grid-cols-2 ${
                categories?.length > 0 ? "lg:grid-cols-5" : "lg:grid-cols-1"
            } gap-8 w-full`}
          >
          {categories?.length > 0 ? (
            categories?.map((el, index) => (
              <div
                onClick={() => {
                  router.push(`/product-list?category=${el?.id}`);
                }}
                className={`flex flex-col items-center justify-center gap-2 lg:gap-4 w-full cursor-pointer transition-all duration-75`}
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

      
    </div>
  );
};

export default AllCategories;

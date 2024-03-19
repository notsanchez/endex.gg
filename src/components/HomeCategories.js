"use client";
import { Spinner } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

const HomeCategories = () => {
  const [categories, setCategories] = useState([]);

  const getCategories = async () => {
    await axios
      .post("/api/query", {
        query: "SELECT ID, NOME, BACKGROUND FROM T_CATEGORIAS LIMIT 5",
      })
      .then((res) => {
        setCategories(res?.data?.results);
      });
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="w-[100%] lg:w-[60%] flex items-center justify-center py-12 px-12 lg:px-0">
      <div className="flex flex-col items-start justify-center gap-6 w-full">
        <h1 className="text-2xl">Categorias Populares</h1>
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4">
          {categories?.length > 0 ? categories?.map((el) => (
            <div className="flex flex-col items-center justify-center hover:gap-6 gap-2 w-full cursor-pointer transition-all duration-75">
              <div
                style={{ backgroundImage: `url("${el?.BACKGROUND}")` }}
                className={`w-full h-60 rounded-lg bg-cover bg-center`}
              ></div>
              <h1 className="font-bold">{el?.NOME}</h1>
            </div>
          )) : (
            <div className="w-full flex items-center justify-center">
            <Spinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeCategories;

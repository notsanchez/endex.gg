"use client";
import { Button, Divider, Spinner } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import WalletDetails from "./Wallet/WalletDetails";
import MyProducts from "./Wallet/MyProducts";
import { useRouter } from "next/router";

const WalletWrapper = () => {

  const router = useRouter()

  useEffect(() => {
    if(Object.keys(router?.query).length <= 0){
      router.push('/wallet?page=details')
    }
  },[])

  return (
    <div className="w-[100%] lg:w-[70%] flex items-center justify-center py-12 px-12 lg:px-0 h-full">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-12 w-full h-full">
        <div className="flex flex-col w-full lg:w-auto gap-8 items-c-enter justify-center">
          <Button
            onClick={() => {
              router.push('/wallet?page=details');
            }}
            variant={router?.query?.page === 'details' ? "flat" : 'bordered'}
            className="text-md border-0 text-start"
          >
            Detalhes da carteira
          </Button>
          <Button
            onClick={() => {
              router.push('/wallet?page=my-products');
            }}
            variant={router?.query?.page === 'my-products' ? "flat" : 'bordered'}
            className="text-md border-0 text-start"
          >
            Meus anúncios
          </Button>
          <Button
            onClick={() => {
              router.push('/wallet?page=my-shopping');
            }}
            variant={router?.query?.page === 'my-shopping' ? "flat" : 'bordered'}
            className="text-md border-0 text-start"
          >
            Minhas compras
          </Button>
          <Button
            onClick={() => {
              router.push('/wallet?page=my-sales');
            }}
            variant={router?.query?.page === 'my-sales' ? "flat" : 'bordered'}
            className="text-md border-0 text-start"
          >
            Minhas Vendas
          </Button>
        </div>
        {router?.query?.page === "details" && <WalletDetails />}
        {router?.query?.page === "my-products" && <MyProducts />}
        {router?.query?.page === "my-shopping" && <MyProducts />}
        {router?.query?.page === "my-sales" && <MyProducts />}
      </div>
    </div>
  );
};

export default WalletWrapper;

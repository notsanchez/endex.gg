"use client";
import { Button, Divider, Spinner } from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import WalletDetails from "./Wallet/WalletDetails";
import MyProducts from "./Wallet/MyProducts";
import { useRouter } from "next/router";
import MyShopping from "./Wallet/MyShopping";
import MySales from "./Wallet/MySales";
import { isAdmin } from "@/utils/useAuth";
import PendingAds from "./Wallet/PendingAds";
import AdsList from "./Wallet/AdsList";
import Sales from "./Wallet/Sales";
import PlatformDetails from "./Wallet/PlataformDetails";
import WithdrawRequests from "./Wallet/WithdrawRequests";
import WithdrawRequestsClient from "./Wallet/WithdrawRequestsClient";
import RefundRequests from "./Wallet/RefundRequests";
import Affiliate from "./Wallet/Affiliate";
import CategoriesAdmin from "./Wallet/CategoriesAdmin";
import Avaliacoes from "./Wallet/Avaliacoes";
import UsersList from "./Wallet/UsersList";
import Chats from "./Wallet/Chats";

const WalletWrapper = () => {
  const router = useRouter();

  useEffect(() => {
    if (Object.keys(router?.query).length <= 0) {
      router.push("/wallet?page=details");
    }
  }, []);

  return (
    <div className="w-[100%] lg:w-[70%] flex items-center justify-center py-12 px-12 lg:px-0 h-full mt-32">
      <div className="flex flex-col lg:flex-row items-start justify-center gap-12 w-full h-full">
        <div className="flex flex-col w-full lg:w-auto gap-8 items-c-enter justify-center border-1 rounded-lg p-4 shadow-lg">
          {isAdmin ? (
            <Button
              onClick={() => {
                router.push("/wallet?page=platform-details");
              }}
              variant={router?.query?.page === "platform-details" ? "flat" : "bordered"}
              className="text-md border-0 text-start"
            >
              Detalhes da plataforma
            </Button>
          ) : (
            <Button
              onClick={() => {
                router.push("/wallet?page=details");
              }}
              variant={router?.query?.page === "details" ? "flat" : "bordered"}
              className="text-md border-0 text-start"
            >
              Detalhes da carteira
            </Button>
          )}

          {!isAdmin && (
            <>
              <Button
                onClick={() => {
                  router.push("/wallet?page=my-shopping");
                }}
                variant={
                  router?.query?.page === "my-shopping" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Minhas compras
              </Button>
              <Button
                onClick={() => {
                  router.push("/wallet?page=my-products");
                }}
                variant={
                  router?.query?.page === "my-products" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Meus anúncios
              </Button>
              <Button
                onClick={() => {
                  router.push("/wallet?page=my-sales");
                }}
                variant={
                  router?.query?.page === "my-sales" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Minhas Vendas
              </Button>
              <Button
                onClick={() => {
                  router.push("/wallet?page=affiliate");
                }}
                variant={
                  router?.query?.page === "affiliate" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Minhas afiliações
              </Button>
              <Button
                onClick={() => {
                  router.push("/wallet?page=client-withdraw");
                }}
                variant={
                  router?.query?.page === "client-withdraw" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Solicitações de saque
              </Button>
            </>
          )}

          {isAdmin && (
            <>
              <Button
                onClick={() => {
                  router.push("/wallet?page=sales");
                }}
                variant={
                  router?.query?.page === "sales" ? "flat" : "bordered"
                }
                className="text-md border-0"
              >
                Todas as Vendas
              </Button>

              <Button
                onClick={() => {
                  router.push("/wallet?page=pending-ads");
                }}
                variant={
                  router?.query?.page === "pending-ads" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Anúncios pendentes
              </Button>

              <Button
                onClick={() => {
                  router.push("/wallet?page=ads-list");
                }}
                variant={
                  router?.query?.page === "ads-list" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Todos os anúncios
              </Button>

              <Button
                onClick={() => {
                  router.push("/wallet?page=withdraw");
                }}
                variant={
                  router?.query?.page === "withdraw" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Solicitações de saque
              </Button>

              <Button
                onClick={() => {
                  router.push("/wallet?page=refund-requests");
                }}
                variant={
                  router?.query?.page === "refund-requests" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Solicitações de reembolso
              </Button>

              <Button
                onClick={() => {
                  router.push("/wallet?page=avaliacoes");
                }}
                variant={
                  router?.query?.page === "avaliacoes" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Avaliações
              </Button>

              <Button
                onClick={() => {
                  router.push("/wallet?page=users-list");
                }}
                variant={
                  router?.query?.page === "users-list" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Usuários
              </Button>

              <Button
                onClick={() => {
                  router.push("/wallet?page=chat-private");
                }}
                variant={
                  router?.query?.page === "chat-private" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Chats Abertos
              </Button>

              <Button
                onClick={() => {
                  router.push("/wallet?page=categories");
                }}
                variant={
                  router?.query?.page === "categories" ? "flat" : "bordered"
                }
                className="text-md border-0 text-start"
              >
                Categorias
              </Button>
            </>
          )}
        </div>
        {router?.query?.page === "details" && <WalletDetails />}
        {router?.query?.page === "my-products" && <MyProducts />}
        {router?.query?.page === "my-shopping" && <MyShopping />}
        {router?.query?.page === "my-sales" && <MySales />}
        {router?.query?.page === "ads-list" && <AdsList />}
        {router?.query?.page === "pending-ads" && <PendingAds />}
        {router?.query?.page === "sales" && <Sales />}
        {router?.query?.page === "withdraw" && <WithdrawRequests />}
        {router?.query?.page === "client-withdraw" && <WithdrawRequestsClient />}
        {router?.query?.page === "platform-details" && <PlatformDetails />}
        {router?.query?.page === "refund-requests" && <RefundRequests />}
        {router?.query?.page === "avaliacoes" && <Avaliacoes />}
        {router?.query?.page === "users-list" && <UsersList />}
        {router?.query?.page === "chat-private" && <Chats />}
        {router?.query?.page === "affiliate" && <Affiliate />}
        {router?.query?.page === "categories" && <CategoriesAdmin />}
      </div>
    </div>
  );
};

export default WalletWrapper;

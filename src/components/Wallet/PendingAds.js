import { loggedID } from "@/utils/useAuth";
import {
  Button,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const PendingAds = () => {
  const router = useRouter();

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
            SELECT TP.id, TP.TITULO, TP.PRECO, TP.PRECO_A_RECEBER, TP.QTD_DISPONIVEL FROM T_PRODUTOS TP WHERE TP.FK_STATUS = 1
        `,
      })
      .then((res) => {
        setProductsList(res?.data?.results);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      <div className="flex flex-col w-full ">
        <div className="w-full h-full flex flex-col lg:flex-row items-start justify-center gap-6">
          {!isLoading ? (
            <Table>
              <TableHeader>
                <TableColumn>PRODUTO</TableColumn>
                {/* <TableColumn>QUANTIDADE</TableColumn> */}
                <TableColumn>VALOR</TableColumn>
                <TableColumn>VALOR A RECEBER</TableColumn>
                {/* <TableColumn>VALOR A RECEBER</TableColumn> */}
                <TableColumn>QUANTIDADE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>AÇÃO</TableColumn>
              </TableHeader>
              <TableBody>
                {productsList?.length > 0 &&
                  productsList?.map((el) => (
                    <TableRow key="1">
                      <TableCell>
                        {el?.TITULO?.length > 30
                          ? el?.TITULO?.substring(0, 30) + "..."
                          : el?.TITULO}
                      </TableCell>
                      {/* <TableCell>{el?.QTD_DISPONIVEL}</TableCell> */}
                      <TableCell>R$ {el?.PRECO}</TableCell>
                      <TableCell>R$ {Number(el?.PRECO) - Number(el?.PRECO_A_RECEBER)}</TableCell>
                      <TableCell>{el?.QTD_DISPONIVEL}</TableCell>
                      {/* <TableCell>R$ {el?.PRECO_A_RECEBER}</TableCell> */}
                      {/* <TableCell>{el?.TOTAL_DE_VENDAS}</TableCell> */}
                      <TableCell>
                        <Chip
                          color={
                            "warning"
                          }
                          size="sm"
                        >
                          Aguardando aprovação
                        </Chip>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          onPress={() => {
                            router.push(`/product/${el?.id}`);
                          }}
                          size="sm"
                        >
                          Visualizar anúncio
                        </Button>
                        <Button
                          
                          size="sm"
                        >
                          Aprovar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-2">
              <Spinner />
              <h1 className="text-purple-600">Buscando itens...</h1>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PendingAds;

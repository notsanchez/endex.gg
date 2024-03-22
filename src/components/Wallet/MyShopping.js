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

const MyShopping = () => {
  const router = useRouter();

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
        SELECT TV.id, TP.TITULO, TP.PRECO, TV.QTD, TSV.NOME AS STATUS FROM T_VENDAS TV 
        INNER JOIN T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO 
        INNER JOIN T_STATUS_VENDA TSV ON TSV.id = TV.FK_STATUS
        WHERE TV.FK_USUARIO_COMPRADOR = "${loggedID}"
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
                      <TableCell>{el?.QTD}</TableCell>
                      {/* <TableCell>R$ {el?.PRECO_A_RECEBER}</TableCell> */}
                      {/* <TableCell>{el?.TOTAL_DE_VENDAS}</TableCell> */}
                      <TableCell>
                        <Chip
                          color={
                            el?.STATUS === "Aguardando pagamento"
                              ? "warning"
                              : el?.STATUS === "Pagamento confirmado"
                              ? "success"
                              : "danger"
                          }
                          size="sm"
                        >
                          {el?.STATUS}
                        </Chip>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          onPress={() => {
                            router.push(`/order/${el?.id}`);
                          }}
                          size="sm"
                        >
                          {el?.STATUS === "Aguardando pagamento" ? 'Finalizar pagamento' : "Chat com vendedor"}
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

export default MyShopping;

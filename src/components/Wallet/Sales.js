import { formatCurrency } from "@/utils/formatCurrency";
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
  Checkbox
} from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Sales = () => {
  const router = useRouter();

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedSales, setSelectedSales] = useState([])

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
        SELECT 
        TV.id, 
        TP.TITULO, 
        TP.PRECO, 
        TV.VALOR_A_RECEBER AS PRECO_A_RECEBER, 
        TV.COMISSAO_ENDEX, 
        TV.VALOR_AFILIADO, 
        TV.QTD, 
        TSV.NOME AS STATUS, 
        TV.REEMBOLSADO, 
        TV.created_at 
        FROM 
            T_VENDAS TV 
            INNER JOIN T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO
            INNER JOIN T_STATUS_VENDA TSV ON TSV.id = TV.FK_STATUS
        WHERE 
            TV.id NOT IN (
                SELECT TV.id
                FROM T_VENDAS TV 
                WHERE TV.created_at <= NOW() - INTERVAL 7 DAY
                    AND TV.FK_STATUS = 1
            )
            AND TV.created_at >= NOW() - INTERVAL 30 DAY
            AND TV.ESCONDER_PAINEL = 0
        ORDER BY TV.created_at DESC
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

  const handleHideSale = async (id) => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
          UPDATE T_VENDAS SET ESCONDER_PAINEL = 1 WHERE id = '${id}'
        `,
      })
      .then((res) => {
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });

    getProducts();
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      <div className="flex flex-col w-full ">
        <div className="w-full h-full flex flex-col lg:flex-col items-start justify-center gap-6">
          {selectedSales?.length > 0 && (
            <Button onClick={() => {
              for (const sale of selectedSales){
                handleHideSale(sale)
              }
            }}>Esconder {selectedSales?.length} vendas</Button>
          )}
          {!isLoading ? (
            <Table>
              <TableHeader>
                <TableColumn></TableColumn>
                <TableColumn>PRODUTO</TableColumn>
                {/* <TableColumn>QUANTIDADE</TableColumn> */}
                <TableColumn>VALOR</TableColumn>
                <TableColumn>VALOR RECEBIDO</TableColumn>
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
                        <Checkbox onClick={() => {
                          setSelectedSales((prevState) => {
                            const index = prevState.indexOf(el?.id);

                            if (index !== -1) {
                              return prevState.filter(id => id !== el?.id);
                            } else {
                              return [...prevState, el?.id];
                            }
                          });
                        }} />
                      </TableCell>
                      <TableCell>
                        {el?.TITULO?.length > 30
                          ? el?.TITULO?.substring(0, 30) + "..."
                          : el?.TITULO}
                      </TableCell>
                      {/* <TableCell>{el?.QTD_DISPONIVEL}</TableCell> */}
                      <TableCell>{formatCurrency(Number(el?.COMISSAO_ENDEX) + Number(el?.PRECO_A_RECEBER) + Number(el?.VALOR_AFILIADO))}</TableCell>
                      <TableCell>{formatCurrency(Number(el?.COMISSAO_ENDEX))}</TableCell>
                      <TableCell>{el?.QTD}</TableCell>
                      {/* <TableCell>{el?.TOTAL_DE_VENDAS}</TableCell> */}
                      <TableCell>
                        <Chip
                          color={
                            el?.REEMBOLSADO == 1 ? "danger" : el?.STATUS === "Aguardando pagamento"
                              ? "warning"
                              : el?.STATUS === "Pagamento confirmado"
                                ? "success"
                                : "danger"
                          }
                          size="sm"
                        >
                          {el?.REEMBOLSADO ? "Reembolsado" : el?.STATUS}
                        </Chip>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          onPress={() => {
                            router.push(`/order/${el?.id}`);
                          }}
                          size="sm"
                        >
                          Pagina da venda
                        </Button>

                        <Button
                          onPress={() => {
                            handleHideSale(el?.id)
                            //router.push(`/order/${el?.id}`);
                          }}
                          size="sm"
                        >
                          Esconder
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

export default Sales;

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
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input
} from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const AdsList = () => {
  const router = useRouter();

  const [productsList, setProductsList] = useState([]);
  const [originalProductsList, setOriginalProductsList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
          SELECT TP.id, TP.TITULO, TP.PRECO, TP.PRECO_A_RECEBER, TP.SLUG, TP.QTD_DISPONIVEL, TSP.NOME AS STATUS FROM T_PRODUTOS TP
          INNER JOIN T_STATUS_PRODUTO TSP ON TSP.id = TP.FK_STATUS
          WHERE TP.FK_STATUS != 3
          AND TP.created_at >= NOW() - INTERVAL 30 DAY
          ORDER BY TP.created_at DESC
        `,
      })
      .then((res) => {
        setProductsList(res?.data?.results);
        setOriginalProductsList(res?.data?.results)
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const handleRemoveAd = async (id) => {
    await axios
      .post("/api/query", {
        query: `
        UPDATE T_PRODUTOS SET FK_STATUS = 3 WHERE ID = '${id}'
      `,
      })
      .then(async (res) => {
        await axios
          .post("/api/query", {
            query: `
              DELETE FROM T_AVALIACOES WHERE FK_PRODUTO = '${id}'
            `,
          })
          .then((res) => {
            getProducts()
          })
      })
  }

  const handleActiveAd = async (id) => {
    await axios
      .post("/api/query", {
        query: `
        UPDATE T_PRODUTOS SET FK_STATUS = 2 WHERE ID = '${id}'
      `,
      })
      .then((res) => {
        getProducts()
      })
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      <div className="flex flex-col w-full ">
        <div className="w-full h-full flex flex-col items-start justify-center gap-6">
          {!isLoading ? (
            <>
              <Input
                placeholder="Procure anúncios aqui"
                onChange={(e) => {
                  const inputValue = e.target.value.toLowerCase();
                  const filteredList = inputValue.length === 0
                    ? originalProductsList
                    : productsList.filter((el) =>
                      el?.TITULO.toLowerCase().includes(inputValue)
                    );
                  setProductsList(filteredList);
                }}
              />

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
                        <TableCell>{formatCurrency(el?.PRECO)}</TableCell>
                        <TableCell>
                          {formatCurrency(
                            parseFloat(
                              String(el?.PRECO)
                                .replace("R$", "")
                                .replace(",", ".")
                            ).toFixed(2) -
                            parseFloat(
                              String(el?.PRECO_A_RECEBER)
                                .replace("R$", "")
                                .replace(",", ".")
                            ).toFixed(2)
                          )}
                        </TableCell>
                        <TableCell>{el?.QTD_DISPONIVEL}</TableCell>
                        {/* <TableCell>{el?.TOTAL_DE_VENDAS}</TableCell> */}
                        <TableCell>
                          <Chip
                            color={
                              el?.STATUS === "Aguardando Aprovação"
                                ? "warning"
                                : el?.STATUS === "Aprovado"
                                  ? "success"
                                  : "danger"
                            }
                            size="sm"
                          >
                            {el?.STATUS}
                          </Chip>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {/* <Button
                          onPress={() => {
                            router.push(`/product/${el?.id}`);
                          }}
                          size="sm"
                        >
                          Visualizar anúncio
                        </Button> */}

                          <Dropdown>
                            <DropdownTrigger>
                              <Button variant="bordered">Ações</Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Static Actions">
                              <DropdownItem
                                onPress={() => {
                                  router.push(`/product/${el?.SLUG}`);
                                }}
                                key="new"
                              >
                                Página do anúncio
                              </DropdownItem>
                              {el?.STATUS === 'Removido' ? (
                                <DropdownItem
                                  className="text-success"
                                  color="success"
                                  onPress={() => {
                                    handleActiveAd(el?.id)
                                  }}
                                >
                                  Ativar anúncio
                                </DropdownItem>
                              ) : (
                                <DropdownItem
                                  key="delete"
                                  className="text-danger"
                                  color="danger"
                                  onPress={() => {
                                    handleRemoveAd(el?.id)
                                  }}
                                >
                                  Remover anúncio
                                </DropdownItem>
                              )}

                            </DropdownMenu>
                          </Dropdown>

                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </>
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

export default AdsList;

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
} from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash } from 'lucide-react';

const Affiliate = () => {
  const router = useRouter();

  const [productsList, setProductsLis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
        SELECT TP.id, TA.id as ID_AFILIADO, TP.TITULO, TC.NOME AS CATEGORIA, TDA.NOME AS TIPO_DE_ANUNCIO, TP.QTD_DISPONIVEL, TP.PRECO, TP.PRECO_A_RECEBER, TSP.NOME AS STATUS_NOME, (
                SELECT SUM(TV.QTD)
                FROM T_VENDAS TV
                WHERE TV.FK_PRODUTO = TP.ID AND TV.FK_USUARIO_AFILIADO = "${loggedID}"
            ) AS TOTAL_DE_VENDAS FROM T_AFILIADOS TA 
        INNER JOIN T_PRODUTOS TP ON TP.id = TA.FK_PRODUTO 
        INNER JOIN T_TIPOS_DE_ANUNCIO TDA ON TDA.id = TP.FK_TIPO_DE_ANUNCIO
        INNER JOIN T_CATEGORIAS TC ON TC.id = TP.FK_CATEGORIA
        INNER JOIN T_STATUS_PRODUTO TSP ON TSP.id = TP.FK_STATUS
        WHERE TA.FK_USUARIO = "${loggedID}"
        `,
      })
      .then((res) => {
        setProductsLis(res?.data?.results);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const handleDeleteAfilliate = async (id) => {
    await axios.post('/api/query', {
      query: `DELETE FROM T_AFILIADOS WHERE id = ${id}`
    }).then(() => {
      toast.success('Afiliado excluido com sucesso!')
      getProducts()
    }).catch((err) => console.log(err))
  }

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
                <TableColumn>CATEGORIA</TableColumn>
                <TableColumn>TIPO DE ANUNCIO</TableColumn>
                {/* <TableColumn>QUANTIDADE</TableColumn> */}
                <TableColumn>VALOR</TableColumn>
                {/* <TableColumn>VALOR A RECEBER</TableColumn> */}
                <TableColumn>VENDAS</TableColumn>
                <TableColumn>AÇÃO</TableColumn>
              </TableHeader>
              <TableBody>
                {productsList?.length > 0 &&
                  productsList?.map((el) => (
                    <TableRow key="1">
                      <TableCell>
                        {el?.TITULO?.length > 20
                          ? el?.TITULO?.substring(0, 20) + "..."
                          : el?.TITULO}
                      </TableCell>
                      <TableCell>{el?.CATEGORIA}</TableCell>
                      <TableCell>{el?.TIPO_DE_ANUNCIO}</TableCell>
                      {/* <TableCell>{el?.QTD_DISPONIVEL}</TableCell> */}
                      <TableCell>{formatCurrency(el?.PRECO)}</TableCell>
                      <TableCell>{!!el?.TOTAL_DE_VENDAS ? el?.TOTAL_DE_VENDAS : 0}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="bordered"
                          onPress={() => {
                            router.push(`/product/${el?.id}?code=${loggedID}`);
                          }}
                          size="sm"
                        >
                          Produto
                        </Button>
                        <Button 
                        variant="bordered"
                          onPress={() => {
                            const domain = window.location.origin;
                            const linkToCopy = `${domain}/product/${el?.id}?code=${loggedID}`;
                            navigator.clipboard.writeText(linkToCopy)
                            .then(() => {
                              toast.success("Copiado para area de transferencia!")
                            })
                            .catch(err => {
                              console.error('Erro ao copiar o link:', err);
                            });

                          }}
                          size="sm"
                        >
                          Copiar link
                        </Button>
                        <Button
                        variant="bordered"
                          onPress={() => {
                            handleDeleteAfilliate(el?.ID_AFILIADO)

                          }}
                          size="sm"
                        >
                          <Trash size={15} />
                        </Button>
                        {/* <Button size="sm">E</Button> */}
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

export default Affiliate;

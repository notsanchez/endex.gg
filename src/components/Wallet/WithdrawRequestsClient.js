import { formatCurrency } from "@/utils/formatCurrency";
import { loggedID } from "@/utils/useAuth";
import {
  Button,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";

const WithdrawRequestsClient = () => {

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
        SELECT 
        TS.*,
        TU.NICKNAME,
        COALESCE(
            (SELECT 
                SUM(TP.PRECO_A_RECEBER) 
            FROM 
                T_VENDAS TV 
            INNER JOIN 
                T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO 
            WHERE 
                TP.FK_USUARIO = TS.FK_USUARIO 
                AND TV.FK_STATUS = 2), 
            0
            ) AS SALDO_TOTAL,
            COALESCE(
                (SELECT 
                    SUM(CASE 
                            WHEN TIMESTAMPDIFF(HOUR, TV.created_at, NOW()) >= 120 THEN TP.PRECO_A_RECEBER 
                            ELSE 0 
                        END) 
                FROM 
                    T_VENDAS TV 
                INNER JOIN 
                    T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO 
                WHERE 
                    TP.FK_USUARIO = TS.FK_USUARIO 
                    AND TV.FK_STATUS = 2), 
                0
            ) AS SALDO_DISPONIVEL
        FROM 
            T_SAQUES TS 
        INNER JOIN 
            T_USUARIOS TU ON TU.id = TS.FK_USUARIO

        WHERE TU.id = "${loggedID}"
    
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
                <TableColumn>USUARIO</TableColumn>
                <TableColumn>VALOR</TableColumn>
                <TableColumn>DATA</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {productsList?.length > 0 &&
                  productsList?.map((el) => (
                    <TableRow key="1">
                      <TableCell>{el?.NICKNAME}</TableCell>
                      <TableCell>{formatCurrency(el?.VALOR)}</TableCell>
                      <TableCell>
                        {moment(el?.created_at).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell>
                        {el?.REALIZADO?.data?.[0] == "1" ? (
                          <Chip
                            color="success"
                            className="font-bold text-white"
                          >
                            Realizado
                          </Chip>
                        ) : (
                          <Chip>Solicitado</Chip>
                        )}
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

export default WithdrawRequestsClient;

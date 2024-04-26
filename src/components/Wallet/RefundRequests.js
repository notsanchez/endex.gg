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
  Textarea
} from "@nextui-org/react";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";

const RefundRequests = () => {

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingApproved, setIsLoadingApproved] = useState(false);

  const [withdrawSelected, setWithdrawSelected] = useState(null)

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
        SELECT TP.PRECO, TP.TITULO, TV.QTD, TU.NICKNAME, TR.*, TV.REEMBOLSADO FROM T_REEMBOLSOS TR 
        INNER JOIN T_VENDAS TV ON TV.id = TR.FK_VENDA 
        INNER JOIN T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO 
        INNER JOIN T_USUARIOS TU ON TU.id = TV.FK_USUARIO_COMPRADOR
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

  const handleApprovedWithdraw = async () => {
    setIsLoadingApproved(true);
    await axios
      .post("/api/query", {
        query: `
            UPDATE T_VENDAS SET REEMBOLSADO = 1 WHERE id = ${withdrawSelected?.FK_VENDA}
        `,
      })
      .then((res) => {
        setIsLoadingApproved(false);
      })
      .catch((err) => {
        setIsLoadingApproved(false);
      });

    getProducts();
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
                <TableColumn>PRODUTO</TableColumn>
                <TableColumn>VALOR</TableColumn>
                <TableColumn>DATA</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>AÇÃO</TableColumn>
              </TableHeader>
              <TableBody>
                {productsList?.length > 0 &&
                  productsList?.map((el) => (
                    <TableRow key="1">
                      <TableCell>{el?.NICKNAME}</TableCell>
                      <TableCell>{el?.TITULO}</TableCell>
                      <TableCell>{formatCurrency(el?.PRECO * el?.QTD)}</TableCell>
                      <TableCell>
                        {moment(el?.created_at).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell>
                        {el?.REEMBOLSADO == "1" ? (
                          <Chip
                            color="danger"
                            className="font-bold text-white"
                          >
                            Reembolsado
                          </Chip>
                        ) : (
                          <Chip>Solicitado</Chip>
                        )}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          onPress={() => {
                            onOpen()
                            setWithdrawSelected(el)
                          }}
                          isDisabled={el?.REEMBOLSADO == "1"}
                          size="sm"
                        >
                          {el?.REEMBOLSADO == "1"
                            ? "Reembolso Realizado"
                            : "Realizar Reembolso"}
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

        <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Dados para realização de reembolso
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col items-center justify-center gap-6 w-full">
                    <div className="flex items-center justify-center gap-4 w-full">
                      <Input
                        label={"Usuario"}
                        labelPlacement="outside"
                        variant="bordered"
                        value={withdrawSelected?.NICKNAME}
                        isDisabled
                      />
                    </div>
                    <Divider />
                    <div className="flex items-center justify-center gap-4 w-full">
                      <Input
                        label={"Tipo de chave"}
                        labelPlacement="outside"
                        variant="bordered"
                        value={withdrawSelected?.TIPO_CHAVE}
                      />
                      <Input
                        label={"Chave PIX"}
                        labelPlacement="outside"
                        variant="bordered"
                        value={withdrawSelected?.CHAVE_PIX}
                      />
                    </div>
                    <Input
                      label={"Valor do reembolso"}
                      labelPlacement="outside"
                      variant="bordered"
                      value={formatCurrency(withdrawSelected?.PRECO)}
                    />
                    <Textarea
                      label={"Motivo do reembolso"}
                      labelPlacement="outside"
                      variant="bordered"
                      value={withdrawSelected?.MOTIVO}
                    />
                  </div>
                </ModalBody>
                <Divider className="mt-8" />
                <ModalFooter>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-4 mb-2">
                      <Button onPress={() => {
                        window.open("https://www.mercadopago.com.br/money-out/transfer/pix-methods", "_blank")
                      }} className="text-blue-500 border-2 border-blue-500 font-bold bg-transparent">
                        Ir para MercadoPago
                      </Button>
                      <Button isLoading={isLoadingApproved} onPress={async () => {
                        await handleApprovedWithdraw()
                        onClose()
                      }} color="success" className="text-white font-bold">
                        Aprovar reembolso
                      </Button>
                    </div>
                    <p className="text-sm opacity-70">
                      Após realizar a transferencia, aprove o reembolso
                    </p>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

export default RefundRequests;

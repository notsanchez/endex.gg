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
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const UsersList = () => {

    const router = useRouter()

    const [productsList, setProductsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingApproved, setIsLoadingApproved] = useState(false);

    const [avaliacaoSelected, setAvaliacaoSelected] = useState(null)

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const getProducts = async () => {
        setIsLoading(true);
        await axios
            .post("/api/query", {
                query: `
        SELECT * FROM T_USUARIOS GROUP BY id ORDER BY created_at DESC
    
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

    const handleBanUser = async (el) => {
        setIsLoadingApproved(true);
        await axios
            .post("/api/query", {
                query: `
            UPDATE T_USUARIOS SET BANIDO = 1 WHERE id = '${el}'
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

    const handleRemoveBanUser = async (el) => {
        setIsLoadingApproved(true);
        await axios
            .post("/api/query", {
                query: `
            UPDATE T_USUARIOS SET BANIDO = 0 WHERE id = '${el}'
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
                                <TableColumn>NICKNAME</TableColumn>
                                <TableColumn>EMAIL</TableColumn>
                                <TableColumn>ENTROU EM</TableColumn>
                                <TableColumn>AÇÃO</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {productsList?.length > 0 &&
                                    productsList?.map((el) => (
                                        <TableRow key="1">
                                            <TableCell>{el?.NICKNAME}</TableCell>
                                            <TableCell>{el?.EMAIL}</TableCell>
                                            <TableCell>
                                                {moment(el?.created_at)?.format('DD/MM/YYYY')}
                                            </TableCell>
                                            <TableCell className="flex gap-2">
                                                <Button
                                                    onPress={() => {
                                                        router?.push(`/user/${el?.id}`)
                                                    }}
                                                    isDisabled={el?.REALIZADO?.data?.[0] == "1"}
                                                    size="sm"
                                                >
                                                    Pagina do usuário
                                                </Button>
                                                {el?.BANIDO == 0 ? (
                                                    <Button
                                                        onPress={() => {
                                                            handleBanUser(el?.id)
                                                        }}
                                                        color="danger"
                                                        //isDisabled={el?.REALIZADO?.data?.[0] == "1"}
                                                        size="sm"
                                                    >
                                                        Banir
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onPress={() => {
                                                            handleRemoveBanUser(el?.id)
                                                        }}
                                                        color="success"
                                                        //isDisabled={el?.REALIZADO?.data?.[0] == "1"}
                                                        size="sm"
                                                    >
                                                        Remover ban
                                                    </Button>
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

                {/* <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Dados para realização de saque
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col items-center justify-center gap-6 w-full">
                    <div className="flex items-center justify-center gap-4 w-full">
                      <Input
                        label={"Usuario"}
                        labelPlacement="outside"
                        variant="bordered"
                        value={avaliacaoSelected?.NICKNAME}
                        isDisabled
                      />
                      <Input
                        label={"Saldo total"}
                        labelPlacement="outside"
                        variant="bordered"
                        value={avaliacaoSelected?.SALDO_TOTAL}
                        isDisabled
                      />
                    </div>
                    <Divider />
                    <div className="flex items-center justify-center gap-4 w-full">
                      <Input
                        label={"Tipo de chave"}
                        labelPlacement="outside"
                        variant="bordered"
                        value={avaliacaoSelected?.TIPO_DE_CHAVE}
                      />
                      <Input
                        label={"Chave PIX"}
                        labelPlacement="outside"
                        variant="bordered"
                        value={avaliacaoSelected?.CHAVE_PIX}
                      />
                    </div>
                    <Input
                      label={"Valor do saque"}
                      labelPlacement="outside"
                      variant="bordered"
                      value={avaliacaoSelected?.VALOR}
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
                        Aprovar saque
                      </Button>
                    </div>
                    <p className="text-sm opacity-70">
                      Após realizar a transferencia, aprove o saque
                    </p>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal> */}
            </div>
        </>
    );
};

export default UsersList;

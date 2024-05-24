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
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Chats = () => {

    const [productsList, setProductsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter()

    const getProducts = async () => {
        setIsLoading(true);
        await axios
            .post("/api/query", {
                query: `
        SELECT TCP.*, TU.NICKNAME FROM T_CHAT_PRIVADO TCP 
        INNER JOIN T_USUARIOS TU ON TU.id = TCP.FK_USUARIO
        WHERE TCP.ABERTO = 1
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
                                <TableColumn>AÇÃO</TableColumn>
                            </TableHeader>
                            <TableBody className="w-full">
                                {productsList?.length > 0 &&
                                    productsList?.map((el) => (
                                        <TableRow className="display flex justify-between w-full" key="1">
                                            <TableCell>{el?.NICKNAME}</TableCell>

                                            <TableCell className="flex gap-2">
                                                <Button
                                                    onPress={() => {
                                                        router?.push(`/chat?id=${el.id}`)
                                                    }}
                                                    size="sm"
                                                >
                                                    Entrar
                                                </Button>
                                                <Button
                                                    onPress={async () => {
                                                        await axios
                                                            .post("/api/query", {
                                                                query: `
                                    UPDATE T_CHAT_PRIVADO SET ABERTO = 0 WHERE id = '${el?.id}'
                                `,
                                                            })
                                                        getProducts()
                                                    }}
                                                    size="sm"
                                                >
                                                    Fechar chat
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

export default Chats;

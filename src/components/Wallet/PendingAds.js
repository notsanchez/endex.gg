import { formatCurrency } from "@/utils/formatCurrency";
import {
  Button,
  Chip,
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
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const PendingAds = () => {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingApprovedAd, setIsLoadingApprovedAd] = useState(false);

  const [approvedAd, setApprovedAd] = useState({});
  const [motivoRecusa, setMotivoRecusa] = useState("")

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
          SELECT TP.id, TP.TITULO, TP.PRECO, TP.PRECO_A_RECEBER, TP.QTD_DISPONIVEL, TU.EMAIL, TU.id AS FK_USUARIO FROM T_PRODUTOS TP INNER JOIN T_USUARIOS TU ON TU.id = TP.FK_USUARIO WHERE TP.FK_STATUS = 1
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

  const handleApproveAd = async () => {
    setIsLoadingApprovedAd(true);
    await axios
      .post("/api/query", {
        query: `
            UPDATE T_PRODUTOS SET FK_STATUS = 2 WHERE id = ${approvedAd?.id}
        `,
      })

      await axios
      .post("/api/query", {
        query: `
            INSERT INTO T_NOTIFICACOES (FK_USUARIO, MENSAGEM, REDIRECT_TO) VALUES ("${approvedAd?.FK_USUARIO}", "Você possui um anúncio aprovado! <br/> <span style="color: #8234E9">clique aqui</span> para ver os detalhes 🚀", "/product/${approvedAd?.id}")
        `,
      })
      .then((res) => {
        setIsLoadingApprovedAd(false);
      })
      .catch((err) => {
        setIsLoadingApprovedAd(false);
      });

    getProducts();
  };

  const handleReproveAd = async (email) => {
    setIsLoadingApprovedAd(true);
    await axios
      .post("/api/query", {
        query: `
            UPDATE T_PRODUTOS SET FK_STATUS = 3 WHERE id = ${approvedAd?.id}
        `,
      })
      .then(async (res) => {

        await axios.post('/api/send-email-reprove-ad', {
          email: email,
          motivo: motivoRecusa
        }).then(() => {
          setIsLoadingApprovedAd(false);
        })

      })
      .catch((err) => {
        setIsLoadingApprovedAd(false);
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
                        <Chip color={"warning"} size="sm">
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
                          onPress={() => {
                            setApprovedAd(el);
                            onOpen();
                          }}
                          size="sm"
                        >
                          Aprovar / Reprovar
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
        <Modal size="3xl" isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Aprovar anúncio - {approvedAd?.TITULO}
                </ModalHeader>
                <ModalBody>
                  <p>
                    Após a aprovação do anúncio, o produto será disponibilizado
                    no marketplace, permitindo a realização de vendas.
                  </p>
                  <Textarea value={motivoRecusa} onChange={(e) => setMotivoRecusa(e.target.value)} className="my-4" label={"Em caso de recusa, descreve para o vendedor o motivo"} placeholder="Digite aqui" labelPlacement="outside" />
                </ModalBody>
                <ModalFooter>
                  <Button
                    isLoading={isLoadingApprovedAd}
                    color="danger"
                    variant="light"
                    onPress={async () => {
                      await handleReproveAd(approvedAd?.EMAIL);
                      onClose();
                    }}
                  >
                    Recusar anúncio
                  </Button>
                  <Button
                    isLoading={isLoadingApprovedAd}
                    color="success"
                    className="text-white font-bold"
                    onPress={async () => {
                      await handleApproveAd();
                      onClose();
                    }}
                  >
                    Aprovar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

export default PendingAds;

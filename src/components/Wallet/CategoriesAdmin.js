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
  Pagination,
} from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

const CategoriesAdmin = () => {
  const [productsList, setProductsList] = useState([]);
  const [originalProductsList, setOriginalProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingApproved, setIsLoadingApproved] = useState(false);

  const [withdrawSelected, setWithdrawSelected] = useState(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [page, setPage] = useState(1);

  const [type, setType] = useState(null)

  const fileInputRef = useRef(null);

  const getProducts = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
          SELECT * FROM T_CATEGORIAS
        `,
      })
      .then((res) => {
        setProductsList(res?.data?.results);
        setOriginalProductsList(res?.data?.results);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const handleCreateCategory = async () => {
    setIsLoadingApproved(true);
    const formData = new FormData();
    formData.append("file", withdrawSelected?.BACKGROUND);
    formData.append("upload_preset", "b650rwr0");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/matheussanchez/image/upload",
      formData
    );

    const imageBackground = response.data.secure_url;

    await axios
      .post("/api/query", {
        query: `
            INSERT INTO T_CATEGORIAS (NOME, BACKGROUND) VALUES ("${withdrawSelected?.NOME}", "${imageBackground}")
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

  const handleApprovedWithdraw = async () => {
    setIsLoadingApproved(true);
    await axios
      .post("/api/query", {
        query: `
            UPDATE T_CATEGORIAS SET NOME = "${withdrawSelected?.NOME}", BACKGROUND = "${withdrawSelected?.BACKGROUND}" WHERE id = ${withdrawSelected?.id}
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

  const handleDeleteCategory = async () => {
    
    await axios
      .post("/api/query", {
        query: `
            DELETE FROM T_CATEGORIAS WHERE id = ${withdrawSelected?.id}
        `,
      })

    getProducts();
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];

    setWithdrawSelected((prevState) => ({
      ...prevState,
      BACKGROUND: newFile,
    }));
  };

  useEffect(() => {
    getProducts();
  }, [page]);

  return (
    <>
      <div className="flex flex-col w-full ">
        <div className="w-full h-full flex flex-col lg:flex-col items-start justify-center gap-6">
          <div className="w-full flex justify-end">
            <Button
              onClick={() => {
                setWithdrawSelected(null);
                setType('create')
                onOpenChange();
              }}
              variant="bordered"
              className="border-purple-600 text-purple-600"
            >
              Adicionar categoria +
            </Button>
          </div>
          {!isLoading ? (
            <div className="w-full flex flex-col gap-2 items-end">
              <Input
                placeholder="Procure categorias aqui"
                onChange={(e) => {
                  const inputValue = e.target.value.toLowerCase();
                    const filteredList = inputValue.length === 0
                      ? originalProductsList
                      : productsList.filter((el) =>
                          el?.NOME.toLowerCase().includes(inputValue)
                        );
                    setProductsList(filteredList);           
                }}
              />
              <Table>
                <TableHeader>
                  <TableColumn>CATEGORIA</TableColumn>
                  <TableColumn>AÇÃO</TableColumn>
                </TableHeader>
                <TableBody>
                  {productsList?.length > 0 &&
                    productsList?.map((el) => (
                      <TableRow key="1">
                        <TableCell>{el?.NOME}</TableCell>

                        <TableCell className="flex gap-2">
                          <Button
                            onPress={() => {
                              setType('update')
                              onOpen();
                              setWithdrawSelected(el);
                            }}
                            size="sm"
                          >
                            Editar
                          </Button>
                          <Button
                            onPress={() => {
                              setWithdrawSelected(el);
                              handleDeleteCategory()
                            }}
                            size="sm"
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
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
                  Editar categoria
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col items-center justify-center gap-6 w-full">
                    <div className="flex flex-col items-center justify-center gap-4 w-full">
                      <Input
                        label={"Nome da categoria"}
                        labelPlacement="outside"
                        variant="bordered"
                        value={withdrawSelected?.NOME}
                        onChange={(e) => {
                          setWithdrawSelected((prevState) => ({
                            ...prevState,
                            NOME: e.target.value,
                          }));
                        }}
                      />
                      {withdrawSelected?.BACKGROUND && (
                        <div
                          className="h-60 rounded-lg"
                          style={{
                            width: "100%",
                            backgroundImage: `url(${
                              typeof withdrawSelected.BACKGROUND === "string" &&
                              withdrawSelected.BACKGROUND.startsWith("http")
                                ? withdrawSelected.BACKGROUND
                                : URL?.createObjectURL(
                                    withdrawSelected.BACKGROUND
                                  )
                            })`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        ></div>
                      )}
                      <Button
                        onPress={handleButtonClick}
                        color="primary"
                        className="text-white font-bold"
                        isDisabled={!withdrawSelected?.NOME}
                      >
                        Alterar foto
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        accept="image/png, image/jpeg, image/jpg"
                      />
                    </div>
                  </div>
                </ModalBody>
                <Divider className="mt-8" />
                <ModalFooter>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-4 mb-2">
                      <Button
                        isLoading={isLoadingApproved}
                        onPress={async () => {
                          if(type === 'update'){
                            await handleApprovedWithdraw();
                          } else {
                            await handleCreateCategory()
                          }
                          
                          onClose();
                        }}
                        color="primary"
                        className="text-white font-bold"
                      >
                        Salvar
                      </Button>
                    </div>
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

export default CategoriesAdmin;

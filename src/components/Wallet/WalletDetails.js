import { formatCurrency } from "@/utils/formatCurrency";
import { loggedID } from "@/utils/useAuth";
import {
  Button,
  Card,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const WalletDetails = () => {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [isOpenModalSaque, setIsOpenModalSaque] = useState(false);
  const [modalSaqueForm, setModalSaqueForm] = useState({});
  const [isLoadingSaque, setIsLoadingSaque] = useState(false)

  const [isOpenModalComoFunciona, setIsOpenModalComoFunciona] = useState(false);

  const saldo_disponivel_para_saque = userData?.SALDO_DISPONIVEL + userData?.SALDO_DISPONIVEL_AFILIADO

  const handleSendSaque = async () => {
    setIsLoadingSaque(true)
    if(!!modalSaqueForm?.tipoChave && !!modalSaqueForm?.chave && !!modalSaqueForm?.valorDoSaque){
      if(Number(modalSaqueForm?.valorDoSaque) > 0 && Number(modalSaqueForm?.valorDoSaque) <= Number(saldo_disponivel_para_saque)){
        await axios
          .post("/api/query", {
            query: `
              INSERT INTO T_SAQUES 
              (VALOR, FK_USUARIO, TIPO_DE_CHAVE, CHAVE_PIX) 
              VALUES 
              ("${modalSaqueForm?.valorDoSaque}", "${loggedID}", "${modalSaqueForm?.tipoChave}", "${modalSaqueForm?.chave}")
            `,
          })
          .then((res) => {
            toast.success("Solicitação enviada!")
            setIsLoadingSaque(false);
            getUserData()
          });
      } else {
        setIsLoadingSaque(false);
        toast.error("Saldo indisponivel")
      }
    } else {
      setIsLoadingSaque(false);
    }
  }

  const getUserData = async () => {
    setIsLoading(true);
    await axios
      .post("/api/query", {
        query: `
        SELECT 
          (SELECT COALESCE(SUM(CASE WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 120 THEN VALOR_A_RECEBER ELSE 0 END), 0) FROM T_VENDAS WHERE FK_USUARIO_VENDEDOR = "${loggedID}" AND FK_STATUS = 2 AND (REEMBOLSADO = 0 OR REEMBOLSADO IS NULL)) AS SALDO_DISPONIVEL,
          (SELECT COALESCE(SUM(CASE WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 120 THEN VALOR_AFILIADO ELSE 0 END), 0) FROM T_VENDAS WHERE FK_USUARIO_AFILIADO = "${loggedID}" AND FK_STATUS = 2 AND (REEMBOLSADO = 0 OR REEMBOLSADO IS NULL)) AS SALDO_DISPONIVEL_AFILIADO,
          (SELECT COALESCE(SUM(VALOR_AFILIADO), 0) FROM T_VENDAS WHERE FK_USUARIO_AFILIADO = "${loggedID}" AND FK_STATUS = 2 AND (REEMBOLSADO = 0 OR REEMBOLSADO IS NULL)) AS SALDO_AFILIADO,
          (SELECT COALESCE(SUM(VALOR_A_RECEBER), 0) FROM T_VENDAS WHERE FK_USUARIO_VENDEDOR = "${loggedID}" AND FK_STATUS = 2 AND (REEMBOLSADO = 0 OR REEMBOLSADO IS NULL)) AS SALDO;
        `,
      })
      .then((res) => {
        setUserData(res?.data?.results?.[0]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setModalSaqueForm({})
  },[isOpenModalSaque])

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <>
      <div className="flex flex-col w-full gap-6">
        <div className="w-full h-full flex flex-col lg:flex-row items-start justify-center gap-6">
          <div className="w-full flex flex-col gap-4">
            <Card className="w-full h-full flex items-start justify-center p-8 gap-2">
              <h1 className="font-bold text-md">
                Saldo disponivel para saque (Produtos)
              </h1>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <h1 className="text-xl">{formatCurrency(userData?.SALDO_DISPONIVEL)}</h1>
              )}
            </Card>
            {/* <Button
              onPress={() => {
                setIsOpenModalSaque((prevState) => !prevState);
              }}
              color="primary"
              className="text-white font-bold"
            >
              Solicitar saque
            </Button> */}
          </div>
          <div className="w-full flex flex-col gap-4">
            <Card className="w-full h-full flex items-start justify-center p-8 gap-2">
              <h1 className="font-bold text-md">Saldo (Produtos)</h1>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <h1 className="text-xl">{formatCurrency(userData?.SALDO)}</h1>
              )}
            </Card>
            {/* <Button onPress={() => {
                setIsOpenModalComoFunciona((prevState) => !prevState);
              }} className="text-purple-600 bg-transparent border-2 border-purple-600 font-bold">
              Como funciona o saldo na ENDEX?
            </Button> */}
          </div>
        </div>


        <div className="w-full h-full flex flex-col lg:flex-row items-start justify-center gap-6">
          <div className="w-full flex flex-col gap-4">
            <Card className="w-full h-full flex items-start justify-center p-8 gap-2">
              <h1 className="font-bold text-md">
                Saldo disponivel para saque (Afiliado)
              </h1>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <h1 className="text-xl">{formatCurrency(userData?.SALDO_DISPONIVEL_AFILIADO)}</h1>
              )}
            </Card>
            <Button
              onPress={() => {
                setIsOpenModalSaque((prevState) => !prevState);
              }}
              color="primary"
              className="text-white font-bold"
            >
              Solicitar saque
            </Button>
            
          </div>
          <div className="w-full flex flex-col gap-4">
            <Card className="w-full h-full flex items-start justify-center p-8 gap-2">
              <h1 className="font-bold text-md">Saldo (Afiliado)</h1>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <h1 className="text-xl">{formatCurrency(userData?.SALDO_AFILIADO)}</h1>
              )}
            </Card>
            <Button onPress={() => {
                setIsOpenModalComoFunciona((prevState) => !prevState);
              }} className="text-purple-600 bg-transparent border-2 border-purple-600 font-bold">
              Como funciona o saldo na ENDEX?
            </Button>
          </div>
        </div>
      </div>
      <Modal
        size="xl"
        isOpen={isOpenModalSaque}
        onOpenChange={() => {
          setIsOpenModalSaque((prevState) => !prevState);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h1>Insira os dados para realização de saque</h1>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center justify-center gap-4 w-full">
                  <Select
                    value={modalSaqueForm?.tipoChave}
                    onChange={(e) => {
                      setModalSaqueForm((prevState) => ({
                        ...prevState,
                        tipoChave: e.target.value,
                      }));
                    }}
                    variant="bordered"
                    label="Selecione o tipo da chave PIX"
                    labelPlacement="outside"
                  >
                    <SelectItem key={"Email"} value={"Email"}>Email</SelectItem>
                    <SelectItem key={"CPF"} value={"CPF"}>CPF</SelectItem>
                    <SelectItem key={"CNPJ"} value={"CNPJ"}>CNPJ</SelectItem>
                    <SelectItem key={"Telefone"} value={"Telefone"}>Telefone</SelectItem>
                    <SelectItem key={"Chave aleatória"} value={"Chave aleatória"}>
                      Chave aleatória
                    </SelectItem>
                  </Select>
                  <div className="flex items-center justify-center gap-4 w-full">
                    <Input
                      onChange={(e) => {
                        setModalSaqueForm((prevState) => ({
                          ...prevState,
                          chave: e.target.value,
                        }));
                      }}
                      value={modalSaqueForm?.chave}
                      label={"Chave PIX"}
                      labelPlacement="outside"
                      variant="bordered"
                    />
                  </div>
                  <div className="flex flex-col items-start justify-center gap-4 w-full">
                    <Input
                      onChange={(e) => {
                        setModalSaqueForm((prevState) => ({
                          ...prevState,
                          valorDoSaque: e.target.value,
                        }));
                      }}
                      value={modalSaqueForm?.valorDoSaque}
                      label={"Valor do saque"}
                      labelPlacement="outside"
                      variant="bordered"
                      //value={withdrawSelected?.VALOR}
                    />
                    <p className="text-sm font-bold">
                      Saldo disponível para saque: 
                      {formatCurrency(saldo_disponivel_para_saque)}
                    </p>
                  </div>
                </div>
              </ModalBody>
              <Divider className="mt-8" />
              <ModalFooter>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-4 mb-2">
                    <Button
                      onPress={async () => {
                        await handleSendSaque()
                        onClose();
                      }}
                      isLoading={isLoadingSaque}
                      color="success"
                      className="text-white font-bold"
                    >
                      Enviar solicitação de saque
                    </Button>
                  </div>
                  <p className="text-sm opacity-70">
                    Sua solicitação será enviada e o saque será realizado em até
                    7 dias
                  </p>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        size="xl"
        isOpen={isOpenModalComoFunciona}
        onOpenChange={() => {
          setIsOpenModalComoFunciona((prevState) => !prevState);
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h1>Como o saldo funciona na ENDEX?</h1>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center justify-center gap-4 w-full">
                  <p>O saldo representa a o montante de todas as transações de vendas realizadas. Após um período de 5 dias a partir da aprovação de uma venda, o valor correspondente estará disponível para saque. É importante ressaltar que os titulares da conta têm um prazo de até 7 dias para receber a transação do valor que está disponível para saque após a solicitação.</p>
                </div>
              </ModalBody>
              <Divider className="mt-8" />
              <ModalFooter>
               
                    <Button
                      onPress={async () => {
                        onClose();
                      }}
                      variant="bordered"
                      color="primary"
                    >
                      Voltar
                    </Button>
                 
                
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default WalletDetails;

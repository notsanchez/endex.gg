import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Input,
    Button
} from "@nextui-org/react";
const VerifyAccount = () => {
    const router = useRouter();

    const user_id = router?.query?.id;

    const [canView, setCanView] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        if (user_id) {
            const verifyUser = async () => {
                await axios
                    .post("/api/query", {
                        query: `
                SELECT * FROM T_USUARIOS WHERE id = "${user_id}"
            `,
                    })
                    .then(async (res) => {
                        if (res?.data?.results?.[0]?.FORGOT_PASS != 1) {
                            router?.push('/')
                        } else {
                            setCanView(true)
                        }
                    })
                    .catch(() => { });
            };

            verifyUser();
        }
    }, [user_id]);

    const updatePassword = async () => {
        if (password === confirmPassword) {
            await axios
                .post("/api/query", {
                    query: `
            UPDATE T_USUARIOS SET PASSWORD = "${password}", FORGOT_PASS = 0 WHERE id = "${user_id}"
          `,
                })
                .then(async (res) => {
                    if (res?.data?.results) {
                        router?.push('/')
                    }
                })
        }

    };


    return (
        <div className="w-full h-[80vh] flex items-center justify-center">
            {canView && (
                <div className="flex flex-col gap-4 w-[30%] items-center justify-center">
                    <h1 className="text-2xl font-bold">Redefinir senha</h1>
                    <Input value={password} onChange={(e) => setPassword(e.target.value)} variant="bordered" type="password" label={'Nova senha'} labelPlacement="outside" placeholder="Digite sua nova senha" />
                    <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} variant="bordered" type="password" label={'Confirmar nova senha'} labelPlacement="outside" placeholder="Confirme sua nova senha" />

                    <Button onClick={() => updatePassword()} color="primary" className="text-white font-bold">Redefinir senha</Button>
                </div>
            )}

        </div>
    );
};

export default VerifyAccount;

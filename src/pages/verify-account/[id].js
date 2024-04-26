import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import toast from "react-hot-toast";

const VerifyAccount = () => {
  const router = useRouter();

  const user_id = router?.query?.id;

  useEffect(() => {
    if (user_id) {
      const activeUser = async () => {
        await axios
          .post("/api/query", {
            query: `
                UPDATE T_USUARIOS SET ACTIVE = 1 WHERE id = "${user_id}"
            `,
          })
          .then(async () => {
            await axios
              ?.post("/api/query", {
                query: `SELECT NICKNAME FROM T_USUARIOS WHERE id = "${user_id}"`,
              })
              .then((res) => {
                localStorage.setItem("SESSION_ID_V2", user_id);
                localStorage.setItem(
                  "SESSION_NAME_V2",
                  res?.data?.results?.[0]?.NICKNAME
                );
                toast.success("Verificado com sucesso!")
                router?.push("/")
              });
          })
          .catch(() => {});
      };

      activeUser();
    }
  }, [user_id]);

  return <div></div>;
};

export default VerifyAccount;

import React, { useEffect, useState } from 'react'
import { Button, Divider } from '@nextui-org/react'
import { loggedID } from '@/utils/useAuth';
import axios from 'axios';
import { formatCurrency } from '@/utils/formatCurrency';
import { useRouter } from 'next/router';

export const CartComp = () => {

    const [cart, setCart] = useState([])

    const router = useRouter()

    const getCartItens = async () => {
        await axios
            .post("/api/query", {
                query: `
                SELECT COALESCE((
                SELECT TVP.VALOR 
                FROM T_VARIACOES_PRODUTO TVP 
                WHERE TVP.FK_PRODUTO = TP.id 
                AND TVP.ACTIVE = 1
                ORDER BY TVP.created_at DESC 
                LIMIT 1
                ), TP.PRECO) AS PRECO, TV.id, TP.TITULO FROM T_VENDAS TV INNER JOIN T_PRODUTOS TP ON TP.id = TV.FK_PRODUTO WHERE TV.FK_USUARIO_COMPRADOR = "${loggedID}" AND TV.FK_STATUS = 1
            `,
            })
            .then((res) => {
                setCart(res?.data?.results);
            })
            .catch((err) => {
            });
    };

    useEffect(() => {
        if (loggedID) {
            getCartItens()
        }
    }, [loggedID])

    return (
        <div className="w-[100%] lg:w-[70%] flex flex-col gap-4 items-center justify-center py-12 mb-24 mt-32">

            <div className='w-full flex items-center justify-between'>
                <h1 className='text-4xl'>Carrinho</h1>
            </div>

            <Divider />
            {cart?.map((el) => (
                <div className='w-full flex items-center justify-between p-12 border rounded-lg'>
                    <h1 className='font-bold'>{el?.TITULO}</h1>

                    <h1>{formatCurrency(el?.PRECO)}</h1>

                    <Button onClick={() => {
                        router?.push(`/order/${el?.id}`)
                    }} className='bg-purple-600 text-white'>Finalizar compra</Button>
                </div>
            ))}
        </div>
    )
}

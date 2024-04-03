import { Button } from '@nextui-org/react'
import React from 'react'

const Footer = () => {
  return (
    <div className='w-full bg-zinc-800 flex flex-col items-center justify-center gap-2 mt-24'>
        <div className='w-full h-full flex items-center justify-center gap-6 py-12'>
        <div className='flex flex-col w-[30%] gap-4'>
            <h1 className='text-white font-bold'>SOBRE</h1>
            <p className='text-white'>Somos a solução para o mercado digital, disponibilizando uma plataforma moderna que permite que o comprador receba pelo produto / serviço desejado, e que o vendedor receba para sua venda. Tudo isso com praticidade e segurança.</p>
        </div>
        <div className='w-[2px] h-[80%] bg-zinc-100'></div>
        <div className='flex flex-col w-[30%] gap-4 items-center'>
            <h1 className='text-white font-bold'>ACESSOS</h1>
            <Button className='w-full text-white' variant='light'>Minhas compras</Button>
            <Button className='w-full text-white' variant='light'>Afiliados</Button>
            <Button className='w-full text-white' variant='light'>Vendas</Button>
        </div>
        </div>
        <div className='w-full flex items-center justify-center py-4 border-t-1'>
            <h1 className='text-white opacity-70'>© ENDEX 2024 | TODOS OS DIREITOS RESERVADOS</h1>
        </div>
    </div>
  )
}

export default Footer
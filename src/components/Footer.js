import { isLogged } from '@/utils/useAuth'
import { Button, Divider } from '@nextui-org/react'
import { useRouter } from 'next/router'
import React from 'react'

const Footer = ({onOpen}) => {

  const router = useRouter()

  return (
    <div className='w-full h-full flex flex-col gap-12'>
      <Divider />
      <div className='w-full flex flex-col lg:flex-row gap-4 items-center justify-center'>
        <div className='w-[90%] lg:w-[30%] p-4 border-1 rounded-lg flex flex-col items-center justify-center'>
          <h1 className='font-bold'>Compra segura</h1>
          <h1 className='text-center opacity-70'>Entrega garantida ou o seu dinheiro de volta.</h1>
        </div>
        <div className='w-[90%] lg:w-[30%] p-4 border-1 rounded-lg flex flex-col items-center justify-center'>
          <h1 className='font-bold'>Suporte 24 horas</h1>
          <h1 className='text-center opacity-70'>Equipe pronta para te atender sempre que precisar.</h1>
        </div>
        <div className='w-[90%] lg:w-[30%] p-4 border-1 rounded-lg flex flex-col items-center justify-center'>
          <h1 className='font-bold'>Programa de afiliados</h1>
          <h1 className='text-center opacity-70'>Seja recompensado por vender produtos como afiliado.</h1>
        </div>
      </div>
    <div className='w-full bg-zinc-800 flex flex-col items-center justify-center gap-2'>
        <div className='w-full h-full flex flex-col lg:flex-row items-center justify-center gap-6 py-12'>
        <div className='flex flex-col lg:w-[30%] w-[80%] gap-4'>
            <h1 className='text-white font-bold'>SOBRE</h1>
            <p className='text-white'>
              Nós oferecemos a solução ideal para o mercado digital, proporcionando uma plataforma moderna que garante que o comprador receba seu produto/serviço desejado, enquanto o vendedor recebe pelo seu trabalho. Tudo isso de maneira conveniente e segura.
            </p>
        </div>
        <div className='w-[2px] h-[80%] bg-zinc-100'></div>
        <div className='flex flex-col w-[30%] gap-4 items-center'>
            <h1 className='text-white font-bold'>ACESSOS</h1>
            <Button onPress={() => {
              if(!isLogged){
                onOpen()
              } else {
                router?.push('/wallet?page=my-shopping')
              }
            }} className='w-full text-white' variant='light'>Minhas compras</Button>
            <Button onPress={() => {
              if(!isLogged){
                onOpen()
              } else {
                router?.push('/wallet?page=affiliate')
              }
            }} className='w-full text-white' variant='light'>Afiliados</Button>
            <Button onPress={() => {
              if(!isLogged){
                onOpen()
              } else {
                router?.push('/wallet?page=my-sales')
              }
            }} className='w-full text-white' variant='light'>Vendas</Button>
        </div>
        </div>
        <div className='w-full flex items-center justify-center py-4 border-t-1'>
            <h1 className='text-white opacity-70'>© ENDEX 2024 | TODOS OS DIREITOS RESERVADOS</h1>
        </div>
    </div>
    </div>
  )
}

export default Footer
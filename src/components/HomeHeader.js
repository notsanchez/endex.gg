import { Button } from '@nextui-org/react'
import { useRouter } from 'next/router'
import React from 'react'

const HomeHeader = () => {

  const router = useRouter()

  return (
    <div className='w-[100%] lg:w-[40%] flex items-center justify-center py-24 mb-6 px-8 lg:px-0'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <h1 className='text-4xl font-bold text-center'>Explore, Troque e Divirta-se</h1>
          {/* <h1 className='text-4xl font-bold text-center'>Seu Mercado Digital Completo!</h1> */}
          <h1 className='text-md text-[#8234E9] text-center'>Encontre o que precisa, negocie com confiança e aproveite ao máximo sua experiência de compra e venda de contas, jogos e muito mais</h1>
          <Button onPress={() => {
            router.push("/product-list")
          }} color='primary' className='text-white rounded-full mt-4 font-bold'>Ver produtos populares</Button>
        </div>
    </div>
  )
}

export default HomeHeader
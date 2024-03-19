import { Button } from '@nextui-org/react'
import React from 'react'

const HomeHeader = () => {
  return (
    <div className='w-[100%] lg:w-[60%] flex items-center justify-center py-12 mb-6'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <h1 className='text-4xl font-bold text-center'>compre, venda, compartilhe</h1>
          <h1 className='text-xl text-[#8234E9] text-center'>contas, jogos, gift cards, gold, itens digitais e mais!</h1>
          <Button color='primary' className='text-white rounded-full mt-4 font-bold'>Ver todos os produtos</Button>
        </div>
    </div>
  )
}

export default HomeHeader
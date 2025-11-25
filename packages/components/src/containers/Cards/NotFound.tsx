import { Link } from '@tbe/components'
import { RiAlarmWarningFill } from 'react-icons/ri'
import React from 'react'

const NotFound = () => {
  return (
    <section className='bg-white'>
    <div className='layout flex min-h-screen flex-col items-center justify-center text-center text-black'>
      <RiAlarmWarningFill
        className='drop-shadow-glow animate-flicker text-red-500'
        size={60}
      />
      <h1 className='mt-8 text-4xl md:text-6xl'>Page Not Found</h1>
      <Link className='mt-4 md:text-lg' href='/'>
        Back to Home
      </Link>
    </div>
  </section>
  )
}

export default NotFound
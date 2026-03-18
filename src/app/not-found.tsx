import Link from 'next/link'
import React from 'react'

export default function NotFound() {
    return (
        <div className='h-[calc(100vh-var(--spacing)*14)] w-screen flex items-center justify-center flex-col gap-2'>
            <h1 className='text-red-400 font-semibold'>404 | NOT FOUND</h1>
            <p className='text-muted-foreground max-w-100 text-center'>Opps! The page you are looking for does not exist. <Link className='underline text-blue-500' href="/">Go back?</Link></p>
        </div>
    )
}
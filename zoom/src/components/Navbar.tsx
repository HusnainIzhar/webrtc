import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from "next/link";
import React from 'react'

type Props = {}

const Navbar = (props: Props) => {
  return (
    <header className='shadow'>
        <div className='mx-auto flex h-14 max-w-5l items-center justify-between'>
            <Link href='/'><div>New Meeting</div></Link>
            <SignedIn>
                <div className='flex items-center gap-5'>
                    <Link href='/meetings'>Meetings</Link>
                    <UserButton/>
                </div>
            </SignedIn>
            <SignedOut><SignInButton/></SignedOut>
        </div>
    </header>
  )
}

export default Navbar
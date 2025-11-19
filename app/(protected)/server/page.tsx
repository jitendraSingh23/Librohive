import React from 'react'
import CurrentUser from '@/lib/auth'
import UserInfo from '@/components/user-info';
async function Page  () {
    const user = await CurrentUser();
  return (
    <UserInfo user={user} label='server component'/>
  )
}

export default Page
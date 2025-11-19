import { auth } from '@/auth';
const  CurrentUser =async ()=> {
    const session= await auth();

  return session?.user;
}

export default CurrentUser
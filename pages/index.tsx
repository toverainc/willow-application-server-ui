import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import LoadingSpinner from '../components/LoadingSpinner'

const Home: NextPage = () => {
    const router = useRouter()
    if (typeof window !== 'undefined') {
        router.push('/admin');
    }
    return <div><LoadingSpinner></LoadingSpinner></div>
}

export default Home

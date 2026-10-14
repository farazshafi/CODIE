import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#0d0f12]">
                {children}
            </main>
            <Footer />
        </>
    )
}

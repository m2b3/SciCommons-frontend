import Footer from '@/components/common/Footer';
import NavBar from '@/components/common/NavBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavBar />
      {children}
      <Footer />
    </div>
  );
}

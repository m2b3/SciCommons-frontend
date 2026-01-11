// import Footer from '@/components/common/Footer';
import NavBar from '@/components/common/NavBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div vaul-drawer-wrapper="" className="bg-common-background">
      <NavBar />
      <main className="flex-grow pb-16 md:pb-0">{children}</main>
      {/* <Footer /> */}
    </div>
  );
}

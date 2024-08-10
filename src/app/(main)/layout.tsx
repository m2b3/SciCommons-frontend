import NavBar from '@/components/common/NavBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavBar />
      {children}
    </div>
  );
}

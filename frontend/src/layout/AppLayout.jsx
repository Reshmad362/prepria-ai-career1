import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Footer from '../components/Footer';
import { AlertTriangle } from 'lucide-react';

export default function AppLayout() {
  const isDemo = localStorage.getItem('isDemo') === 'true';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen relative overflow-hidden">
        <TopNavbar />
        {isDemo && (
          <div className="w-full bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-500 py-2 px-8 flex items-center justify-center gap-2 font-medium text-sm shrink-0">
            <AlertTriangle className="w-4 h-4" /> Demo Mode – Limited functionality. <a href="/login" className="underline ml-1">Sign in to unlock full features</a>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col w-full relative">
          <main className="flex-1 p-6 sm:p-8 w-full max-w-7xl mx-auto">
            {/* Main Content Area */}
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

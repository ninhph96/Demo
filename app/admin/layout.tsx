'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Megaphone, ShoppingCart, 
  Package, Warehouse, Truck, Sparkles, Menu, 
  Settings 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/campaigns', icon: Megaphone, label: 'Chiến dịch' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { href: '/admin/settings', icon: Settings, label: 'Cấu hình Web' },
  { href: '/admin/group-purchase', icon: Package, label: 'Gom đơn' },
  { href: '/admin/warehouse', icon: Warehouse, label: 'Kho hàng' },
  { href: '/admin/shipments', icon: Truck, label: 'Vận chuyển' }
]

function Sidebar({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
  const pathname = usePathname()
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*').single()
      if (data) setSettings(data)
    }
    fetchSettings()
  }, [])

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3" onClick={onItemClick}>
          <div className="h-10 w-10 rounded-full bg-[#8B7CFF] flex items-center justify-center shadow-lg overflow-hidden">
             {settings?.logo_url ? (
               <img src={settings.logo_url} className="w-full h-full object-cover" alt="Logo" />
             ) : (
               <Sparkles className="h-5 w-5 text-white" />
             )}
          </div>
          <div>
            <span className="font-black text-sm text-gray-800 uppercase italic block leading-none">
              {settings?.site_name || 'Kpop GO'}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 block">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                isActive
                  ? "bg-[#8B7CFF] text-white shadow-lg shadow-purple-100"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <Link href="/">
          <Button variant="outline" className="w-full rounded-2xl border-gray-200 font-bold uppercase text-[10px]">
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 hidden lg:block">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 lg:hidden bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#8B7CFF] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-black italic uppercase text-gray-800">Admin</span>
          </Link>
          
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-gray-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-none">
              <Sidebar onItemClick={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <Suspense fallback={<div className="p-10 text-center font-black uppercase text-gray-300">Đang tải...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Megaphone, ShoppingCart, 
  Package, Warehouse, Truck, Settings, Landmark, Sparkles 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AdminSidebar() {
  const pathname = usePathname()
  const [settings, setSettings] = useState<any>(null)

  // Lấy Logo và Tên Web từ Supabase để hiển thị ở đầu Sidebar
  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*').single()
      if (data) setSettings(data)
    }
    fetchSettings()
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Megaphone, label: 'Chiến dịch', href: '/admin/campaigns' },
    { icon: ShoppingCart, label: 'Đơn hàng', href: '/admin/orders' },
    { icon: Landmark, label: 'Ngân hàng', href: '/admin/banks' },
    { icon: Settings, label: 'Cấu hình Web', href: '/admin/settings' },
    { icon: Package, label: 'Gom đơn', href: '/admin/groups' },
    { icon: Warehouse, label: 'Kho hàng', href: '/admin/warehouse' },
    { icon: Truck, label: 'Vận chuyển', href: '/admin/shipping' },
  ]

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3 border-b">
        {/* LOGO ĐỘNG */}
        <div className="w-10 h-10 rounded-full bg-[#8B7CFF] flex items-center justify-center text-white shadow-lg overflow-hidden">
           {settings?.logo_url ? (
             <img src={settings.logo_url} className="w-full h-full object-cover" alt="Logo" />
           ) : (
             <Sparkles className="w-6 h-6" />
           )}
        </div>
        <div>
          <h1 className="font-black text-gray-800 leading-none uppercase italic text-sm">
            {settings?.site_name || 'Kpop GO'}
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
                isActive 
                ? 'bg-[#8B7CFF] text-white shadow-lg shadow-purple-100' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

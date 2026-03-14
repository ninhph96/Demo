'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/campaigns', label: 'Chiến dịch' },
  { href: '/track', label: 'Tra cứu đơn' }
]

// Thêm { settings }: any để nhận dữ liệu từ trang chủ truyền vào
export function Header({ settings }: any) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo & Site Name */}
        <Link href="/" className="flex items-center gap-3">
          <img 
            src={settings?.logo_url || "/Demo/logo.png"} 
            alt="Logo" 
            className="h-10 w-10 rounded-xl object-cover shadow-sm" 
          />
          <div className="flex flex-col">
            <span className="font-black text-lg text-gray-800 leading-none uppercase italic tracking-tighter">
              {settings?.site_name || "FANGIRL'S DIARY"}
            </span>
            <a 
              href="https://www.facebook.com/fangirlsdiaryshop" 
              target="_blank" 
              className="text-[9px] text-[#0084FF] font-bold flex items-center gap-1 hover:underline mt-0.5"
            >
              fb.com/fangirlsdiaryshop
            </a>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== '/' && pathname.startsWith(link.href))
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold uppercase italic transition-all",
                  isActive
                    ? "bg-[#8B7CFF]/10 text-[#8B7CFF]"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-6 w-6 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-none">
            {navLinks.map((link) => (
              <DropdownMenuItem key={link.href} asChild className="rounded-xl focus:bg-[#8B7CFF]/10 focus:text-[#8B7CFF]">
                <Link href={link.href} className="font-bold py-3 uppercase italic text-xs">{link.label}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem asChild className="mt-2 bg-blue-50 text-[#0084FF] rounded-xl">
              <a href="https://www.facebook.com/fangirlsdiaryshop" target="_blank" className="flex items-center gap-2 font-black py-3 uppercase italic text-[10px]">
                <Facebook className="h-4 w-4" /> Fanpage Facebook
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

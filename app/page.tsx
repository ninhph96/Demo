'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CampaignCard } from '@/components/campaign-card'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>(null) // State lưu cấu hình giao diện

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // 1. Lấy cấu hình giao diện (Header, Banner, Màu sắc, Logo)
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .single()
      if (settingsData) setSettings(settingsData)

      // 2. Lấy danh sách chiến dịch đang mở
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*, campaign_options(*)')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })
      if (campaignsData) setCampaigns(campaignsData)
      
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col">
      {/* 1. Header động lấy Site Name và Logo từ Admin */}
      <Header settings={settings} /> 

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        
        {/* Banner Hero - DỮ LIỆU ĐỘNG TỪ ADMIN */}
        <section 
          className="relative overflow-hidden rounded-[40px] p-8 md:p-12 text-white shadow-2xl transition-all duration-500"
          style={{ 
            backgroundColor: settings?.hero_bg_color || '#8B7CFF',
            backgroundImage: `linear-gradient(to bottom right, ${settings?.hero_bg_color || '#8B7CFF'}, #6366F1)` 
          }}
        >
          <div className="relative z-10 max-w-lg">
            <Badge className="bg-white/20 text-white border-none rounded-lg mb-4 backdrop-blur-md">
              {settings?.site_name || 'Ninh Order Hải Phòng'}
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight italic uppercase">
              {settings?.hero_title ? (
                settings.hero_title.split('<br/>').map((line: string, i: number) => (
                  <span key={i}>{line}<br/></span>
                ))
              ) : (
                <>Đặt hàng Kpop<br/>Dễ dàng hơn</>
              )}
            </h1>
            
            <p className="text-white/80 font-medium max-w-sm">
              {settings?.hero_subtitle || 'Săn album, goods giá gốc từ Hàn Quốc. Nhận hàng tại Hải Phòng nhanh chóng.'}
            </p>
          </div>

          {/* Hiệu ứng hình tròn trang trí */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-10 top-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        </section>

        {/* Danh sách Grid sản phẩm */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-800 italic uppercase">Chiến dịch đang mở</h2>
            <Badge variant="outline" className="border-gray-200 text-gray-400">
              {campaigns.length} sản phẩm
            </Badge>
          </div>

          {loading ? (
            /* Hiệu ứng chờ khi đang tải dữ liệu */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-200 rounded-[32px]" />
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {campaigns.map((c: any) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          ) : (
            /* Khi không có sản phẩm nào */
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
              <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold uppercase italic">Chưa có chiến dịch nào đang mở</p>
            </div>
          )}
        </div>
      </main>

      {/* 2. Footer động lấy text từ Admin */}
      <footer className="py-10 text-center border-t border-gray-100 mt-10">
        <div className="container mx-auto space-y-4">
           {settings?.logo_url && (
             <img src={settings.logo_url} alt="logo" className="h-8 w-8 mx-auto opacity-30 grayscale" />
           )}
           <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
            {settings?.footer_text || '© 2026 Thạch Thảo'}
           </p>
        </div>
        {/* Social Connect Box */}
<section className="container mx-auto px-4 mb-10">
  <div className="bg-white rounded-[40px] p-8 shadow-xl border-2 border-[#8B7CFF]/5 flex flex-col md:flex-row items-center justify-between gap-6">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0084FF] to-[#00C6FF] flex items-center justify-center text-white shadow-lg">
        <Facebook className="h-8 w-8" />
      </div>
      <div>
        <h3 className="font-black italic uppercase text-gray-800">Thạch Thảo Order Kpop</h3>
        <p className="text-sm text-gray-400 font-medium">Theo dõi Fanpage để cập nhật deal hời mỗi ngày!</p>
      </div>
    </div>
    
    <Button 
      asChild
      className="rounded-full bg-[#0084FF] hover:bg-[#0073E6] px-8 h-12 font-black italic shadow-lg shadow-blue-100"
    >
      <a href="https://www.facebook.com/fangirlsdiaryshop" target="_blank">
        GHÉ THĂM FANPAGE
      </a>
    </Button>
  </div>
</section>
      </footer>
    </div>
  )
}

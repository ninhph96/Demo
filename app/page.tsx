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
      
      // 1. Lấy cấu hình giao diện (Header, Banner, Màu sắc)
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
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Truyền site_name động vào Header nếu Ninh có code Header nhận props */}
      <Header /> 

      <main className="container mx-auto px-4 py-8 space-y-8">
        
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

          {/* Decor Circles */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-10 top-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        </section>

        {/* Danh sách Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-800 italic uppercase">Chiến dịch đang mở</h2>
            <Badge variant="outline" className="border-gray-200 text-gray-400">
              {campaigns.length} sản phẩm
            </Badge>
          </div>

          {loading ? (
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
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
              <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold uppercase italic">Chưa có chiến dịch nào đang mở</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer động */}
      <footer className="py-10 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
        {settings?.footer_text || '© 2026 Thạch Thảo'}
      </footer>
    </div>
  )
}

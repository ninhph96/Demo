'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CampaignCard } from '@/components/campaign-card'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: settingsData } = await supabase.from('site_settings').select('*').single()
      if (settingsData) setSettings(settingsData)

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
      <Header settings={settings} /> 

      <main className="container mx-auto px-4 py-8 flex-1 space-y-12">
        {/* Banner Hero */}
        <section 
          className="relative overflow-hidden rounded-[40px] p-8 md:p-12 text-white shadow-2xl"
          style={{ 
            backgroundColor: settings?.hero_bg_color || '#8B7CFF',
            backgroundImage: `linear-gradient(to bottom right, ${settings?.hero_bg_color || '#8B7CFF'}, #6366F1)` 
          }}
        >
          <div className="relative z-10 max-w-lg">
            <Badge className="bg-white/20 text-white border-none rounded-lg mb-4 backdrop-blur-md">
              {settings?.site_name || 'Thạch Thảo'}
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
              {settings?.hero_subtitle || 'Săn album, goods giá gốc từ Hàn Quốc.'}
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </section>

        {/* Danh sách Sản phẩm */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-800 italic uppercase">Chiến dịch đang mở</h2>
            <Badge variant="outline" className="border-gray-200 text-gray-400 font-bold">
              {campaigns.length} SẢN PHẨM
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
              <p className="text-gray-400 font-bold uppercase italic tracking-widest">Chưa có đợt gom mới</p>
            </div>
          )}
        </div>

        {/* Social Connect Box đưa ra ngoài Footer cho đẹp */}
        <section className="pt-10">
          <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0084FF] to-[#00C6FF] flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <Facebook className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-black italic uppercase text-gray-800">Fangirl's Diary Shop</h3>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-tighter">Deal hời Kpop mỗi ngày trên Fanpage!</p>
              </div>
            </div>
            <Button asChild className="rounded-full bg-[#0084FF] hover:bg-[#0073E6] px-10 h-14 font-black italic shadow-xl shadow-blue-100 uppercase text-xs">
              <a href="https://www.facebook.com/fangirlsdiaryshop" target="_blank">Ghé thăm Fanpage</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center border-t border-gray-50 mt-10">
        <div className="container mx-auto space-y-4">
           {settings?.logo_url && (
             <img src={settings.logo_url} alt="logo" className="h-8 w-8 mx-auto opacity-20 grayscale hover:opacity-100 transition-opacity" />
           )}
           <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
            {settings?.footer_text || '© 2026 THẠCH THẢO ORDER'}
           </p>
        </div>
      </footer>
    </div>
  )
}

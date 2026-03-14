'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { CampaignCard } from '@/components/campaign-card'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Facebook, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

function CampaignsContent() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>(null) // Khai báo để fix lỗi ReferenceError

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Lấy cấu hình Web (Tránh lỗi settings is not defined)
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
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      {/* Header nhận settings động */}
      <Header settings={settings} /> 

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Banner tiêu đề trang */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#8B7CFF] to-[#6366F1] rounded-[40px] p-8 text-white shadow-xl">
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-none mb-3">
              {settings?.site_name || 'THẠCH THẢO ORDER KPOP'}
            </Badge>
            <h1 className="text-3xl font-black italic uppercase flex items-center gap-3">
              <Megaphone className="h-8 w-8 animate-bounce" /> Tất cả chiến dịch
            </h1>
            <p className="text-white/70 text-sm font-medium mt-2 uppercase tracking-widest">
              Săn deal album & goods chính hãng từ Hàn Quốc
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Danh sách Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-gray-800 italic uppercase">Đang mở gom đơn</h2>
            <span className="text-[10px] font-black text-[#8B7CFF] bg-purple-50 px-3 py-1 rounded-full uppercase">
              {campaigns.length} Sản phẩm
            </span>
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
            <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
              <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold uppercase italic">Hiện tại chưa có đợt gom mới</p>
            </div>
          )}
        </div>

        {/* Góc Facebook kết nối (Như Ninh yêu cầu) */}
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 mt-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#0084FF] flex items-center justify-center text-white shadow-lg">
              <Facebook className="h-7 w-7" />
            </div>
            <div>
              <p className="font-black text-sm text-gray-800 uppercase italic leading-none">Fangirl's Diary Shop</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">Cập nhật Feedback & Deal hời mỗi ngày</p>
            </div>
          </div>
          <Button 
            className="rounded-full bg-[#0084FF] hover:bg-[#0073E6] px-10 h-12 font-black italic shadow-lg shadow-blue-100 uppercase text-xs"
            asChild
          >
            <a href="https://www.facebook.com/fangirlsdiaryshop" target="_blank">Ghé thăm Page</a>
          </Button>
        </div>
      </main>

      <footer className="py-10 text-center text-gray-300 text-[10px] font-bold uppercase tracking-[0.3em]">
        {settings?.footer_text || '© 2026 THẠCH THẢO ORDER KPOP'}
      </footer>
    </div>
  )
}

// Export default chuẩn Next.js kèm Suspense để fix lỗi prerender
export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black text-gray-300 uppercase">Đang chuẩn bị...</div>}>
      <CampaignsContent />
    </Suspense>
  )
}

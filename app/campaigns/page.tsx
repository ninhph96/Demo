'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { CampaignCard } from '@/components/campaign-card'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'

function CampaignsContent() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>(null) // Khai báo settings để fix lỗi undefined

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // 1. Lấy cấu hình (Tránh lỗi ReferenceError)
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .single()
      if (settingsData) setSettings(settingsData)

      // 2. Lấy danh sách chiến dịch
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
      {/* Header dùng settings động */}
      <Header settings={settings} /> 

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-800 italic uppercase leading-none">Tất cả chiến dịch</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Săn deal Kpop cùng Thạch Thảo</p>
          </div>
          <Badge className="bg-[#8B7CFF] text-white border-none rounded-lg font-black">
            {campaigns.length} ĐANG MỞ
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
            <p className="text-gray-400 font-bold uppercase italic">Hiện chưa có chiến dịch nào</p>
          </div>
        )}

        {/* Góc Facebook cho uy tín như Ninh yêu cầu */}
        <div className="bg-white rounded-[35px] p-6 shadow-sm border border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4 mt-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#0084FF] flex items-center justify-center text-white shadow-md">
              <Facebook className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-[11px] text-gray-800 uppercase italic leading-none">Thạch Thảo Order Kpop</p>
              <p className="text-[10px] text-gray-400 font-medium mt-1">Ghé thăm Fanpage để xem Feedback</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full border-[#0084FF] text-[#0084FF] font-black text-[10px] h-9 px-6" asChild>
            <a href="https://www.facebook.com/fangirlsdiaryshop" target="_blank">TRUY CẬP PAGE</a>
          </Button>
        </div>
      </main>

      <footer className="py-10 text-center text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em]">
        {settings?.footer_text || '© 2026 THẠCH THẢO ORDER'}
      </footer>
    </div>
  )
}

// Bọc Suspense để GitHub Actions build không bị lỗi
export default function CampaignsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black text-gray-200 animate-pulse">LOADING...</div>}>
      <CampaignsContent />
    </Suspense>
  )
}

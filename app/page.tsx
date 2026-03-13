'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CampaignCard } from '@/components/campaign-card'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDb = async () => {
      setLoading(true)
      const { data } = await supabase.from('campaigns').select('*, campaign_options(*)').eq('status', 'OPEN')
      if (data) setCampaigns(data)
      setLoading(false)
    }
    fetchDb()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Banner Hero */}
        <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#8B7CFF] to-[#6366F1] p-8 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-lg">
            <Badge className="bg-white/20 text-white border-none rounded-lg mb-4">Thạch Thảo</Badge>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight italic uppercase">Đặt hàng Kpop<br/>Dễ dàng hơn</h1>
            <p className="text-white/80 font-medium">Săn album, goods giá gốc từ Hàn Quốc. Nhận hàng tại Hải Phòng nhanh chóng.</p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </section>

        {/* Danh sách Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-800 italic uppercase">Chiến dịch đang mở</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-200 rounded-[32px]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {campaigns.map((c: any) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

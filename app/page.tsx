'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { CampaignCard } from '@/components/campaign-card'
import { supabase } from '@/lib/supabase' // Dùng Supabase thật
import type { CampaignStatus } from '@/lib/types'
import Link from 'next/link'

const filterOptions: { value: CampaignStatus | 'ALL'; label: string; icon: React.ElementType }[] = [
  { value: 'ALL', label: 'Tất cả', icon: Sparkles },
  { value: 'OPEN', label: 'Đang mở', icon: TrendingUp },
  { value: 'CLOSING_SOON', label: 'Sắp đóng', icon: Clock },
  { value: 'CLOSED', label: 'Đã đóng', icon: CheckCircle2 }
]

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [filter, setFilter] = useState<CampaignStatus | 'ALL'>('ALL')
  const [loading, setLoading] = useState(true)

  // Lấy dữ liệu thật từ Supabase
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('campaigns')
        .select('*, campaign_options(*)') // Lấy cả options để hiện giá
        .neq('status', 'DRAFT') // Không hiện bản nháp
        .order('created_at', { ascending: false })
      
      if (data) setCampaigns(data)
      setLoading(false)
    }
    fetchCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'ALL') return true
    return c.status === filter
  })

  const openCount = campaigns.filter(c => c.status === 'OPEN').length

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#8B7CFF] via-[#7A6BEB] to-[#6366F1] p-6 md:p-10 text-white shadow-xl shadow-indigo-100">
            <div className="relative z-10">
              <Badge className="bg-white/20 text-white border-white/30 mb-4 rounded-lg">
                {openCount} chiến dịch đang mở
              </Badge>
              <h1 className="text-2xl md:text-4xl font-black mb-3 text-balance uppercase italic">
                Thạch Thảo Order Hàng Hàn Quốc
              </h1>
              <p className="text-white/90 mb-6 max-w-md font-medium">
                Săn album, goods Kpop giá gốc, cam kết benefit độc quyền từ Hàn Quốc.
              </p>
              <Button size="lg" className="bg-white text-[#8B7CFF] hover:bg-white/90 font-bold rounded-2xl shadow-lg">
                Xem chiến dịch ngay
              </Button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 md:w-60 md:h-60 rounded-full bg-white/10 blur-2xl" />
          </div>
        </section>

        {/* Filter Section */}
        <section className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterOptions.map((option) => {
              const isActive = filter === option.value
              return (
                <Button
                  key={option.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(option.value)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl transition-all ${
                    isActive ? 'bg-[#8B7CFF] shadow-md shadow-indigo-200' : 'bg-white border-gray-100'
                  }`}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </section>

        {/* Campaign Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {filter === 'ALL' ? 'Danh sách Order' : filterOptions.find(o => o.value === filter)?.label}
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-20 text-gray-400">Đang tìm album ...</div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
              <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-gray-400">Hết hàng mất rồi!</h3>
              <p className="text-sm text-gray-300">Mình sẽ cập nhật album mới sớm nhất nhé.</p>
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}

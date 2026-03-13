'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { CampaignCard } from '@/components/campaign-card'
import { useOrders } from '@/lib/order-context'
import type { CampaignStatus } from '@/lib/types'
import Link from 'next/link'

const filterOptions: { value: CampaignStatus | 'ALL'; label: string; icon: React.ElementType }[] = [
  { value: 'ALL', label: 'Tất cả', icon: Sparkles },
  { value: 'OPEN', label: 'Đang mở', icon: TrendingUp },
  { value: 'CLOSING_SOON', label: 'Sắp đóng', icon: Clock },
  { value: 'CLOSED', label: 'Đã đóng', icon: CheckCircle2 }
]

export default function HomePage() {
  const { campaigns } = useOrders()
  const [filter, setFilter] = useState<CampaignStatus | 'ALL'>('ALL')

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'ALL') return c.status !== 'DRAFT'
    return c.status === filter
  })

  const openCampaigns = campaigns.filter(c => c.status === 'OPEN' || c.status === 'CLOSING_SOON')

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-accent/80 p-6 md:p-10 text-primary-foreground">
            <div className="relative z-10">
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                {openCampaigns.length} chiến dịch đang mở
              </Badge>
              <h1 className="text-2xl md:text-4xl font-bold mb-3 text-balance">
                Đặt hàng nhóm Kpop dễ dàng
              </h1>
              <p className="text-primary-foreground/90 mb-6 max-w-md">
                Tham gia group order để nhận album, goods với giá tốt nhất cùng nhiều benefit độc quyền.
              </p>
              <Link href="/campaigns">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                  Xem chiến dịch
                </Button>
              </Link>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 md:w-60 md:h-60 rounded-full bg-white/10" />
            <div className="absolute right-20 bottom-20 w-20 h-20 rounded-full bg-white/10" />
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
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl ${
                    isActive ? '' : 'bg-card hover:bg-muted'
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
            <h2 className="text-lg font-semibold text-foreground">
              {filter === 'ALL' ? 'Tất cả chiến dịch' : filterOptions.find(o => o.value === filter)?.label}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredCampaigns.length} chiến dịch
            </span>
          </div>
          
          {filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <Sparkles className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">Chưa có chiến dịch</h3>
              <p className="text-sm text-muted-foreground">
                Không có chiến dịch nào trong danh mục này
              </p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

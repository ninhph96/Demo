'use client'

import { useState } from 'react'
import { Search, Filter, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { CampaignCard } from '@/components/campaign-card'
import { useOrders } from '@/lib/order-context'
import type { CampaignStatus } from '@/lib/types'
import { storeOptions, campaignStatusLabels } from '@/lib/types'

export default function CampaignsPage() {
  const { campaigns } = useOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL'>('ALL')
  const [storeFilter, setStoreFilter] = useState<string>('ALL')

  const filteredCampaigns = campaigns.filter(c => {
    // Exclude drafts from public view
    if (c.status === 'DRAFT') return false
    
    // Search filter
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    
    // Status filter
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
    
    // Store filter
    if (storeFilter !== 'ALL' && c.store !== storeFilter) return false
    
    return true
  })

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Chiến dịch</h1>
          <p className="text-muted-foreground">Khám phá và đặt hàng các album, goods yêu thích</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm chiến dịch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl bg-card"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | 'ALL')}>
              <SelectTrigger className="w-[140px] rounded-xl bg-card">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="OPEN">{campaignStatusLabels.OPEN}</SelectItem>
                <SelectItem value="CLOSING_SOON">{campaignStatusLabels.CLOSING_SOON}</SelectItem>
                <SelectItem value="CLOSED">{campaignStatusLabels.CLOSED}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-[140px] rounded-xl bg-card">
                <SelectValue placeholder="Cửa hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {storeOptions.map((store) => (
                  <SelectItem key={store} value={store}>{store}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Tìm thấy {filteredCampaigns.length} chiến dịch
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
            <h3 className="font-medium text-foreground mb-2">Không tìm thấy chiến dịch</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('')
                setStatusFilter('ALL')
                setStoreFilter('ALL')
              }}
              className="rounded-xl"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Search, Sparkles, Loader2 } from 'lucide-react'
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
import { supabase } from '@/lib/supabase'
import type { CampaignStatus } from '@/lib/types'
import { storeOptions, campaignStatusLabels } from '@/lib/types'

export default function ExplorePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL'>('ALL')
  const [storeFilter, setStoreFilter] = useState<string>('ALL')

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('campaigns')
        .select('*, campaign_options(*)')
        .neq('status', 'DRAFT')
      if (data) setCampaigns(data)
      setLoading(false)
    }
    fetchCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter(c => {
    // Search filter (Database dùng 'title')
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase())) return false
    // Status filter
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
    // Store filter (Database dùng 'store_name')
    if (storeFilter !== 'ALL' && c.store_name !== storeFilter) return false
    return true
  })

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-20 md:pb-8">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Khám phá</h1>
          <p className="text-gray-500 font-medium">Tìm album Kpop yêu thích tại đây</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B7CFF]" />
            <Input
              placeholder="Nhập tên album cần tìm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-2xl bg-white border-none shadow-sm h-12"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | 'ALL')}>
              <SelectTrigger className="w-[140px] rounded-2xl bg-white border-none shadow-sm h-12">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="OPEN">Đang mở</SelectItem>
                <SelectItem value="CLOSING_SOON">Sắp đóng</SelectItem>
                <SelectItem value="CLOSED">Đã đóng</SelectItem>
              </SelectContent>
            </Select>

            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-[140px] rounded-2xl bg-white border-none shadow-sm h-12">
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

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#8B7CFF]" /></div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] shadow-sm">
            <Sparkles className="h-12 w-12 text-gray-100 mx-auto mb-4" />
            <h3 className="font-bold text-gray-400">Không tìm thấy kết quả</h3>
            <Button variant="link" onClick={() => {setSearch(''); setStatusFilter('ALL'); setStoreFilter('ALL')}} className="text-[#8B7CFF]">Xóa bộ lọc</Button>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}

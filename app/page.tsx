'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CampaignCard } from '@/components/campaign-card'
import { Header } from '@/components/header'
import { Sparkles } from 'lucide-react'

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDb = async () => {
      setLoading(true)
      // Chú ý: Phải có .select('*, campaign_options(*)') mới hiện được giá tiền!
      const { data, error } = await supabase
        .from('campaigns')
        .select('*, campaign_options(*)')
        .eq('status', 'OPEN')
      
      if (data) setCampaigns(data)
      setLoading(false)
    }
    fetchDb()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-black text-gray-800 mb-8 uppercase italic">Chiến dịch đang mở</h2>
        
        {loading ? (
          <p className="text-center text-gray-400">Đang lấy dữ liệu từ Hải Phòng...</p>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {campaigns.map((c: any) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
            <Sparkles className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Chưa có sản phẩm nào.</p>
          </div>
        )}
      </main>
    </div>
  )
}

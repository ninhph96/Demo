'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Store, Clock, ShoppingCart, Info, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export function CampaignCard({ campaign }: { campaign: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [logoUrl, setLogoUrl] = useState('') // Lưu logo web mặc định
  const router = useRouter()

  // Lấy Logo mặc định từ site_settings
  useEffect(() => {
    async function getLogo() {
      const { data } = await supabase.from('site_settings').select('logo_url').single()
      if (data?.logo_url) setLogoUrl(data.logo_url)
    }
    getLogo()
  }, [])

  const options = campaign.campaign_options || []
  const minPrice = options.length > 0 ? Math.min(...options.map((o: any) => o.price_vnd || 0)) : 0
  
  // LOGO FALLBACK: Nếu không có ảnh sản phẩm thì hiện logo Ninh đã cấu hình
  const displayImage = campaign.image_url || logoUrl || 'https://placehold.co/400x400?text=Kpop+Order'

  const handlePayment = () => {
    if (options.length > 0 && selectedOptions.length === 0) {
      alert("Ninh nhắc khách chọn ít nhất 1 phiên bản nhé!")
      return
    }
    const ids = selectedOptions.length > 0 ? selectedOptions.join(',') : 'default'
    router.push(`/order/checkout?id=${campaign.id}&options=${ids}`)
  }

  return (
    <>
      <Card 
        className="overflow-hidden rounded-[32px] border-none shadow-sm bg-white hover:shadow-xl transition-all duration-500 cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative aspect-square overflow-hidden">
          <Image 
            src={displayImage} 
            alt={campaign.title} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 border-none rounded-xl font-bold">
            {campaign.status === 'OPEN' ? 'Đang mở' : 'Tạm đóng'}
          </Badge>
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-gray-800 line-clamp-1 italic">{campaign.title}</h3>
          <div className="flex justify-between items-center">
            <span className="text-[#8B7CFF] font-black">{formatPrice(minPrice)}</span>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{campaign.store_name}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-[40px] border-none p-0 overflow-hidden bg-[#F8F9FD] shadow-2xl">
          <div className="relative h-72">
            <Image src={displayImage} alt={campaign.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FD] via-transparent" />
          </div>
          <div className="p-6 -mt-12 relative space-y-4 pb-10">
            <DialogHeader><DialogTitle className="text-2xl font-black text-gray-800 italic uppercase">{campaign.title}</DialogTitle></DialogHeader>
            <div className="flex gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span className="flex items-center gap-1"><Store className="h-3 w-3" /> {campaign.store_name}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {campaign.close_date ? new Date(campaign.close_date).toLocaleDateString('vi-VN') : 'Liên hệ'}</span>
            </div>
            <div className="bg-white rounded-[32px] p-5 shadow-sm space-y-4">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2"><Info className="h-3 w-3" /> Chọn phiên bản bạn thích</p>
               <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                  {options.length > 0 ? options.map((option: any) => (
                    <div key={option.id} onClick={() => {
                        const prev = selectedOptions;
                        setSelectedOptions(prev.includes(option.id) ? prev.filter(i => i !== option.id) : [...prev, option.id])
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedOptions.includes(option.id) ? 'border-[#8B7CFF] bg-[#F7F6FF] shadow-md shadow-purple-50' : 'border-gray-50 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedOptions.includes(option.id)} className="border-gray-300" />
                        <div>
                          <p className="font-bold text-sm text-gray-700">{option.version}</p>
                          <p className="text-xs text-[#8B7CFF] font-black italic">{formatPrice(option.price_vnd)}</p>
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-center text-gray-400 text-sm py-4 italic font-bold">Bản cơ bản</p>}
               </div>
            </div>
            <Button onClick={handlePayment} className="w-full h-16 rounded-[28px] bg-[#8B7CFF] hover:bg-[#7A6BEB] text-lg font-black shadow-xl shadow-purple-200 uppercase italic">
              <ShoppingCart className="mr-2 h-6 w-6" /> Thanh toán ngay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

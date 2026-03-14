'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// Thêm icon Minus, Plus
import { Store, Clock, ShoppingCart, Info, Minus, Plus } from 'lucide-react' 
import { supabase } from '@/lib/supabase'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export function CampaignCard({ campaign }: { campaign: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1) // THÊM STATE SỐ LƯỢNG
  const [logoUrl, setLogoUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function getLogo() {
      const { data } = await supabase.from('site_settings').select('logo_url').single()
      if (data?.logo_url) setLogoUrl(data.logo_url)
    }
    getLogo()
  }, [])

  const options = campaign.campaign_options || []
  const minPrice = options.length > 0 ? Math.min(...options.map((o: any) => o.price_vnd || 0)) : 0
  const displayImage = campaign.image_url || logoUrl || 'https://placehold.co/400x400?text=Kpop+Order'

  const handlePayment = () => {
  if (selectedOptions.length === 0) {
    alert("Ninh nhắc khách chọn ít nhất 1 phiên bản nhé!");
    return;
  }
  const ids = selectedOptions.join(',');
  // Chuyển sang checkout mang theo id, options và qty
  router.push(`/order/checkout?id=${campaign.id}&options=${ids}&qty=${quantity}`);
}

  return (
    <>
      <Card 
        className="overflow-hidden rounded-[32px] border-none shadow-sm bg-white hover:shadow-xl transition-all duration-500 cursor-pointer group"
        onClick={() => { setIsOpen(true); setQuantity(1); }} // Reset số lượng khi mở
      >
        <div className="relative aspect-square overflow-hidden">
          <Image src={displayImage} alt={campaign.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
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
          <div className="relative h-60">
            <Image src={displayImage} alt={campaign.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FD] via-transparent" />
          </div>
          <div className="p-6 -mt-10 relative space-y-4 pb-10">
            <DialogHeader><DialogTitle className="text-xl font-black text-gray-800 italic uppercase">{campaign.title}</DialogTitle></DialogHeader>
            
            <div className="bg-white rounded-[32px] p-5 shadow-sm space-y-4">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2"><Info className="h-3 w-3" /> Chọn phiên bản</p>
               <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {options.map((option: any) => (
                    <div key={option.id} onClick={() => setSelectedOptions(selectedOptions.includes(option.id) ? [] : [option.id])} // Giả sử chỉ cho chọn 1 bản 1 lúc để dễ tính số lượng
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${selectedOptions.includes(option.id) ? 'border-[#8B7CFF] bg-[#F7F6FF]' : 'border-gray-50 bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedOptions.includes(option.id)} />
                        <div>
                          <p className="font-bold text-sm text-gray-700">{option.version}</p>
                          <p className="text-xs text-[#8B7CFF] font-black italic">{formatPrice(option.price_vnd)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>

               {/* PHẦN CHỌN SỐ LƯỢNG MỚI */}
               <div className="pt-4 border-t border-dashed flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-gray-400 italic">Số lượng đặt:</span>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-3 w-3" /></Button>
                    <span className="font-black text-sm w-4 text-center">{quantity}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-[#8B7CFF]" onClick={() => setQuantity(quantity + 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
               </div>
            </div>

            <Button onClick={handlePayment} className="w-full h-16 rounded-[28px] bg-[#8B7CFF] hover:bg-[#7A6BEB] text-lg font-black shadow-xl uppercase italic">
              <ShoppingCart className="mr-2 h-6 w-6" /> Thanh toán ngay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

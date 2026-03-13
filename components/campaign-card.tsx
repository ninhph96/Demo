'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Store, Clock, ShoppingCart, Info } from 'lucide-react'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export function CampaignCard({ campaign }: { campaign: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const router = useRouter()

  const options = campaign.campaign_options || []
  const minPrice = options.length > 0 
    ? Math.min(...options.map((o: any) => o.price_vnd || 0)) 
    : 0

  const handleToggleOption = (id: string) => {
    setSelectedOptions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handlePayment = () => {
    if (options.length > 0 && selectedOptions.length === 0) {
      alert("Ninh nhắc khách chọn ít nhất 1 phiên bản nhé!")
      return
    }
    const ids = selectedOptions.length > 0 ? selectedOptions.join(',') : 'default'
    // Sửa lỗi 404 bằng router.push chuẩn của Next.js
    router.push(`/order/checkout?id=${campaign.id}&options=${ids}`)
  }

  return (
    <>
      {/* 1. Card hiển thị ở trang chủ (Gọn gàng) */}
      <Card 
        className="overflow-hidden rounded-[32px] border-none shadow-sm bg-white hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative aspect-square">
          <Image 
            src={campaign.image_url || 'https://placehold.co/400x400?text=No+Image'} 
            alt={campaign.title} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <Badge className="absolute top-3 left-3 bg-white/80 backdrop-blur-md text-gray-800 border-none rounded-xl">
            {campaign.status === 'OPEN' ? 'Đang mở' : 'Tạm đóng'}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-2">
          <h3 className="font-bold text-gray-800 line-clamp-1">{campaign.title}</h3>
          <div className="flex justify-between items-center">
            <span className="text-[#8B7CFF] font-black">{formatPrice(minPrice)}</span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">{campaign.store_name}</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Modal hiện thông tin chi tiết (Bảng thông tin khi ấn vào) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-[40px] border-none p-0 overflow-hidden bg-[#F8F9FD]">
          <div className="relative h-64">
            <Image src={campaign.image_url} alt={campaign.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FD] via-transparent" />
          </div>
          
          <div className="p-6 -mt-12 relative space-y-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-gray-800 leading-tight">
                {campaign.title}
              </DialogTitle>
            </DialogHeader>

            <div className="flex gap-4 text-xs font-bold text-gray-400">
              <span className="flex items-center gap-1"><Store className="h-3 w-3" /> {campaign.store_name}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {campaign.close_date ? new Date(campaign.close_date).toLocaleDateString('vi-VN') : 'Liên hệ'}</span>
            </div>

            <div className="bg-white rounded-[32px] p-4 shadow-sm space-y-3">
              <p className="text-xs font-black text-gray-400 uppercase flex items-center gap-2">
                <Info className="h-3 w-3" /> Chọn phiên bản
              </p>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {options.length > 0 ? (
                  options.map((option: any) => (
                    <div 
                      key={option.id} 
                      onClick={() => handleToggleOption(option.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                        selectedOptions.includes(option.id) ? 'border-[#8B7CFF] bg-[#F7F6FF]' : 'border-gray-50 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedOptions.includes(option.id)} />
                        <div>
                          <p className="font-bold text-sm text-gray-700">{option.version}</p>
                          <p className="text-xs text-[#8B7CFF] font-black">{formatPrice(option.price_vnd)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 text-sm py-4 italic">Bản cơ bản</p>
                )}
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              className="w-full h-14 rounded-[24px] bg-[#8B7CFF] hover:bg-[#7A6BEB] text-lg font-black shadow-lg shadow-purple-100"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> THANH TOÁN NGAY
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Store, Clock, ShoppingCart, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export function CampaignCard({ campaign }: { campaign: any }) {
  const [showOptions, setShowOptions] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  // 1. Fix lỗi biến dữ liệu theo Database của Ninh (title, store_name, price_vnd)
  const options = campaign.campaign_options || []
  
  // Tính giá thấp nhất (nếu không có option nào thì để 0)
  const minPrice = options.length > 0 
    ? Math.min(...options.map((o: any) => o.price_vnd || 0)) 
    : 0

  const handleToggleOption = (id: string) => {
    setSelectedOptions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handlePayment = () => {
    if (selectedOptions.length === 0) {
      alert("Nhắc khách chọn ít nhất 1 phiên bản nhé!")
      return
    }
    // 2. Fix lỗi 404: Bỏ bớt /Demo vì Next.js tự điều hướng
    const ids = selectedOptions.join(',')
    window.location.href = `/order/checkout?id=${campaign.id}&options=${ids}`
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-none shadow-md bg-white hover:shadow-xl transition-all duration-300">
      {/* 1. Ảnh sản phẩm */}
      <div className="relative aspect-square">
        <Image 
          src={campaign.image_url || 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400'} 
          alt={campaign.title} 
          fill 
          className="object-cover"
        />
        <Badge className={`absolute top-3 left-3 border-none rounded-lg px-3 py-1 font-medium ${
          campaign.status === 'OPEN' ? 'bg-[#E6FFFA] text-[#2D3748]' : 'bg-gray-100 text-gray-500'
        }`}>
          {campaign.status === 'OPEN' ? 'Đang mở' : 'Tạm đóng'}
        </Badge>
      </div>

      {/* 2. Thông tin cơ bản */}
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-lg text-[#2D3748] leading-tight line-clamp-2 min-h-[3rem]">
          {campaign.title} {/* Đổi từ name sang title */}
        </h3>

        <div className="flex flex-col gap-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-[#8B7CFF]" />
            <span>{campaign.store_name}</span> {/* Đổi từ store sang store_name */}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#8B7CFF]" />
            <span>
              {campaign.close_date 
                ? `Đóng: ${new Date(campaign.close_date).toLocaleDateString('vi-VN')}` 
                : 'Liên hệ chốt đơn'}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-1 text-[#8B7CFF]">
          <span className="text-sm">Từ</span>
          <span className="text-xl font-black">{formatPrice(minPrice)}</span>
        </div>

        {/* 3. Nút bấm Mở rộng / Chọn Ver */}
        <Button 
          variant="outline" 
          className={`w-full rounded-2xl border-[#8B7CFF] text-[#8B7CFF] hover:bg-[#8B7CFF] hover:text-white transition-all font-bold ${
            showOptions ? 'bg-[#8B7CFF] text-white' : ''
          }`}
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
          {showOptions ? 'Đóng lại' : 'Chọn phiên bản'}
        </Button>

        {/* 4. Danh sách phiên bản (Chỉ hiện khi ấn nút) */}
        {showOptions && (
          <div className="mt-4 pt-4 border-t border-dashed space-y-3 animate-in fade-in slide-in-from-top-2">
            {options.length > 0 ? (
              options.map((option: any) => (
                <div 
                  key={option.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOptions.includes(option.id) ? 'border-[#8B7CFF] bg-[#F7F6FF]' : 'border-gray-50 bg-gray-50/50'
                  }`}
                  onClick={() => handleToggleOption(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selectedOptions.includes(option.id)} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-700">{option.version}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-[#8B7CFF] font-medium">{formatPrice(option.price_vnd)}</span>
                        {option.deposit_amount > 0 && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1 border-[#8B7CFF] text-[#8B7CFF]">
                            Cọc: {formatPrice(option.deposit_amount)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-2 text-gray-400 text-sm flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" /> Bản cơ bản
              </div>
            )}

            {/* Nút Thanh toán nhanh */}
            <Button 
              className="w-full rounded-2xl bg-[#8B7CFF] hover:bg-[#7A6BEB] text-white h-12 font-bold shadow-lg shadow-purple-200 mt-2"
              onClick={(e) => {
                e.stopPropagation()
                handlePayment()
              }}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Thanh toán ngay
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

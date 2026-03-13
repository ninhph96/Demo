'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Store, Clock, Minus, Plus, ShoppingCart, Tag, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { useOrders } from '@/lib/order-context'
import { campaignStatusLabels } from '@/lib/types'
import type { CampaignOption } from '@/lib/types'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

interface SelectedOption {
  option: CampaignOption
  quantity: number
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getCampaignById, addOrder } = useOrders()
  const campaign = getCampaignById(id)

  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedOption>>({})
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [socialMediaId, setSocialMediaId] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Không tìm thấy chiến dịch</h1>
          <Link href="/">
            <Button variant="outline" className="rounded-xl">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    )
  }

  const toggleOption = (option: CampaignOption) => {
    setSelectedOptions(prev => {
      if (prev[option.id]) {
        const { [option.id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [option.id]: { option, quantity: 1 } }
    })
  }

  const updateQuantity = (optionId: string, delta: number) => {
    setSelectedOptions(prev => {
      const current = prev[optionId]
      if (!current) return prev
      const newQty = Math.max(1, current.quantity + delta)
      return { ...prev, [optionId]: { ...current, quantity: newQty } }
    })
  }

  const totalAmount = Object.values(selectedOptions).reduce(
    (sum, item) => sum + item.option.price * item.quantity,
    0
  )

  const totalItems = Object.values(selectedOptions).reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!customerName.trim()) {
      newErrors.customerName = 'Vui lòng nhập họ tên'
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^0\d{9}$/.test(phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)'
    }
    
    if (!address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ nhận hàng'
    }
    
    if (Object.keys(selectedOptions).length === 0) {
      newErrors.options = 'Vui lòng chọn ít nhất một phiên bản'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    const order = addOrder({
      campaignId: campaign.id,
      campaignName: campaign.name,
      customerName: customerName.trim(),
      phone: phone.trim(),
      socialMediaId: socialMediaId.trim() || undefined,
      address: address.trim(),
      items: Object.values(selectedOptions).map(item => ({
        optionId: item.option.id,
        optionName: item.option.version,
        quantity: item.quantity,
        price: item.option.price
      })),
      totalAmount,
      status: 'SUBMITTED',
      paymentStatus: 'UNPAID',
      notes: notes.trim() || undefined
    })
    
    // Navigate to success page with order code
    router.push(`/order/success?code=${(order as any).orderCode}`)
  }

  const canOrder = campaign.status === 'OPEN' || campaign.status === 'CLOSING_SOON'

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Link href="/campaigns" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Campaign Info */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
              <Image
                src={campaign.imageUrl}
                alt={campaign.name}
                fill
                className="object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                {campaignStatusLabels[campaign.status]}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-3 text-balance">
              {campaign.name}
            </h1>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Store className="h-4 w-4" />
                <span>{campaign.store}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Đóng: {formatDate(campaign.closeDate)}</span>
              </div>
            </div>

            {campaign.description && (
              <p className="text-muted-foreground mb-6">{campaign.description}</p>
            )}

            {/* Options Selection */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Chọn phiên bản
                </CardTitle>
                {errors.options && (
                  <p className="text-sm text-destructive">{errors.options}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {campaign.options.map((option) => {
                  const isSelected = !!selectedOptions[option.id]
                  const selectedItem = selectedOptions[option.id]
                  
                  return (
                    <div
                      key={option.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => canOrder && toggleOption(option)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={isSelected}
                            disabled={!canOrder}
                            className="mt-1"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {option.version}
                              </span>
                              {option.label && (
                                <Badge variant="secondary" className="text-xs">
                                  {option.label}
                                </Badge>
                              )}
                            </div>
                            {option.benefit && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Gift className="h-3.5 w-3.5" />
                                <span>{option.benefit}</span>
                              </div>
                            )}
                            <p className="text-primary font-semibold mt-1">
                              {formatPrice(option.price)}
                            </p>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => updateQuantity(option.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {selectedItem?.quantity || 1}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => updateQuantity(option.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order Form */}
          <div>
            <Card className="sticky top-24 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Thông tin đặt hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!canOrder ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">
                      Chiến dịch này hiện không nhận đơn
                    </p>
                    <Badge variant="secondary">
                      {campaignStatusLabels[campaign.status]}
                    </Badge>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Họ và tên *</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="rounded-xl"
                      />
                      {errors.customerName && (
                        <p className="text-sm text-destructive">{errors.customerName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0912345678"
                        className="rounded-xl"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="socialMediaId">ID mạng xã hội (Facebook/Instagram)</Label>
                      <Input
                        id="socialMediaId"
                        value={socialMediaId}
                        onChange={(e) => setSocialMediaId(e.target.value)}
                        placeholder="@username hoặc link profile"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ nhận hàng *</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        className="rounded-xl min-h-[80px]"
                      />
                      {errors.address && (
                        <p className="text-sm text-destructive">{errors.address}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Ghi chú</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Yêu cầu đặc biệt (nếu có)"
                        className="rounded-xl"
                      />
                    </div>

                    {/* Order Summary */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Số lượng:</span>
                        <span className="font-medium">{totalItems} sản phẩm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Tổng tiền:</span>
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-xl h-12 text-base font-semibold"
                      disabled={isSubmitting || totalItems === 0}
                    >
                      {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Bằng việc đặt hàng, bạn đồng ý với điều khoản của chúng tôi
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

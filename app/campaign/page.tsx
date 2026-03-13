'use client'

import { useState, Suspense } from 'react' // Thêm Suspense để vượt qua lỗi build
import { useRouter, useSearchParams } from 'next/navigation' // Đổi sang useSearchParams
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
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

interface SelectedOption {
  option: CampaignOption
  quantity: number
}

// Tách nội dung chính ra để bọc trong Suspense
function CampaignContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') // Lấy ID từ ?id=...
  const router = useRouter()
  const { getCampaignById, addOrder } = useOrders()
  const campaign = id ? getCampaignById(id) : null

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
          <Link href="/campaigns">
            <Button variant="outline" className="rounded-xl">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    )
  }

  // --- Logic Functions (Giữ nguyên của Ninh) ---
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

  const totalAmount = Object.values(selectedOptions).reduce((sum, item) => sum + item.option.price * item.quantity, 0)
  const totalItems = Object.values(selectedOptions).reduce((sum, item) => sum + item.quantity, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || !phone.trim() || !address.trim() || totalItems === 0) return
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
    router.push(`/order/success?code=${(order as any).orderCode}`)
  }

  const canOrder = campaign.status === 'OPEN' || campaign.status === 'CLOSING_SOON'

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Link href="/campaigns" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Link>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Ảnh và Info */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
              <Image src={campaign.imageUrl} alt={campaign.name} fill className="object-cover" />
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">{campaignStatusLabels[campaign.status]}</Badge>
            </div>
            <h1 className="text-2xl font-bold mb-3">{campaign.name}</h1>
            <div className="flex flex-wrap gap-4 mb-4 text-muted-foreground">
              <div className="flex items-center gap-2"><Store className="h-4 w-4" />{campaign.store}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" />Đóng: {formatDate(campaign.closeDate)}</div>
            </div>
            {/* Options */}
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Tag className="h-5 w-5 text-primary" />Chọn phiên bản</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {campaign.options.map((option) => {
                  const isSelected = !!selectedOptions[option.id]
                  return (
                    <div key={option.id} className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`} onClick={() => canOrder && toggleOption(option)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={isSelected} readOnly />
                          <div>
                            <div className="font-medium">{option.version} {option.label && <Badge variant="secondary" className="ml-2">{option.label}</Badge>}</div>
                            <p className="text-primary font-semibold">{formatPrice(option.price)}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(option.id, -1)}><Minus className="h-4 w-4" /></Button>
                            <span>{selectedOptions[option.id].quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(option.id, 1)}><Plus className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
          {/* Form Đặt Hàng */}
          <div>
            <Card className="sticky top-24 border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" />Thông tin đặt hàng</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Họ và tên *" className="rounded-xl" />
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại *" className="rounded-xl" />
                  <Textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Địa chỉ nhận hàng *" className="rounded-xl" />
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex justify-between font-bold text-lg text-primary"><span>Tổng cộng:</span><span>{formatPrice(totalAmount)}</span></div>
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-12" disabled={isSubmitting || totalItems === 0}>Đặt hàng</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

// Hàm export mặc định bọc Suspense để vượt qua lỗi Build Tĩnh của GitHub
export default function CampaignDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Đang tải chiến dịch...</div>}>
      <CampaignContent />
    </Suspense>
  )
}

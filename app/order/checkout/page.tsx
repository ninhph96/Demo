'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ShoppingBag, ArrowLeft, CreditCard, User, Phone, MapPin, Share2, Loader2, Facebook } from 'lucide-react'
import Link from 'next/link'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price)
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const campaignId = searchParams.get('id')
  const optionIds = searchParams.get('options')?.split(',') || []

  const [campaign, setCampaign] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [payFull, setPayFull] = useState(true)
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', social: '' })

  useEffect(() => {
    const loadData = async () => {
      if (!campaignId) return
      const { data: cpData } = await supabase
        .from('campaigns')
        .select('*, campaign_options(*)')
        .eq('id', campaignId)
        .single()
      
      if (cpData) {
        setCampaign(cpData)
        const items = cpData.campaign_options.filter((opt: any) => optionIds.includes(opt.id))
        setSelectedItems(items)
      }
    }
    loadData()
  }, [campaignId])

  const totalFull = selectedItems.reduce((sum, item) => sum + (item.price_vnd || 0), 0)
  const totalDeposit = selectedItems.reduce((sum, item) => sum + (item.deposit_price || item.price_vnd || 0), 0)
  const hasDepositOption = selectedItems.some(item => item.deposit_price && item.deposit_price > 0)
  const finalAmount = (hasDepositOption && !payFull) ? totalDeposit : totalFull

  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Điền đủ thông tin nhé!");
      return;
    }

    setLoading(true)
    try {
      const orderCode = `ORD${Math.floor(1000 + Math.random() * 9000)}`
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          social_id: formData.social, // Khớp với social_id trong CSDL của Ninh
          total_amount: finalAmount,
          order_code: orderCode,
          status: 'SUBMITTED',
          payment_type: payFull ? 'FULL' : 'DEPOSIT',
          payment_status: 'UNPAID'
        }])
        .select().single()

      if (orderError) throw orderError

      router.push(`/order/success?code=${orderCode}&total=${finalAmount}&name=${encodeURIComponent(formData.name)}`)
    } catch (error: any) {
      alert("Lỗi: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-20">
      <div className="bg-gradient-to-r from-[#8B7CFF] to-[#6366F1] text-white p-8 rounded-b-[50px] shadow-xl">
        <Link href="/" className="flex items-center gap-2 mb-4 text-white/80 font-bold text-[10px] uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Thanh toán</h1>
      </div>

      <div className="container mx-auto px-4 -mt-8 space-y-6">
        {/* Lựa chọn cọc/hết */}
        {hasDepositOption && (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPayFull(true)} className={`p-4 rounded-[28px] border-2 transition-all font-black text-[11px] uppercase italic ${payFull ? 'bg-[#8B7CFF] text-white border-[#8B7CFF] shadow-lg' : 'bg-white text-gray-400 border-transparent'}`}>Thanh toán hết</button>
            <button onClick={() => setPayFull(false)} className={`p-4 rounded-[28px] border-2 transition-all font-black text-[11px] uppercase italic ${!payFull ? 'bg-[#8B7CFF] text-white border-[#8B7CFF] shadow-lg' : 'bg-white text-gray-400 border-transparent'}`}>Đặt cọc trước</button>
          </div>
        )}

        <Card className="rounded-[35px] border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
           <div className="flex justify-between items-center text-xl font-black text-[#8B7CFF] uppercase italic">
              <span>{payFull ? 'Tổng tiền:' : 'Tiền cọc:'}</span>
              <span>{formatPrice(finalAmount)}đ</span>
           </div>
        </Card>

        {/* Form nhập liệu */}
        <Card className="rounded-[35px] border-none shadow-lg bg-white p-8 space-y-5">
            <div className="space-y-4">
               <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Họ tên *</Label><Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
               <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Số điện thoại *</Label><Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
               <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Facebook / Zalo</Label><Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.social} onChange={e => setFormData({...formData, social: e.target.value})} /></div>
               <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Địa chỉ nhận hàng *</Label><Textarea className="rounded-2xl bg-gray-50 border-none h-24 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            </div>

            <Button className="w-full h-16 rounded-[28px] bg-[#8B7CFF] hover:bg-[#6366F1] text-lg font-black shadow-xl uppercase italic mt-4" disabled={loading} onClick={handleOrder}>
              {loading ? <Loader2 className="animate-spin" /> : `THANH TOÁN ${formatPrice(finalAmount)}đ`}
            </Button>
        </Card>

        {/* --- GÓC FACEBOOK CẦN --- */}
        <div className="bg-white rounded-[35px] p-6 shadow-sm border border-gray-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#0084FF] flex items-center justify-center text-white shadow-md">
              <Facebook className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-[11px] text-gray-800 uppercase italic leading-none">Thạch Thảo Order Kpop</p>
              <p className="text-[10px] text-gray-400 font-medium mt-1">Ghé thăm Fanpage chính chủ</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full border-[#0084FF] text-[#0084FF] font-black text-[10px] h-9" asChild>
            <a href="https://www.facebook.com/fangirlsdiaryshop" target="_blank">TRUY CẬP</a>
          </Button>
        </div>
      </div>
    </div>
  )
}


export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center uppercase font-black text-gray-300">Đang chuẩn bị...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}

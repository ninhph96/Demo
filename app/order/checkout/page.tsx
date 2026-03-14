'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ShoppingBag, ArrowLeft, CreditCard, User, Phone, MapPin, Share2, Loader2, CheckCircle2 } from 'lucide-react'
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
  const [payFull, setPayFull] = useState(true) // Mặc định là thanh toán toàn bộ
  
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

  // Tính toán tiền
  const totalFull = selectedItems.reduce((sum, item) => sum + (item.price_vnd || 0), 0)
  const totalDeposit = selectedItems.reduce((sum, item) => sum + (item.deposit_price || item.price_vnd || 0), 0)
  
  // Kiểm tra xem có sản phẩm nào hỗ trợ cọc không
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
          social_link: formData.social,
          total_amount: finalAmount, // Lưu số tiền khách chọn trả (full hoặc cọc)
          order_code: orderCode,
          status: 'SUBMITTED',
          payment_type: payFull ? 'FULL' : 'DEPOSIT' // Lưu kiểu thanh toán
        }])
        .select().single()

      if (orderError) throw orderError

      const orderItems = selectedItems.map(item => ({
        order_id: order.id,
        option_id: item.id,
        quantity: 1
      }))
      await supabase.from('order_items').insert(orderItems)

      router.push(`/order/success?code=${orderCode}&total=${finalAmount}&name=${encodeURIComponent(formData.name)}`)
    } catch (error: any) {
      alert("Lỗi: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!campaign) return <div className="p-10 text-center text-gray-400 font-black animate-pulse uppercase tracking-widest">Đang tải dữ liệu...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-20">
      <div className="bg-gradient-to-r from-[#8B7CFF] to-[#6366F1] text-white p-8 rounded-b-[50px] shadow-xl">
        <Link href="/" className="flex items-center gap-2 mb-4 text-white/80 font-bold text-[10px] uppercase">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Thanh toán</h1>
      </div>

      <div className="container mx-auto px-4 -mt-8 space-y-6">
        {/* Lựa chọn kiểu thanh toán (Chỉ hiện nếu có giá cọc) */}
        {hasDepositOption && (
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setPayFull(true)}
              className={`p-4 rounded-[28px] border-2 transition-all font-black text-[11px] uppercase italic ${payFull ? 'bg-[#8B7CFF] text-white border-[#8B7CFF] shadow-lg shadow-purple-200' : 'bg-white text-gray-400 border-transparent'}`}
            >
              Thanh toán hết
            </button>
            <button 
              onClick={() => setPayFull(false)}
              className={`p-4 rounded-[28px] border-2 transition-all font-black text-[11px] uppercase italic ${!payFull ? 'bg-[#8B7CFF] text-white border-[#8B7CFF] shadow-lg shadow-purple-200' : 'bg-white text-gray-400 border-transparent'}`}
            >
              Đặt cọc trước
            </button>
          </div>
        )}

        <Card className="rounded-[35px] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-[10px] flex items-center gap-2 text-gray-400 uppercase font-black tracking-widest">
              <ShoppingBag className="h-4 w-4" /> Chi tiết đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {selectedItems.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-2">
                <p className="font-bold text-gray-600">{item.version}</p>
                <div className="text-right">
                  <p className="font-black text-gray-800">{formatPrice(item.price_vnd)}đ</p>
                  {item.deposit_price > 0 && <p className="text-[9px] text-[#8B7CFF] font-bold">Cọc: {formatPrice(item.deposit_price)}đ</p>}
                </div>
              </div>
            ))}
            <div className="pt-2 flex justify-between items-center text-xl font-black text-[#8B7CFF] uppercase italic">
              <span>{payFull ? 'Tổng tiền:' : 'Tiền cọc:'}</span>
              <span>{formatPrice(finalAmount)}đ</span>
            </div>
          </CardContent>
        </Card>

        {/* Form thông tin (Giữ nguyên các trường social, address...) */}
        <Card className="rounded-[35px] border-none shadow-lg bg-white p-8 space-y-5">
           <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Họ tên khách hàng *</Label>
                <Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Số điện thoại *</Label>
                <Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Link FB / Zalo</Label>
                <Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.social} onChange={e => setFormData({...formData, social: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Địa chỉ nhận hàng *</Label>
                <Textarea className="rounded-2xl bg-gray-50 border-none h-24 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
           </div>

           <Button 
             className="w-full h-16 rounded-[28px] bg-[#8B7CFF] hover:bg-[#6366F1] text-lg font-black shadow-xl uppercase italic mt-4"
             disabled={loading}
             onClick={handleOrder}
           >
             {loading ? <Loader2 className="animate-spin" /> : `THANH TOÁN ${formatPrice(finalAmount)}đ`}
           </Button>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>
}

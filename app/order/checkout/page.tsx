'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, Minus, Plus, Share2, User, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Lấy dữ liệu từ URL
  const campaignId = searchParams.get('id')
  const optionIds = searchParams.get('options')?.split(',') || []
  const initialQty = parseInt(searchParams.get('qty') || '1')

  const [campaign, setCampaign] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [quantity, setQuantity] = useState(initialQty)
  const [payFull, setPayFull] = useState(true)
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', social: '' })

  useEffect(() => {
    const loadData = async () => {
      if (!campaignId) return
      const { data: cpData } = await supabase.from('campaigns').select('*, campaign_options(*)').eq('id', campaignId).single()
      if (cpData) {
        setCampaign(cpData)
        const items = cpData.campaign_options.filter((opt: any) => optionIds.includes(opt.id))
        setSelectedItems(items)
      }
    }
    loadData()
  }, [campaignId, optionIds])

  const unitPrice = selectedItems.reduce((sum, item) => sum + (item.price_vnd || 0), 0)
  const totalFull = unitPrice * quantity
  const depositPercent = campaign?.deposit_percent || 50
  const totalDeposit = Math.round((totalFull * depositPercent) / 100)
  const finalAmount = payFull ? totalFull : totalDeposit

  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Fangirl's Diary Shop nhắc bạn điền đủ thông tin nhé!"); 
      return;
    }
    setLoading(true)
    try {
      const orderCode = `ORD${Math.floor(1000 + Math.random() * 9000)}`
      const { data: order, error: orderError } = await supabase.from('orders').insert([{
        customer_name: formData.name, 
        phone: formData.phone, 
        address: formData.address,
        social_id: formData.social,
        total_amount: finalAmount, 
        order_code: orderCode,
        status: 'SUBMITTED', 
        payment_type: payFull ? 'FULL' : 'DEPOSIT'
      }]).select().single()

      if (orderError) throw orderError

      await supabase.from('order_items').insert(
        selectedItems.map(item => ({ 
          order_id: order.id, 
          option_id: item.id, 
          quantity: quantity, 
          status: 'SUBMITTED' 
        }))
      )
      router.push(`/order/success?code=${orderCode}&total=${finalAmount}&name=${encodeURIComponent(formData.name)}`)
    } catch (error: any) { 
        alert("Fangirl's Diary Shop gặp lỗi: " + error.message) 
    } finally { 
        setLoading(false) 
    }
  }

  if (!campaign) return <div className="p-20 text-center font-black animate-pulse uppercase text-gray-300">Đang tải đơn hàng...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-20">
      <div className="bg-[#8B7CFF] text-white p-8 rounded-b-[40px] shadow-xl text-center">
        <Link href="/" className="flex items-center gap-2 mb-4 text-white/80 font-bold text-[10px] uppercase">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <h1 className="text-2xl font-black italic uppercase">Thanh toán đơn hàng</h1>
      </div>

      <div className="container mx-auto px-4 -mt-8 space-y-4 max-w-xl">
        <Card className="rounded-[30px] border-none shadow-sm p-5 flex items-center justify-between bg-white">
          <span className="font-black italic uppercase text-gray-800 text-sm">Số lượng sản phẩm</span>
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-1 border">
            <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
            <span className="font-black text-xl w-6 text-center">{quantity}</span>
            <Button size="icon" variant="ghost" className="h-10 w-10 text-[#8B7CFF]" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setPayFull(true)} className={`p-5 rounded-[30px] border-2 transition-all flex flex-col items-center gap-1 ${payFull ? 'bg-[#8B7CFF] border-[#8B7CFF] text-white shadow-lg scale-105' : 'bg-white border-transparent text-gray-400'}`}>
            <span className="font-black italic uppercase text-[9px]">Trả hết</span>
            <span className="font-black text-lg">{new Intl.NumberFormat('vi-VN').format(totalFull)}đ</span>
          </button>
          <button onClick={() => setPayFull(false)} className={`p-5 rounded-[30px] border-2 transition-all flex flex-col items-center gap-1 ${!payFull ? 'bg-[#8B7CFF] border-[#8B7CFF] text-white shadow-lg scale-105' : 'bg-white border-transparent text-gray-400'}`}>
            <span className="font-black italic uppercase text-[9px]">Đặt cọc {depositPercent}%</span>
            <span className="font-black text-lg">{new Intl.NumberFormat('vi-VN').format(totalDeposit)}đ</span>
          </button>
        </div>

        <Card className="rounded-[40px] border-none shadow-2xl p-8 space-y-5 bg-white">
           <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><User className="h-3 w-3" /> Họ tên *</Label>
                <Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><Phone className="h-3 w-3" /> Số điện thoại *</Label>
                <Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-[#8B7CFF] uppercase ml-2 flex items-center gap-1"><Share2 className="h-3 w-3" /> Link Facebook / Zalo</Label>
                <Input placeholder="Để shop liên hệ gửi bill..." className="rounded-2xl bg-[#8B7CFF]/5 border-none h-14 font-bold" value={formData.social} onChange={e => setFormData({...formData, social: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><MapPin className="h-3 w-3" /> Địa chỉ nhận hàng *</Label>
                <Textarea className="rounded-2xl bg-gray-50 border-none h-24 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
           </div>

           <Button className="w-full h-20 rounded-[35px] bg-[#8B7CFF] hover:bg-[#6366F1] text-xl font-black italic shadow-xl uppercase" disabled={loading} onClick={handleOrder}>
             {loading ? <Loader2 className="animate-spin" /> : `XÁC NHẬN ${new Intl.NumberFormat('vi-VN').format(finalAmount)}đ`}
           </Button>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() { return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense> }

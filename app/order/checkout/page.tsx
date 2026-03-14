'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Minus, Plus, CreditCard, Loader2 } from 'lucide-react'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1) // Quản lý số lượng
  const [payFull, setPayFull] = useState(true) // Chọn Full hoặc Cọc

  const campaignId = searchParams.get('id')
  const optionIds = searchParams.get('options')?.split(',') || []

  const [campaign, setCampaign] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
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
  }, [campaignId])

  // LOGIC TÍNH TIỀN
  const unitPrice = selectedItems.reduce((sum, item) => sum + (item.price_vnd || 0), 0)
  const totalFull = unitPrice * quantity
  
  // Tính tiền cọc dựa trên % trong Database (mặc định 50%)
  const depositPercent = campaign?.deposit_percent || 50
  const totalDeposit = (totalFull * depositPercent) / 100
  
  const finalAmount = payFull ? totalFull : totalDeposit

  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Ninh nhắc khách điền đủ thông tin nhé!"); return;
    }
    setLoading(true)
    try {
      const orderCode = `ORD${Math.floor(1000 + Math.random() * 9000)}`
      const { data: order, error: orderError } = await supabase.from('orders').insert([{
        customer_name: formData.name, phone: formData.phone, address: formData.address,
        social_id: formData.social, total_amount: finalAmount, order_code: orderCode,
        status: 'SUBMITTED', payment_type: payFull ? 'FULL' : 'DEPOSIT'
      }]).select().single()

      if (orderError) throw orderError

      const { error: itemsError } = await supabase.from('order_items').insert(
        selectedItems.map(item => ({ order_id: order.id, option_id: item.id, quantity, status: 'SUBMITTED' }))
      )
      if (itemsError) throw itemsError
      router.push(`/order/success?code=${orderCode}&total=${finalAmount}&name=${encodeURIComponent(formData.name)}`)
    } catch (error: any) { alert(error.message) } finally { setLoading(false) }
  }

  if (!campaign) return <div className="p-20 text-center font-black animate-pulse">ĐANG TẢI...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-20">
      <div className="bg-[#8B7CFF] text-white p-10 rounded-b-[50px] shadow-xl text-center">
        <h1 className="text-4xl font-black italic uppercase italic">Thanh toán</h1>
      </div>

      <div className="container mx-auto px-4 -mt-8 space-y-6 max-w-2xl">
        {/* CHỌN SỐ LƯỢNG */}
        <Card className="rounded-[35px] border-none shadow-lg p-6 flex items-center justify-between">
          <span className="font-black italic uppercase text-gray-800">Số lượng sản phẩm</span>
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2 border border-gray-100">
            <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
            <span className="font-black text-xl w-8 text-center">{quantity}</span>
            <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10 text-[#8B7CFF]" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
          </div>
        </Card>

        {/* CHỌN KIỂU THANH TOÁN */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setPayFull(true)} className={`p-6 rounded-[35px] border-2 transition-all flex flex-col items-center gap-2 ${payFull ? 'bg-[#8B7CFF] border-[#8B7CFF] text-white shadow-xl' : 'bg-white border-transparent text-gray-400'}`}>
            <span className="font-black italic uppercase text-[10px]">Thanh toán hết</span>
            <span className="font-black text-lg">{new Intl.NumberFormat('vi-VN').format(totalFull)}đ</span>
          </button>
          <button onClick={() => setPayFull(false)} className={`p-6 rounded-[35px] border-2 transition-all flex flex-col items-center gap-2 ${!payFull ? 'bg-[#8B7CFF] border-[#8B7CFF] text-white shadow-xl' : 'bg-white border-transparent text-gray-400'}`}>
            <span className="font-black italic uppercase text-[10px]">Đặt cọc {depositPercent}%</span>
            <span className="font-black text-lg">{new Intl.NumberFormat('vi-VN').format(totalDeposit)}đ</span>
          </button>
        </div>

        {/* FORM THÔNG TIN KHÁCH (Giữ nguyên như cũ của Ninh) */}
        <Card className="rounded-[35px] border-none shadow-2xl p-8 space-y-6 bg-white">
          <div className="space-y-4">
             <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Họ tên *</Label><Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
             <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Số điện thoại *</Label><Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
             <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-1">Địa chỉ *</Label><Textarea className="rounded-2xl bg-gray-50 border-none h-24 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          </div>
          <Button className="w-full h-20 rounded-[35px] bg-[#8B7CFF] text-xl font-black italic shadow-xl uppercase" disabled={loading} onClick={handleOrder}>
            {loading ? <Loader2 className="animate-spin" /> : `XÁC NHẬN ${new Intl.NumberFormat('vi-VN').format(finalAmount)}đ`}
          </Button>
        </Card>
      </div>
    </div>
  )
}
export default function CheckoutPage() { return <Suspense><CheckoutContent /></Suspense> }

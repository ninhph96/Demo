'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ShoppingBag, ArrowLeft, CreditCard, User, Phone, MapPin, Share2, Loader2, Minus, Plus } from 'lucide-react'
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
  const [quantity, setQuantity] = useState(initialQty) // Số lượng nhận từ trang trước
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
  }, [campaignId])

  // TÍNH TOÁN TIỀN KHỚP VỚI ADMIN
  const unitPrice = selectedItems.reduce((sum, item) => sum + (item.price_vnd || 0), 0)
  const totalFull = unitPrice * quantity
  const depositPercent = campaign?.deposit_percent || 50
  const totalDeposit = Math.round((totalFull * depositPercent) / 100)
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

      // Lưu chi tiết sản phẩm kèm số lượng vào order_items
      await supabase.from('order_items').insert(
        selectedItems.map(item => ({ 
          order_id: order.id, 
          option_id: item.id, 
          quantity: quantity, // Lưu đúng số lượng khách chọn
          status: 'SUBMITTED' 
        }))
      )
      router.push(`/order/success?code=${orderCode}&total=${finalAmount}&name=${encodeURIComponent(formData.name)}`)
    } catch (error: any) { alert(error.message) } finally { setLoading(false) }
  }

  if (!campaign) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-gray-300">Đang tải đơn hàng...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-20">
      <div className="bg-gradient-to-r from-[#8B7CFF] to-[#6366F1] text-white p-8 rounded-b-[50px] shadow-xl">
        <Link href="/" className="flex items-center gap-2 mb-4 text-white/80 font-bold text-[10px] uppercase">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-center">Xác nhận thanh toán</h1>
      </div>

      <div className="container mx-auto px-4 -mt-8 space-y-6 max-w-xl">
        {/* Box điều chỉnh số lượng tại chỗ */}
        <Card className="rounded-[35px] border-none shadow-sm bg-white p-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase italic">Số lượng đặt</span>
            <span className="text-xs font-bold text-gray-800">Bạn có thể thay đổi tại đây</span>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2">
            <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
            <span className="font-black text-xl w-6 text-center">{quantity}</span>
            <Button size="icon" variant="ghost" className="h-10 w-10 text-[#8B7CFF]" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
          </div>
        </Card>

        {/* Nút chọn kiểu thanh toán */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setPayFull(true)} className={`p-6 rounded-[35px] border-2 transition-all flex flex-col items-center gap-2 ${payFull ? 'bg-[#8B7CFF] border-[#8B7CFF] text-white shadow-xl scale-105' : 'bg-white border-transparent text-gray-400'}`}>
            <span className="font-black italic uppercase text-[10px]">Thanh toán hết</span>
            <span className="font-black text-lg">{new Intl.NumberFormat('vi-VN').format(totalFull)}đ</span>
          </button>
          <button onClick={() => setPayFull(false)} className={`p-6 rounded-[35px] border-2 transition-all flex flex-col items-center gap-2 ${!payFull ? 'bg-[#8B7CFF] border-[#8B7CFF] text-white shadow-xl scale-105' : 'bg-white border-transparent text-gray-400'}`}>
            <span className="font-black italic uppercase text-[10px]">Đặt cọc {depositPercent}%</span>
            <span className="font-black text-lg">{new Intl.NumberFormat('vi-VN').format(totalDeposit)}đ</span>
          </button>
        </div>

        {/* Form nhập liệu khách hàng */}
        <Card className="rounded-[40px] border-none shadow-2xl p-8 space-y-6 bg-white">
           <div className="space-y-4">
              <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-2">Họ tên *</Label><Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-2">Số điện thoại *</Label><Input className="rounded-2xl bg-gray-50 border-none h-14 font-bold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] font-black text-gray-400 uppercase ml-2">Địa chỉ nhận hàng *</Label><Textarea className="rounded-2xl bg-gray-50 border-none h-24 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
           </div>

           <Button className="w-full h-20 rounded-[35px] bg-[#8B7CFF] hover:bg-[#6366F1] text-xl font-black italic shadow-xl uppercase transition-all active:scale-95" disabled={loading} onClick={handleOrder}>
             {loading ? <Loader2 className="animate-spin" /> : `THANH TOÁN ${new Intl.NumberFormat('vi-VN').format(finalAmount)}đ`}
           </Button>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() { return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense> }

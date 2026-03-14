'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, Button, Input, Label, Textarea } from '@/components/ui/card' // Giả định import từ card
import { ArrowLeft, Loader2, Minus, Plus, Share2, User, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(parseInt(searchParams.get('qty') || '1'))
  const [payFull, setPayFull] = useState(true)
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', social: '' })
  const [campaign, setCampaign] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const id = searchParams.get('id')
      const { data } = await supabase.from('campaigns').select('*, campaign_options(*)').eq('id', id).single()
      if (data) {
        setCampaign(data)
        const ids = searchParams.get('options')?.split(',') || []
        setSelectedItems(data.campaign_options.filter((o: any) => ids.includes(o.id)))
      }
    }
    load()
  }, [])

  const total = (selectedItems.reduce((s, i) => s + (i.price_vnd || 0), 0)) * quantity
  const final = payFull ? total : Math.round(total * (campaign?.deposit_percent || 50) / 100)

  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Fangirl's Diary Shop nhắc bạn điền đủ thông tin nhé!"); return;
    }
    setLoading(true)
    const code = `ORD${Math.floor(1000 + Math.random() * 9000)}`
    const { data: order } = await supabase.from('orders').insert([{
      customer_name: formData.name, phone: formData.phone, address: formData.address,
      social_id: formData.social, total_amount: final, order_code: code, status: 'SUBMITTED'
    }]).select().single()
    
    await supabase.from('order_items').insert(selectedItems.map(i => ({ order_id: order.id, option_id: i.id, quantity })))
    router.push(`/order/success?code=${code}&total=${final}&name=${encodeURIComponent(formData.name)}`)
  }

  if (!campaign) return <div className="p-20 text-center font-black animate-pulse uppercase text-gray-300">Đang tải...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-20">
      <div className="bg-[#8B7CFF] text-white p-8 rounded-b-[40px] shadow-xl text-center">
        <h1 className="text-2xl font-black italic uppercase">Thanh toán</h1>
      </div>
      <div className="container mx-auto px-4 -mt-8 space-y-4 max-w-xl">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl space-y-5">
           <div className="space-y-4">
              <Input placeholder="Họ tên *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-2xl h-14 font-bold" />
              <Input placeholder="Số điện thoại *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-2xl h-14 font-bold" />
              <Input placeholder="Link Facebook / Zalo *" value={formData.social} onChange={e => setFormData({...formData, social: e.target.value})} className="rounded-2xl h-14 font-bold bg-blue-50" />
              <Textarea placeholder="Địa chỉ nhận hàng *" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-2xl h-24 font-bold" />
           </div>
           <Button className="w-full h-20 rounded-[35px] bg-[#8B7CFF] text-xl font-black italic uppercase" onClick={handleOrder} disabled={loading}>
             {loading ? <Loader2 className="animate-spin" /> : `XÁC NHẬN ${new Intl.NumberFormat('vi-VN').format(final)}đ`}
           </Button>
        </div>
      </div>
    </div>
  )
}
export default function CheckoutPage() { return <Suspense><CheckoutContent /></Suspense> }

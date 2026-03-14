'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ShoppingBag, ArrowLeft, CreditCard, User, Phone, MapPin, Share2, Loader2 } from 'lucide-react'
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
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    social: '' // Thêm mạng xã hội
  })

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

  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price_vnd || 0), 0)

  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Ninh nhắc khách điền đủ thông tin để nhận hàng nhé!");
      return;
    }

    setLoading(true)
    try {
      const orderCode = `ORD${Math.floor(1000 + Math.random() * 9000)}`
      
      // Lưu đơn vào database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          social_link: formData.social, // Lưu link MXH
          total_amount: totalAmount,
          order_code: orderCode,
          status: 'SUBMITTED'
        }])
        .select().single()

      if (orderError) throw orderError

      // Chuyển sang trang Success kèm thông tin để hiện QR
      router.push(`/order/success?code=${orderCode}&total=${totalAmount}&name=${encodeURIComponent(formData.name)}`)
    } catch (error: any) {
      alert("Lỗi: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!campaign) return <div className="p-10 text-center text-gray-400 font-bold animate-pulse">ĐANG TẢI ĐƠN HÀNG...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-20">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#8B7CFF] to-[#6366F1] text-white p-8 rounded-b-[50px] shadow-xl">
        <Link href="/" className="flex items-center gap-2 mb-4 text-white/80 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Xác nhận đơn hàng</h1>
      </div>

      <div className="container mx-auto px-4 -mt-8 space-y-6">
        {/* Tóm tắt đơn hàng */}
        <Card className="rounded-[35px] border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-[10px] flex items-center gap-2 text-gray-400 uppercase font-black tracking-widest">
              <ShoppingBag className="h-4 w-4 text-[#8B7CFF]" /> Sản phẩm đã chọn
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {selectedItems.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <p className="font-bold text-gray-700">{item.version}</p>
                <span className="font-black text-[#8B7CFF]">{formatPrice(item.price_vnd)}đ</span>
              </div>
            ))}
            <div className="pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center text-xl font-black text-gray-800 italic uppercase">
              <span>Tổng cộng:</span>
              <span className="text-[#6366F1]">{formatPrice(totalAmount)}đ</span>
            </div>
          </CardContent>
        </Card>

        {/* Form thông tin khách hàng */}
        <Card className="rounded-[35px] border-none shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-[10px] flex items-center gap-2 text-gray-400 uppercase font-black tracking-widest">
              <User className="h-4 w-4 text-[#8B7CFF]" /> Thông tin nhận hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-500 uppercase ml-1">Họ và tên *</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input 
                    placeholder="Nguyễn Văn A" 
                    className="pl-11 rounded-2xl bg-gray-50 border-none h-14 font-bold focus:ring-2 ring-[#8B7CFF]/20" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-500 uppercase ml-1">Số điện thoại *</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input 
                    placeholder="09xxx..." 
                    className="pl-11 rounded-2xl bg-gray-50 border-none h-14 font-bold" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-500 uppercase ml-1">Facebook / Zalo (Để Ninh liên hệ)</Label>
              <div className="relative">
                <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <Input 
                  placeholder="Link FB hoặc số Zalo..." 
                  className="pl-11 rounded-2xl bg-gray-50 border-none h-14 font-bold" 
                  value={formData.social} onChange={e => setFormData({...formData, social: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black text-gray-500 uppercase ml-1">Địa chỉ nhận hàng *</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-4 w-4 text-gray-300" />
                <Textarea 
                  placeholder="Số nhà, tên đường, phường/xã..." 
                  className="pl-11 rounded-2xl bg-gray-50 border-none h-24 font-bold pt-4" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>
            </div>

            <div className="pt-6">
              <Button 
                className="w-full h-16 rounded-[28px] bg-[#8B7CFF] hover:bg-[#6366F1] text-lg font-black shadow-xl shadow-purple-100 transition-all active:scale-95 uppercase italic"
                disabled={loading}
                onClick={handleOrder}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <><CreditCard className="mr-2 h-6 w-6" /> ĐẶT HÀNG & THANH TOÁN</>}
              </Button>
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase mt-4 tracking-widest">
                Thông tin của bạn sẽ được Ninh bảo mật tuyệt đối
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const campaignId = searchParams.get('id')
  const optionIds = searchParams.get('options')?.split(',') || []

  const [campaign, setCampaign] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  
  // State cho danh sách ngân hàng
  const [banks, setBanks] = useState<any[]>([])
  const [selectedBankId, setSelectedBankId] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    social_id: '',
    notes: ''
  })

  useEffect(() => {
    const loadData = async () => {
      if (!campaignId) return
      // Lấy data campaign
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

      // Lấy danh sách ngân hàng
      const { data: bankData } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true)
      if (bankData) setBanks(bankData)
    }
    loadData()
  }, [campaignId])

  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price_vnd || 0), 0)

  const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Ninh nhắc khách điền đủ Tên, SĐT và Địa chỉ nhé!")
      return
    }
    if (!selectedBankId) {
      alert("Ninh nhắc khách chọn 1 ngân hàng để thanh toán nhé!")
      return
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
          social_id: formData.social_id,
          total_amount: totalAmount,
          order_code: orderCode,
          status: 'SUBMITTED'
        }])
        .select().single()

      if (orderError) throw orderError

      const orderItems = selectedItems.map(item => ({
        order_id: order.id,
        option_id: item.id,
        quantity: 1
      }))
      await supabase.from('order_items').insert(orderItems)

      // Chuyển sang Success kèm theo bankId
      router.push(`/order/success?code=${orderCode}&total=${totalAmount}&name=${encodeURIComponent(formData.name)}&bankId=${selectedBankId}`)
    } catch (error: any) {
      alert("Lỗi: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!campaign) return <div className="p-10 text-center text-gray-400 font-medium">Đang chuẩn bị đơn hàng cho Ninh...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-10">
      <div className="bg-[#8B7CFF] text-white p-6 rounded-b-[40px] shadow-lg">
        <Link href="/" className="flex items-center gap-2 mb-4 text-white/80">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <h1 className="text-2xl font-black italic uppercase">Thanh toán</h1>
      </div>

      <div className="container mx-auto px-4 -mt-6 space-y-4">
        {/* Tóm tắt sản phẩm */}
        <Card className="rounded-[32px] border-none shadow-sm">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-gray-400 uppercase font-black"><ShoppingBag className="h-4 w-4" /> Đơn hàng</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {selectedItems.length > 0 ? selectedItems.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b border-dashed pb-2">
                <p className="font-bold text-gray-700 text-sm">{item.version}</p>
                <span className="font-black text-[#8B7CFF]">{new Intl.NumberFormat('vi-VN').format(item.price_vnd)}đ</span>
              </div>
            )) : <p className="text-sm font-bold text-gray-700">Bản cơ bản</p>}
            <div className="flex justify-between pt-2 text-lg font-black text-gray-800 uppercase italic">
              <span>Tổng cộng:</span>
              <span className="text-[#8B7CFF]">{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</span>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin khách hàng */}
        <Card className="rounded-[32px] border-none shadow-sm">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-gray-400 uppercase font-black"><CreditCard className="h-4 w-4" /> Thông tin nhận hàng</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Họ và tên *</Label>
              <Input className="rounded-xl bg-gray-50 border-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Số điện thoại *</Label>
              <Input className="rounded-xl bg-gray-50 border-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Địa chỉ chi tiết *</Label>
              <Textarea className="rounded-xl bg-gray-50 border-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            {/* PHẦN CHỌN NGÂN HÀNG (Dán đúng chỗ này Ninh nhé) */}
            <div className="pt-4 space-y-3">
              <Label className="text-xs font-black text-[#8B7CFF] uppercase italic">Chọn ngân hàng thanh toán *</Label>
              <div className="grid grid-cols-2 gap-3">
                {banks.map(bank => (
                  <div 
                    key={bank.id}
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                      selectedBankId === bank.id ? 'border-[#8B7CFF] bg-[#F7F6FF] shadow-md shadow-indigo-100' : 'border-gray-50 bg-gray-50'
                    }`}
                  >
                    <p className="font-black text-xs text-gray-700 uppercase italic">{bank.bank_name}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{bank.account_number}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-14 rounded-[24px] bg-[#8B7CFF] hover:bg-[#7A6BEB] text-lg font-black shadow-lg shadow-purple-100 mt-6"
              disabled={loading}
              onClick={handleOrder}
            >
              {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN & THANH TOÁN"}
            </Button>
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

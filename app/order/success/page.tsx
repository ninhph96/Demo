'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { CheckCircle2, Copy, MessageCircle, Home, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderCode = searchParams.get('code') || 'N/A'
  const total = searchParams.get('total') || '0'
  const customerName = searchParams.get('name') || 'KHACH'
  const bankId = searchParams.get('bankId')
  
  const [bank, setBank] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const transferContent = `${customerName.toUpperCase()} ${orderCode}`

  useEffect(() => {
    if (bankId) {
      supabase.from('bank_accounts').select('*').eq('id', bankId).single()
        .then(({ data }) => setBank(data))
    }
  }, [bankId])

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center p-4 pt-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic">Đặt hàng thành công!</h1>
        </div>

        <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
          <div className="bg-[#8B7CFF] p-8 text-white text-center">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Tổng thanh toán</p>
            <p className="text-4xl font-black mt-1">{new Intl.NumberFormat('vi-VN').format(Number(total))}đ</p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="bg-gray-50 rounded-[32px] p-6 border-2 border-dashed border-gray-100 text-center space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase">Quét mã QR {bank?.bank_name}</p>
              {bank?.qr_url ? (
                <img src={bank.qr_url} className="mx-auto w-56 h-56 object-contain rounded-2xl shadow-sm bg-white p-2" />
              ) : (
                <div className="h-56 w-56 mx-auto bg-gray-200 rounded-2xl animate-pulse" />
              )}
              <div className="pt-2">
                <p className="font-black text-[#8B7CFF] uppercase italic">{bank?.bank_name}</p>
                <p className="text-sm font-bold text-gray-600">{bank?.account_number}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-gray-400 uppercase italic">Nội dung chuyển khoản</label>
                <button onClick={() => { navigator.clipboard.writeText(transferContent); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-[#8B7CFF] text-[10px] font-black uppercase">Copy</button>
              </div>
              <div className="bg-[#F7F6FF] p-4 rounded-2xl text-center font-black text-[#8B7CFF] text-xl border border-[#8B7CFF]/20 tracking-widest">
                {transferContent}
              </div>
              {copied && <p className="text-center text-[10px] text-emerald-500 font-bold">Đã sao chép!</p>}
            </div>

            <Button className="w-full h-14 rounded-3xl bg-[#0084FF] hover:bg-[#0073E6] font-black shadow-lg" asChild>
              <a href="https://m.me/ninhph96" target="_blank"><MessageCircle className="mr-2 h-5 w-5" /> GỬI BILL CHO NINH</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}

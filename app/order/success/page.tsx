'use client'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react' // Thêm useEffect
import { CheckCircle2, Copy, MessageCircle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '@/lib/supabase' // Thêm import supabase

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderCode = searchParams.get('code') || 'N/A'
  const total = searchParams.get('total') || '0'
  const customerName = searchParams.get('name') || 'Khách'
  const bankId = searchParams.get('bankId') // Lấy bankId từ URL
  
  const [copied, setCopied] = useState(false)
  const [bankInfo, setBankInfo] = useState<any>(null) // State lưu thông tin ngân hàng

  // 1. Logic lấy thông tin ngân hàng cụ thể từ Supabase
  useEffect(() => {
    if (bankId) {
      const fetchBank = async () => {
        const { data } = await supabase
          .from('bank_accounts')
          .select('*')
          .eq('id', bankId)
          .single()
        if (data) setBankInfo(data)
      }
      fetchBank()
    }
  }, [bankId])

  const transferContent = `${customerName.toUpperCase()} ${orderCode}`

  const copyContent = () => {
    navigator.clipboard.writeText(transferContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-lg space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">ĐẶT HÀNG THÀNH CÔNG!</h1>
        <p className="text-muted-foreground">Mình đã nhận đơn, hãy thanh toán để giữ chỗ nhé.</p>
      </div>

      <Card className="rounded-[32px] overflow-hidden border-none shadow-xl">
        <div className="bg-[#8B7CFF] p-6 text-white text-center">
          <p className="text-xs opacity-80">SỐ TIỀN CẦN THANH TOÁN</p>
          <p className="text-3xl font-black mt-1">
            {new Intl.NumberFormat('vi-VN').format(Number(total))}đ
          </p>
        </div>
        
        <CardContent className="p-6 space-y-6 bg-white">
          {/* 2. Khu vực hiện mã QR ĐỘNG theo ngân hàng khách chọn */}
          <div className="bg-gray-50 rounded-2xl p-4 text-center border-2 border-dashed">
            <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase italic">
              Quét mã QR {bankInfo?.bank_name || ''} để thanh toán
            </p>
            
            <img 
              src={bankInfo?.qr_url || 'https://placehold.co/200x200?text=DANG+TAI+QR'} 
              alt="QR Bank"
              className="mx-auto w-48 rounded-lg shadow-sm bg-white p-2"
              onError={(e) => { (e.target as any).src = "https://placehold.co/200x200?text=LỖI+QR"; }}
            />
            
            {bankInfo && (
              <div className="mt-3 text-center">
                <p className="font-black text-[#8B7CFF] uppercase">{bankInfo.bank_name}</p>
                <p className="text-sm font-bold text-gray-600">{bankInfo.account_number}</p>
                <p className="text-[10px] text-gray-400 uppercase">{bankInfo.account_holder}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 uppercase font-bold">Nội dung chuyển khoản</span>
              <Button variant="ghost" size="sm" onClick={copyContent} className="text-[#8B7CFF] h-6">
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </div>
            <div className="bg-[#F7F6FF] p-4 rounded-xl text-center font-black text-[#8B7CFF] text-lg border border-[#8B7CFF]/20">
              {transferContent}
            </div>
            {copied && <p className="text-center text-[10px] text-emerald-600">Đã sao chép nội dung!</p>}
          </div>

          <Button className="w-full rounded-2xl h-12 bg-[#0084FF] hover:bg-[#0073E6]" asChild>
            <a href="https://m.me/DLThachThao" target="_blank" rel="noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" /> Nhắn bill cho Mình
            </a>
          </Button>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full rounded-2xl">
              <Home className="h-4 w-4 mr-2" /> Về trang chủ
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}

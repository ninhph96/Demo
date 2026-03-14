'use client'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { CheckCircle2, Copy, MessageCircle, Home, CreditCard, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderCode = searchParams.get('code') || 'N/A'
  const total = searchParams.get('total') || '0'
  const customerName = searchParams.get('name') || 'KHACH'
  
  const [copied, setCopied] = useState(false)
  const transferContent = `${customerName.toUpperCase()} ${orderCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(transferContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center p-4 pt-10 pb-20">
      <div className="w-full max-w-md space-y-6">
        {/* Header thành công */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-2 animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic leading-none">Đã ghi nhận đơn hàng!</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Vui lòng thanh toán để hoàn tất</p>
        </div>

        <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
          {/* Box tiền */}
          <div className="bg-[#8B7CFF] p-8 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Tổng tiền cần chuyển</p>
              <p className="text-4xl font-black mt-1">
                {new Intl.NumberFormat('vi-VN').format(Number(total))}đ
              </p>
            </div>
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>

          <CardContent className="p-8 space-y-8">
            {/* Box QR Code */}
            <div className="relative group">
              <div className="bg-gray-50 rounded-[40px] p-6 border-2 border-dashed border-gray-100 text-center space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Quét mã QR để thanh toán nhanh</p>
                
                {/* HIỂN THỊ FILE BANK.PNG TỪ THƯ MỤC PUBLIC */}
                <div className="relative mx-auto w-64 h-64 bg-white rounded-3xl p-3 shadow-inner">
                   <img 
                    // Sửa từ "/bank.png" thành "bank.png" hoặc "./bank.png"
                    src="bank.png" 
                    alt="Mã QR Ngân hàng"
                    className="w-full h-full object-contain rounded-2xl"
                    onError={(e) => {
                        // Dự phòng thêm phương án full đường dẫn nếu vẫn lỗi
                        (e.target as any).src = "https://ninhph96.github.io/Demo/bank.png"
                      }}
                    />
                </div>

                <div className="space-y-1">
                  <p className="font-black text-[#8B7CFF] uppercase italic text-lg">Thạch Thảo ORDER KPOP</p>
                  <p className="text-xs font-bold text-gray-400">Vui lòng kiểm tra kỹ số tiền trước khi quét</p>
                </div>
              </div>
            </div>

            {/* Nội dung chuyển khoản */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-gray-400 uppercase italic">Nội dung chuyển khoản</label>
                {copied && <span className="text-emerald-500 text-[10px] font-bold animate-pulse">Đã chép!</span>}
              </div>
              
              <button 
                onClick={handleCopy}
                className="w-full bg-[#F7F6FF] p-5 rounded-3xl text-center border-2 border-[#8B7CFF]/20 hover:border-[#8B7CFF] transition-all group active:scale-95"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-black text-[#8B7CFF] text-xl tracking-widest uppercase italic">
                    {transferContent}
                  </span>
                  <Copy className="h-4 w-4 text-[#8B7CFF] group-hover:scale-125 transition-transform" />
                </div>
              </button>
              <p className="text-[9px] text-center text-gray-400 font-medium">Bấm vào ô trên để tự động sao chép nội dung</p>
            </div>

            {/* Nút hành động */}
            <div className="grid grid-cols-1 gap-3 pt-4">
              <Button className="w-full h-16 rounded-[28px] bg-[#0084FF] hover:bg-[#0073E6] font-black shadow-xl shadow-blue-100 text-white" asChild>
                <a href="https://m.me/DLThachThao" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-6 w-6" /> GỬI BILL XÁC NHẬN
                </a>
              </Button>
              
              <Link href="/">
                <Button variant="ghost" className="w-full h-12 rounded-2xl text-gray-400 font-bold hover:bg-gray-50">
                  <Home className="mr-2 h-4 w-4" /> Về trang chủ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">
          Cảm ơn bạn đã tin tưởng Ninh Order Kpop
        </p>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Đang tải...</div>}>
      <SuccessContent />
    </Suspense>
  )
}

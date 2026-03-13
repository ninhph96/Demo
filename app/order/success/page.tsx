'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Copy, MessageCircle, QrCode, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { useOrders } from '@/lib/order-context'
import { useState, Suspense } from 'react'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderCode = searchParams.get('code')
  const { getOrderByCode } = useOrders()
  const order = orderCode ? getOrderByCode(orderCode) : undefined
  const [copied, setCopied] = useState(false)

  const copyOrderCode = () => {
    if (orderCode) {
      navigator.clipboard.writeText(orderCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h1>
          <Link href="/">
            <Button variant="outline" className="rounded-xl">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-lg">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-muted-foreground">
          Cảm ơn bạn đã đặt hàng. Vui lòng thanh toán để hoàn tất.
        </p>
      </div>

      {/* Order Code */}
      <Card className="mb-4 border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
              <p className="text-2xl font-bold text-primary tracking-wider">
                {order.orderCode}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyOrderCode}
              className="rounded-xl"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {copied && (
            <p className="text-sm text-emerald-600 mt-2">Đã sao chép!</p>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chi tiết đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Chiến dịch</span>
            <span className="font-medium text-right">{order.campaignName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Khách hàng</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Số điện thoại</span>
            <span className="font-medium">{order.phone}</span>
          </div>
          
          <div className="border-t border-border pt-3">
            <p className="text-sm font-medium mb-2">Sản phẩm:</p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">
                  {item.optionName} x{item.quantity}
                </span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-semibold">Tổng cộng</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(order.totalAmount)}
            </span>
          </div>

          <Badge variant="outline" className="w-full justify-center py-2 text-amber-600 border-amber-300 bg-amber-50">
            Chưa thanh toán
          </Badge>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <div className="w-32 h-32 bg-white border border-border rounded-xl mx-auto mb-3 flex items-center justify-center">
              <QrCode className="h-20 w-20 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground">
              Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngân hàng</span>
              <span className="font-medium">Vietcombank</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số tài khoản</span>
              <span className="font-medium">1234567890</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chủ tài khoản</span>
              <span className="font-medium">NGUYEN VAN A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nội dung CK</span>
              <span className="font-medium text-primary">{order.orderCode}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Button */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground mb-3 text-center">
            Sau khi chuyển khoản, vui lòng nhắn tin để xác nhận đơn hàng
          </p>
          <Button className="w-full rounded-xl h-12" asChild>
            <a href="https://m.me/yourpage" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" />
              Nhắn Page chốt đơn
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Link href={`/track?code=${order.orderCode}`} className="flex-1">
          <Button variant="outline" className="w-full rounded-xl">
            Tra cứu đơn
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full rounded-xl">
            <Home className="h-4 w-4 mr-2" />
            Trang chủ
          </Button>
        </Link>
      </div>
    </main>
  )
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Header />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-6 text-center">
          <p>Đang tải...</p>
        </div>
      }>
        <OrderSuccessContent />
      </Suspense>
      <BottomNav />
    </div>
  )
}

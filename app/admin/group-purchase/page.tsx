'use client'

import { useState } from 'react'
import { Package, ShoppingCart, CheckCircle2, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function GroupPurchasePage() {
  const [storeFilter, setStoreFilter] = useState<string>('ALL')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Ninh có thể viết hàm lấy dữ liệu từ Supabase trực tiếp tại đây thay vì dùng context cũ
  const filteredData: any[] = [] 

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black italic uppercase text-gray-800 leading-none">Gom đơn mua hàng</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Tổng hợp số lượng sản phẩm cần đặt từ các shop</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Các Card thống kê giữ nguyên giao diện đẹp của Ninh */}
        <Card className="rounded-3xl border-none shadow-sm p-4 flex items-center gap-3">
           <div className="p-3 rounded-2xl bg-purple-50"><Package className="h-5 w-5 text-[#8B7CFF]" /></div>
           <div><p className="text-xl font-black italic">0</p><p className="text-[9px] font-bold text-gray-400 uppercase">Sản phẩm</p></div>
        </Card>
      </div>

      <Card className="rounded-[35px] border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold uppercase text-[10px]">Chiến dịch</TableHead>
              <TableHead className="font-bold uppercase text-[10px]">Cửa hàng</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px]">Số lượng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className="text-center py-20 text-gray-400 font-bold italic">
                Chưa có dữ liệu gom đơn
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

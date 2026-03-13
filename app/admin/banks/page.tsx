'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Trash2, Landmark } from 'lucide-react'

export default function BankAdminPage() {
  const [banks, setBanks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', number: '', holder: '' })

  const fetchBanks = async () => {
    const { data } = await supabase.from('bank_accounts').select('*')
    if (data) setBanks(data)
  }

  useEffect(() => { fetchBanks() }, [])

  const handleUploadAndSave = async (e: any) => {
    const file = e.target.files[0]
    if (!file || !formData.name) return alert("Nhập tên bank và chọn ảnh QR nhé!")
    
    setLoading(true)
    try {
      // 1. Up ảnh vào thư mục Bank
      const fileName = `${Date.now()}_${file.name}`
      const { data: upData } = await supabase.storage.from('images').upload(`Bank/${fileName}`, file)
      
      const qrUrl = supabase.storage.from('images').getPublicUrl(`Bank/${fileName}`).data.publicUrl

      // 2. Lưu vào bảng bank_accounts
      await supabase.from('bank_accounts').insert([{
        bank_name: formData.name,
        account_number: formData.number,
        account_holder: formData.holder,
        qr_url: qrUrl
      }])

      fetchBanks()
      setFormData({ name: '', number: '', holder: '' })
      alert("Đã thêm ngân hàng mới!")
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Landmark /> Quản lý Ngân hàng</h1>
      
      <Card className="rounded-3xl border-none shadow-lg">
        <CardHeader><CardTitle>Thêm tài khoản mới</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input placeholder="Tên Bank (VD: VCB)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input placeholder="Số tài khoản" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
          <Input placeholder="Chủ tài khoản" value={formData.holder} onChange={e => setFormData({...formData, holder: e.target.value})} />
          <div className="relative">
            <Input type="file" onChange={handleUploadAndSave} disabled={loading} className="cursor-pointer" />
            {loading && <Loader2 className="absolute right-2 top-2 animate-spin h-4 w-4" />}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banks.map(bank => (
          <Card key={bank.id} className="rounded-2xl overflow-hidden border-none shadow-md">
            <img src={bank.qr_url} className="w-full h-48 object-contain bg-gray-50 p-4" />
            <CardContent className="p-4 space-y-1">
              <p className="font-bold text-[#8B7CFF]">{bank.bank_name}</p>
              <p className="text-sm font-medium">{bank.account_number}</p>
              <p className="text-xs text-gray-400">{bank.account_holder}</p>
              <Button variant="ghost" className="w-full text-red-500 mt-2 h-8" onClick={async () => {
                await supabase.from('bank_accounts').delete().eq('id', bank.id)
                fetchBanks()
              }}><Trash2 className="h-4 w-4 mr-2" /> Xóa</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

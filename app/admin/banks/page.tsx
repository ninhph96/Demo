'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Trash2, Landmark, Upload } from 'lucide-react'

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
    if (!file || !formData.name) return alert("Nhập tên bank và chọn QR nhé!")
    
    setLoading(true)
    try {
      // Tự đổi tên file theo tên Ngân hàng để dễ quản lý
      const fileExt = file.name.split('.').pop()
      const fileName = `${formData.name.toUpperCase()}_QR.${fileExt}`
      const filePath = `Bank/${fileName}`

      // Upload (ghi đè nếu trùng tên)
      const { error: upError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { upsert: true })

      if (upError) throw upError

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath)
      const qrUrl = urlData.publicUrl

      await supabase.from('bank_accounts').insert([{
        bank_name: formData.name,
        account_number: formData.number,
        account_holder: formData.holder,
        qr_url: qrUrl
      }])

      fetchBanks()
      setFormData({ name: '', number: '', holder: '' })
      alert("Đã lưu ngân hàng!")
    } catch (err: any) {
      alert("Lỗi: " + err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-black italic uppercase text-[#8B7CFF] flex items-center gap-2">
        <Landmark /> Cấu hình Ngân hàng
      </h1>
      
      <Card className="rounded-[32px] border-none shadow-xl bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 ml-2">TÊN NGÂN HÀNG</label>
            <Input placeholder="VD: Vietcombank" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-2xl bg-gray-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 ml-2">SỐ TÀI KHOẢN</label>
            <Input placeholder="1234..." value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="rounded-2xl bg-gray-50 border-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 ml-2">CHỦ TÀI KHOẢN</label>
            <Input placeholder="PHAM HAI NINH" value={formData.holder} onChange={e => setFormData({...formData, holder: e.target.value})} className="rounded-2xl bg-gray-50 border-none" />
          </div>
          <div className="relative">
            <Input type="file" id="qr-up" onChange={handleUploadAndSave} className="hidden" />
            <Button asChild className="w-full h-12 rounded-2xl bg-[#8B7CFF] hover:bg-[#7A6BEB]">
              <label htmlFor="qr-up" className="cursor-pointer">
                {loading ? <Loader2 className="animate-spin" /> : <><Upload className="mr-2 h-4 w-4" /> Lưu & Up QR</>}
              </label>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {banks.map(bank => (
          <Card key={bank.id} className="rounded-[32px] overflow-hidden border-none shadow-md bg-white text-center">
            <div className="p-4 bg-gray-50 flex justify-center">
               <img src={bank.qr_url} className="h-32 w-32 object-contain rounded-xl" />
            </div>
            <div className="p-4 space-y-1">
              <p className="font-black text-sm text-[#8B7CFF] uppercase">{bank.bank_name}</p>
              <Button variant="ghost" size="sm" className="text-red-500" onClick={async () => {
                await supabase.from('bank_accounts').delete().eq('id', bank.id)
                fetchBanks()
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

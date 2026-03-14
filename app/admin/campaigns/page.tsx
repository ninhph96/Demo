'use client'

import { useState, useEffect } from 'react'
import { Plus, MoreVertical, Eye, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { campaignStatusLabels, storeOptions } from '@/lib/types'
import type { CampaignStatus } from '@/lib/types'
import { supabase } from '@/lib/supabase'

function getStatusColor(status: CampaignStatus): string {
  switch (status) {
    case 'OPEN': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'CLOSING_SOON': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'CLOSED': return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'DRAFT': return 'bg-blue-100 text-blue-600 border-blue-200'
    default: return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

interface OptionForm {
  id?: string
  version: string
  price: string
  deposit: string 
}

const emptyOption: OptionForm = { version: '', price: '', deposit: '' }

export default function CampaignsPage() {
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [store, setStore] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<CampaignStatus>('DRAFT')
  const [closeDate, setCloseDate] = useState('')
  const [depositPercent, setDepositPercent] = useState(50) // Mặc định 50%
  const [options, setOptions] = useState<OptionForm[]>([{ ...emptyOption }])

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('*, campaign_options(*)')
      .order('created_at', { ascending: false })
    if (data) setDbCampaigns(data)
  }

  useEffect(() => { fetchCampaigns() }, [])

  // Hàm tự động tính tiền cọc khi nhập giá hoặc đổi %
  const calculateDeposit = (price: string, percent: number) => {
  const p = parseInt(price) || 0;
  return Math.round((p * percent) / 100).toString();
};

  const openModal = (campaign?: any) => {
    if (campaign) {
      setEditingCampaign(campaign)
      setName(campaign.title || '')
      setStore(campaign.store_name || '')
      setImageUrl(campaign.image_url || '')
      setStatus(campaign.status || 'DRAFT')
      setCloseDate(campaign.close_date || '')
      setDepositPercent(campaign.deposit_percent || 50)
      setOptions(campaign.campaign_options?.length > 0 
        ? campaign.campaign_options.map((o: any) => ({
            id: o.id,
            version: o.version || '',
            price: o.price_vnd?.toString() || '0',
            deposit: o.deposit_amount?.toString() || '0',
          }))
        : [{ ...emptyOption }]
      )
    } else {
      setEditingCampaign(null); setName(''); setStore(''); setImageUrl(''); setStatus('OPEN'); setCloseDate(''); setDepositPercent(50); setOptions([{ ...emptyOption }])
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const campaignData = {
        title: name,
        store_name: store,
        image_url: imageUrl, 
        status: status,
        deposit_percent: depositPercent, // Lưu % cọc vào CSDL
        close_date: closeDate ? closeDate : null 
      }

      let campaignId = editingCampaign?.id
      if (editingCampaign) {
        await supabase.from('campaigns').update(campaignData).eq('id', campaignId)
        await supabase.from('campaign_options').delete().eq('campaign_id', campaignId)
      } else {
        const { data } = await supabase.from('campaigns').insert([campaignData]).select().single()
        campaignId = data.id
      }

      const optionsToInsert = options
        .filter(o => o.version && o.price)
        .map(o => ({
          campaign_id: campaignId,
          version: o.version,
          price_vnd: parseInt(o.price) || 0,
          deposit_amount: parseInt(o.deposit) || 0,
        }))

      if (optionsToInsert.length > 0) {
        await supabase.from('campaign_options').insert(optionsToInsert)
      }

      setIsModalOpen(false)
      fetchCampaigns()
      alert("Đã lưu chiến dịch!")
    } catch (error: any) { alert(error.message) } finally { setLoading(false) }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black italic uppercase text-[#8B7CFF]">Quản lý chiến dịch</h1>
        <Button onClick={() => openModal()} className="rounded-2xl bg-[#8B7CFF] hover:bg-[#7A6BEB] shadow-lg shadow-purple-100 uppercase italic font-bold">
          <Plus className="h-4 w-4 mr-2" /> Tạo mới
        </Button>
      </div>

      <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold uppercase text-[10px]">Album</TableHead>
              <TableHead className="font-bold uppercase text-[10px]">Cọc %</TableHead>
              <TableHead className="font-bold uppercase text-[10px]">Trạng thái</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dbCampaigns.map((campaign) => (
              <TableRow key={campaign.id} className="hover:bg-gray-50/50">
                <TableCell className="font-bold text-gray-700">{campaign.title}</TableCell>
                <TableCell className="font-black text-[#8B7CFF] italic">{campaign.deposit_percent}%</TableCell>
                <TableCell>
                  <Badge className={`rounded-lg border-none ${getStatusColor(campaign.status)}`}>
                    {campaignStatusLabels[campaign.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl">
                      <DropdownMenuItem onClick={() => openModal(campaign)}><Eye className="h-4 w-4 mr-2" /> Sửa</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { if(confirm('Xóa?')) supabase.from('campaigns').delete().eq('id', campaign.id).then(fetchCampaigns) }} className="text-red-500"><Trash2 className="h-4 w-4 mr-2" /> Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[40px] border-none">
          <DialogHeader><DialogTitle className="text-2xl font-black italic uppercase text-gray-800">{editingCampaign ? 'Cập nhật' : 'Tạo mới'} album</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Tên album *</Label><Input className="rounded-2xl bg-gray-50 border-none h-12 font-bold" value={name} onChange={(e) => setName(e.target.value)} required /></div>
              
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Store *</Label>
                <Select value={store} onValueChange={setStore} required>
                  <SelectTrigger className="rounded-2xl bg-gray-50 border-none h-12 font-bold"><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">{storeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* LỰA CHỌN % CỌC NHƯ NINH YÊU CẦU */}
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1 text-[#8B7CFF]">Mức tiền cọc (%)</Label>
                <Select value={depositPercent.toString()} onValueChange={(v) => {
                  const p = parseInt(v); setDepositPercent(p);
                  // Cập nhật lại toàn bộ tiền cọc khi đổi %
                  const updated = options.map(o => ({ ...o, deposit: calculateDeposit(o.price, p) }));
                  setOptions(updated);
                }}>
                  <SelectTrigger className="rounded-2xl bg-[#8B7CFF]/10 border-none h-12 font-black text-[#8B7CFF]"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="50">Cọc 50%</SelectItem>
                    <SelectItem value="70">Cọc 70%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2"><Label className="text-[10px] font-black uppercase ml-1">URL Ảnh bìa</Label><Input className="rounded-2xl bg-gray-50 border-none h-12" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /></div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center"><Label className="font-black italic uppercase text-gray-400 text-[11px]">Các phiên bản & Giá</Label>
              <Button type="button" variant="outline" size="sm" className="rounded-xl border-[#8B7CFF] text-[#8B7CFF] font-bold" onClick={() => setOptions([...options, { ...emptyOption }])}>+ Thêm bản</Button></div>
              
              {options.map((option, index) => (
  <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-[28px] border border-gray-100 relative group items-end">
    {/* 1. Tên phiên bản */}
    <div className="col-span-5 space-y-1">
      <Label className="text-[9px] uppercase font-bold text-gray-400 ml-1">Phiên bản</Label>
      <Input 
        placeholder="Bản A, B..." 
        className="rounded-xl border-none h-11 font-bold shadow-sm" 
        value={option.version} 
        onChange={(e) => {
          const n = [...options]; n[index].version = e.target.value; setOptions(n);
        }} 
      />
    </div>

    {/* 2. Giá VND (Nhập vào đây) */}
    <div className="col-span-4 space-y-1">
      <Label className="text-[9px] uppercase font-bold text-gray-400 ml-1">Giá bán (VND)</Label>
      <Input 
        type="number" 
        className="rounded-xl border-none h-11 font-black text-[#8B7CFF] shadow-sm" 
        value={option.price} 
        onChange={(e) => {
          const n = [...options]; 
          n[index].price = e.target.value;
          // TỰ ĐỘNG TÍNH TIỀN CỌC THEO % ĐÃ CHỌN Ở TRÊN
          n[index].deposit = calculateDeposit(e.target.value, depositPercent); 
          setOptions(n);
        }} 
      />
    </div>

    {/* 3. Hiển thị số tiền cọc (Chỉ hiển thị, không cho nhập tay) */}
    <div className="col-span-3 space-y-1 text-right">
      <Label className="text-[9px] uppercase font-black text-[#8B7CFF] mr-1 italic">Cọc ({depositPercent}%)</Label>
      <div className="h-11 flex items-center justify-end pr-2 font-black text-[#8B7CFF] text-lg italic">
        {new Intl.NumberFormat('vi-VN').format(parseInt(option.deposit) || 0)}
      </div>
    </div>

    {/* Nút xóa bản */}
    <Button 
      type="button" 
      variant="ghost" 
      className="absolute -right-2 -top-2 bg-white shadow-md rounded-full h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" 
      onClick={() => setOptions(options.filter((_, i) => i !== index))}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
))}
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading} className="w-full h-16 rounded-[28px] bg-[#8B7CFF] hover:bg-[#6366F1] shadow-xl shadow-purple-100 text-lg font-black italic uppercase">
                {loading ? <Loader2 className="animate-spin mr-2" /> : 'Lưu chiến dịch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, MoreVertical, Link2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { campaignStatusLabels, storeOptions } from '@/lib/types'
import type { CampaignStatus } from '@/lib/types'
import { supabase } from '@/lib/supabase'

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Chưa đặt'
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

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
  deposit: string // Thêm trường deposit cho form
  benefit: string
  label: string
}

const emptyOption: OptionForm = { version: '', price: '', deposit: '', benefit: '', label: '' }

export default function CampaignsPage() {
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [store, setStore] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<CampaignStatus>('DRAFT')
  const [closeDate, setCloseDate] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState<OptionForm[]>([{ ...emptyOption }])
  
  const [scraperUrl, setScraperUrl] = useState('')
  const [isScraperLoading, setIsScraperLoading] = useState(false)
  const [scraperError, setScraperError] = useState('')

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_options(*)')
      .order('created_at', { ascending: false })
    if (data) setDbCampaigns(data)
  }

  useEffect(() => { fetchCampaigns() }, [])

  const openModal = (campaign?: any) => {
    if (campaign) {
      setEditingCampaign(campaign)
      setName(campaign.title || '')
      setStore(campaign.store_name || '')
      setImageUrl(campaign.image_url || '')
      setStatus(campaign.status || 'DRAFT')
      setCloseDate(campaign.close_date || '')
      setDescription(campaign.description || '')
      setOptions(campaign.campaign_options?.length > 0 
        ? campaign.campaign_options.map((o: any) => ({
            id: o.id,
            version: o.version || '',
            price: o.price_vnd?.toString() || '0',
            deposit: o.deposit_amount?.toString() || '0',
            benefit: o.benefit || '',
            label: o.label || ''
          }))
        : [{ ...emptyOption }]
      )
    } else {
      setEditingCampaign(null)
      setName('')
      setStore('')
      setImageUrl('')
      setStatus('OPEN')
      setCloseDate('')
      setDescription('')
      setOptions([{ ...emptyOption }])
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
        description: description,
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
          name: o.version,
          price_vnd: parseInt(o.price) || 0,
          deposit_amount: parseInt(o.deposit) || 0,
          benefit: o.benefit || null,
          label: o.label || null
        }))

      if (optionsToInsert.length > 0) {
        await supabase.from('campaign_options').insert(optionsToInsert)
      }

      alert("Thành công!")
      setIsModalOpen(false)
      fetchCampaigns()
    } catch (error: any) {
      alert("Lỗi: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (campaign: any) => {
    if (confirm(`Xóa "${campaign.title}"?`)) {
      await supabase.from('campaigns').delete().eq('id', campaign.id)
      fetchCampaigns()
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#8B7CFF]">Quản lý chiến dịch</h1>
        <Button onClick={() => openModal()} className="rounded-xl bg-[#8B7CFF]">
          <Plus className="h-4 w-4 mr-2" /> Tạo chiến dịch
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chiến dịch</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dbCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-bold">{campaign.title}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(campaign.status)}>{campaignStatusLabels[campaign.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* SỬA NÚT XEM Ở ĐÂY: Dùng openModal để hiện dữ liệu */}
                        <DropdownMenuItem onClick={() => openModal(campaign)}>
                          <Eye className="h-4 w-4 mr-2" /> Xem / Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(campaign)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCampaign ? 'Cập nhật' : 'Tạo mới'} chiến dịch</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Tên album *</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div><Label>Cửa hàng *</Label>
                <Select value={store} onValueChange={setStore} required>
                  <SelectTrigger><SelectValue placeholder="Chọn Store" /></SelectTrigger>
                  <SelectContent>{storeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Ngày đóng</Label><Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} /></div>
              <div className="col-span-2"><Label>URL Ảnh bìa</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /></div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center"><Label className="font-bold">Các phiên bản</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setOptions([...options, { ...emptyOption }])}>+ Thêm</Button></div>
              {options.map((option, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-xl border">
                  <Input placeholder="Bản A/B..." className="col-span-4" value={option.version} onChange={(e) => {
                    const n = [...options]; n[index].version = e.target.value; setOptions(n);
                  }} />
                  <Input type="number" placeholder="Giá VND" className="col-span-4" value={option.price} onChange={(e) => {
                    const n = [...options]; n[index].price = e.target.value; setOptions(n);
                  }} />
                  <Input type="number" placeholder="Tiền cọc" className="col-span-3" value={option.deposit} onChange={(e) => {
                    const n = [...options]; n[index].deposit = e.target.value; setOptions(n);
                  }} />
                  <Button type="button" variant="ghost" className="col-span-1 text-red-500" onClick={() => setOptions(options.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <DialogFooter><Button type="submit" disabled={loading} className="w-full bg-[#8B7CFF]">{loading ? 'Đang lưu...' : 'Lưu chiến dịch'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

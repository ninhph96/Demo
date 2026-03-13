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
import type { Campaign, CampaignStatus } from '@/lib/types'
import Link from 'next/link'
import { supabase } from '@/lib/supabase' // Đảm bảo file này đã có URL/Key của bạn

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

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
  benefit: string
  label: string
}

const emptyOption: OptionForm = { version: '', price: '', benefit: '', label: '' }

export default function CampaignsPage() {
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [store, setStore] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<CampaignStatus>('DRAFT')
  const [closeDate, setCloseDate] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState<OptionForm[]>([{ ...emptyOption }])
  
  // Scraper state
  const [scraperUrl, setScraperUrl] = useState('')
  const [isScraperLoading, setIsScraperLoading] = useState(false)
  const [scraperError, setScraperError] = useState('')

  // Lấy dữ liệu từ Supabase khi mở trang
  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_options(*)')
      .order('created_at', { ascending: false })
    
    if (data) setDbCampaigns(data)
    if (error) console.error("Lỗi lấy dữ liệu:", error)
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  // Phương án 1: Tự động quét dữ liệu
  const handleAutoFill = async () => {
    if (!scraperUrl.trim()) {
      setScraperError('Vui lòng nhập URL')
      return
    }
    setIsScraperLoading(true)
    setScraperError('')

    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(scraperUrl)}`
      const response = await fetch(proxyUrl)
      const data = await response.json()
      
      if (data.contents) {
        const html = data.contents
        const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)

        if (titleMatch) setName(titleMatch[1])
        if (imageMatch) setImageUrl(imageMatch[1])

        if (scraperUrl.includes('aladin')) setStore('Aladin')
        else if (scraperUrl.includes('ktown4u')) setStore('Ktown4U')
        else if (scraperUrl.includes('weverse')) setStore('Weverse Shop')

        if (!titleMatch && !imageMatch) setScraperError('Không tìm thấy thông tin. Hãy nhập tay.')
      }
    } catch (error) {
      setScraperError('Lỗi khi quét. Hãy nhập tay bên dưới.')
    } finally {
      setIsScraperLoading(false)
    }
  }

  const openModal = (campaign?: any) => {
    if (campaign) {
      setEditingCampaign(campaign)
      setName(campaign.name)
      setStore(campaign.store)
      setImageUrl(campaign.image_url || '')
      setStatus(campaign.status)
      setCloseDate(campaign.close_date || '')
      setDescription(campaign.description || '')
      setOptions(campaign.campaign_options.map((o: any) => ({
        id: o.id,
        version: o.version,
        price: o.price.toString(),
        benefit: o.benefit || '',
        label: o.label || ''
      })))
    } else {
      setEditingCampaign(null)
      setName('')
      setStore('')
      setImageUrl('')
      setStatus('OPEN')
      setCloseDate('')
      setDescription('')
      setOptions([{ ...emptyOption }])
      setScraperUrl('')
      setScraperError('')
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
      const { error: updateError } = await supabase
        .from('campaigns')
        .update(campaignData)
        .eq('id', campaignId)
      if (updateError) throw updateError
      
      await supabase.from('campaign_options').delete().eq('campaign_id', campaignId)
    } else {
      const { data, error: insertError } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single()
      if (insertError) throw insertError
      campaignId = data.id
    }

    // CHÚ Ý: Sửa tên cột cho khớp với ảnh bảng campaign_options của Ninh
    const optionsToInsert = options
      .filter(o => o.version && o.price)
      .map(o => ({
        campaign_id: campaignId,
        version: o.version,
        price_vnd: parseInt(o.price) || 0, // Đổi từ price sang price_vnd
        benefit: o.benefit || null,
        label: o.label || null
      }))

    const { error: optionsError } = await supabase
      .from('campaign_options')
      .insert(optionsToInsert)
    if (optionsError) throw optionsError

    alert("Tuyệt vời Ninh ơi! Web đã nhận sản phẩm thật rồi nhé!")
    setIsModalOpen(false)
    fetchCampaigns()
  } catch (error: any) {
    alert("Lỗi vẫn còn nè: " + error.message)
  } finally {
    setLoading(false)
  }
}

  const handleDelete = async (campaign: any) => {
    if (confirm(`Xóa chiến dịch "${campaign.name}"? Dữ liệu đơn hàng liên quan cũng sẽ bị ảnh hưởng.`)) {
      await supabase.from('campaigns').delete().eq('id', campaign.id)
      fetchCampaigns()
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#8B7CFF]">Quản lý chiến dịch</h1>
          <p className="text-muted-foreground">Dữ liệu thật từ Supabase</p>
        </div>
        <Button onClick={() => openModal()} className="rounded-xl bg-[#8B7CFF] hover:bg-[#7A6BEB]">
          <Plus className="h-4 w-4 mr-2" /> Tạo chiến dịch
        </Button>
      </div>

      <Card className="mb-6"><CardContent className="pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm tên album..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-0"><div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Chiến dịch</TableHead>
            <TableHead>Cửa hàng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày đóng</TableHead>
            <TableHead className="w-[100px]">Thao tác</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {dbCampaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div className="font-bold text-gray-800">{campaign.name}</div>
                  <div className="text-xs text-muted-foreground">{campaign.campaign_options?.length || 0} phiên bản</div>
                </TableCell>
                <TableCell><Badge variant="outline">{campaign.store}</Badge></TableCell>
                <TableCell><Badge className={`${getStatusColor(campaign.status)} border`}>{campaignStatusLabels[campaign.status]}</Badge></TableCell>
                <TableCell>{formatDate(campaign.close_date)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={`/campaign?id=${campaign.id}`}><Eye className="h-4 w-4 mr-2" /> Xem</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openModal(campaign)}><Edit2 className="h-4 w-4 mr-2" /> Sửa</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(campaign)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div></CardContent></Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCampaign ? 'Cập nhật' : 'Tạo mới'} chiến dịch</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Phương án 1: Scraper */}
            {!editingCampaign && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                <Label className="font-bold text-[#8B7CFF] flex items-center gap-2"><Link2 className="h-4 w-4" /> Phương án 1: Tự điền từ URL Aladin/Weverse</Label>
                <div className="flex gap-2">
                  <Input value={scraperUrl} onChange={(e) => setScraperUrl(e.target.value)} placeholder="Dán link sản phẩm vào đây..." className="rounded-xl flex-1" />
                  <Button type="button" variant="secondary" onClick={handleAutoFill} disabled={isScraperLoading}>
                    {isScraperLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Quét'}
                  </Button>
                </div>
                {scraperError && <p className="text-xs text-red-500">{scraperError}</p>}
              </div>
            )}

            {/* Phương án 2: Điền tay */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Tên album *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="VD: NewJeans 2nd EP 'Get Up'" />
              </div>
              <div className="space-y-1">
                <Label>Cửa hàng *</Label>
                <Select value={store} onValueChange={setStore} required>
                  <SelectTrigger><SelectValue placeholder="Chọn Store" /></SelectTrigger>
                  <SelectContent>{storeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Ngày đóng</Label>
                <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>URL Ảnh bìa</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Dán link ảnh tại đây..." />
                {imageUrl && <img src={imageUrl} className="h-20 w-20 mt-2 rounded border object-cover" />}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center"><Label className="font-bold">Các phiên bản & Giá</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setOptions([...options, { ...emptyOption }])}>+ Thêm bản</Button></div>
              {options.map((option, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-xl border">
                  <Input placeholder="Bản A/B/C" value={option.version} onChange={(e) => {
                    const n = [...options]; n[index].version = e.target.value; setOptions(n);
                  }} className="col-span-5" />
                  <Input type="number" placeholder="Giá VND" value={option.price} onChange={(e) => {
                    const n = [...options]; n[index].price = e.target.value; setOptions(n);
                  }} className="col-span-5" />
                  <Button type="button" variant="ghost" className="col-span-2 text-red-500" onClick={() => setOptions(options.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full bg-[#8B7CFF]">{loading ? 'Đang lưu...' : 'Lưu chiến dịch'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

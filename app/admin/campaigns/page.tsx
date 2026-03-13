'use client'

import { useState } from 'react'
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
import { useOrders } from '@/lib/order-context'
import { campaignStatusLabels, storeOptions } from '@/lib/types'
import type { Campaign, CampaignStatus, CampaignOption } from '@/lib/types'
import Link from 'next/link'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function formatDate(dateStr: string): string {
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
  version: string
  price: string
  benefit: string
  label: string
}

const emptyOption: OptionForm = { version: '', price: '', benefit: '', label: '' }

export default function CampaignsPage() {
  const { campaigns, addCampaign, updateCampaign, deleteCampaign, getOrdersByCampaign } = useOrders()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  
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

  // Auto-scraper function
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
        
        // Extract og:title
        const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)
        if (titleMatch) {
          setName(titleMatch[1])
        }
        
        // Extract og:image
        const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
        if (imageMatch) {
          setImageUrl(imageMatch[1])
        }

        // Auto-detect store from URL
        if (scraperUrl.includes('aladin')) {
          setStore('Aladin')
        } else if (scraperUrl.includes('ktown4u')) {
          setStore('Ktown4U')
        } else if (scraperUrl.includes('weverse')) {
          setStore('Weverse Shop')
        }

        if (!titleMatch && !imageMatch) {
          setScraperError('Không tìm thấy thông tin. Vui lòng nhập thủ công.')
        }
      } else {
        setScraperError('Không thể tải trang web')
      }
    } catch (error) {
      setScraperError('Lỗi khi quét dữ liệu. Vui lòng thử lại.')
    } finally {
      setIsScraperLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const openModal = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign)
      setName(campaign.name)
      setStore(campaign.store)
      setImageUrl(campaign.imageUrl)
      setStatus(campaign.status)
      setCloseDate(campaign.closeDate)
      setDescription(campaign.description || '')
      setOptions(campaign.options.map(o => ({
        version: o.version,
        price: o.price.toString(),
        benefit: o.benefit || '',
        label: o.label || ''
      })))
    } else {
      setEditingCampaign(null)
      setName('')
      setStore('')
      setImageUrl('https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop')
      setStatus('DRAFT')
      setCloseDate('')
      setDescription('')
      setOptions([{ ...emptyOption }])
      setScraperUrl('')
      setScraperError('')
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCampaign(null)
  }

  const addOption = () => {
    setOptions([...options, { ...emptyOption }])
  }

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, field: keyof OptionForm, value: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const campaignOptions: CampaignOption[] = options
      .filter(o => o.version && o.price)
      .map((o, idx) => ({
        id: editingCampaign?.options[idx]?.id || `opt-${Date.now()}-${idx}`,
        version: o.version,
        price: parseInt(o.price) || 0,
        benefit: o.benefit || undefined,
        label: o.label || undefined
      }))

    if (editingCampaign) {
      updateCampaign(editingCampaign.id, {
        name,
        store,
        imageUrl,
        status,
        closeDate,
        description: description || undefined,
        options: campaignOptions
      })
    } else {
      addCampaign({
        name,
        store,
        imageUrl,
        status,
        closeDate,
        description: description || undefined,
        options: campaignOptions
      })
    }
    
    closeModal()
  }

  const handleDelete = (campaign: Campaign) => {
    const orderCount = getOrdersByCampaign(campaign.id).length
    if (orderCount > 0) {
      alert(`Không thể xóa chiến dịch này vì có ${orderCount} đơn hàng liên quan.`)
      return
    }
    if (confirm(`Bạn có chắc muốn xóa chiến dịch "${campaign.name}"?`)) {
      deleteCampaign(campaign.id)
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý chiến dịch</h1>
          <p className="text-muted-foreground">Tạo và quản lý các chiến dịch Group Order</p>
        </div>
        <Button onClick={() => openModal()} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Tạo chiến dịch
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm chiến dịch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên chiến dịch</TableHead>
                  <TableHead>Cửa hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đóng</TableHead>
                  <TableHead>Số đơn</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => {
                    const orderCount = getOrdersByCampaign(campaign.id).length
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.options.length} phiên bản
                          </div>
                        </TableCell>
                        <TableCell>{campaign.store}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(campaign.status)} border`}>
                            {campaignStatusLabels[campaign.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(campaign.closeDate)}</TableCell>
                        <TableCell>{orderCount}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {campaign.status !== 'DRAFT' && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/campaign/${campaign.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Xem
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => openModal(campaign)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(campaign)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy chiến dịch nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Chỉnh sửa chiến dịch' : 'Tạo chiến dịch mới'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auto-scraper Section */}
            {!editingCampaign && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <Label className="font-medium text-primary">Tự động điền từ URL</Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={scraperUrl}
                    onChange={(e) => setScraperUrl(e.target.value)}
                    placeholder="Dán link Aladin, Ktown4U, Weverse..."
                    className="rounded-xl flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={handleAutoFill}
                    disabled={isScraperLoading}
                    className="rounded-xl"
                  >
                    {isScraperLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang quét...
                      </>
                    ) : (
                      'Quét dữ liệu'
                    )}
                  </Button>
                </div>
                {scraperError && (
                  <p className="text-sm text-destructive">{scraperError}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Tên chiến dịch *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="BTS - Album mới"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store">Cửa hàng *</Label>
                <Select value={store} onValueChange={setStore} required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Chọn cửa hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái *</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as CampaignStatus)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Nháp</SelectItem>
                    <SelectItem value="OPEN">Đang mở</SelectItem>
                    <SelectItem value="CLOSING_SOON">Sắp đóng</SelectItem>
                    <SelectItem value="CLOSED">Đã đóng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeDate">Ngày đóng *</Label>
                <Input
                  id="closeDate"
                  type="date"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL hình ảnh</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về chiến dịch..."
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Phiên bản / Option *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption} className="rounded-lg">
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              </div>
              
              {options.map((option, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-muted/50 rounded-xl">
                  <Input
                    placeholder="Tên phiên bản"
                    value={option.version}
                    onChange={(e) => updateOption(index, 'version', e.target.value)}
                    className="col-span-4 rounded-lg"
                  />
                  <Input
                    type="number"
                    placeholder="Giá (VND)"
                    value={option.price}
                    onChange={(e) => updateOption(index, 'price', e.target.value)}
                    className="col-span-3 rounded-lg"
                  />
                  <Input
                    placeholder="Benefit"
                    value={option.benefit}
                    onChange={(e) => updateOption(index, 'benefit', e.target.value)}
                    className="col-span-2 rounded-lg"
                  />
                  <Input
                    placeholder="Label"
                    value={option.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                    className="col-span-2 rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={options.length === 1}
                    className="col-span-1"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} className="rounded-xl">
                Hủy
              </Button>
              <Button type="submit" className="rounded-xl">
                {editingCampaign ? 'Cập nhật' : 'Tạo chiến dịch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

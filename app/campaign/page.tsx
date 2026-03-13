'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Link2, Plus, Trash2, Globe } from 'lucide-react'
import { supabase } from '@/lib/supabase' // Đảm bảo đường dẫn này đúng

export default function CreateCampaignPage() {
  const [loading, setLoading] = useState(false)
  const [scraping, setScraping] = useState(false)
  
  // State cho Form
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [store, setStore] = useState('')
  const [options, setOptions] = useState([{ version: '', price: 0, benefit: '' }])

  // --- PHƯƠNG ÁN 1: QUÉT DỮ LIỆU TỰ ĐỘNG ---
  const handleScrape = async () => {
    if (!url) return alert('Vui lòng dán link sản phẩm!')
    setScraping(true)
    try {
      // Sử dụng proxy để lách CORS
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      const parser = new DOMParser()
      const doc = parser.parseFromString(data.contents, 'text/html')

      // Lấy Title & Image từ thẻ Meta OG (Chuẩn chung của Aladin/Ktown4u)
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
      
      if (ogTitle) setTitle(ogTitle)
      if (ogImage) setImageUrl(ogImage)
      
      // Tự nhận diện Store
      if (url.includes('aladin.co.kr')) setStore('Aladin')
      else if (url.includes('ktown4u')) setStore('Ktown4u')
      else if (url.includes('weverse')) setStore('Weverse')

      alert('Đã lấy dữ liệu thành công! Hãy kiểm tra và điền giá tiền.')
    } catch (error) {
      console.error(error)
      alert('Lỗi khi quét dữ liệu. Bạn vui lòng dùng Phương án 2 (Điền thủ công).')
    } finally {
      setScraping(false)
    }
  }

  // --- PHƯƠNG ÁN 2: QUẢN LÝ OPTIONS (THỦ CÔNG) ---
  const addOption = () => setOptions([...options, { version: '', price: 0, benefit: '' }])
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index))

  const handleSubmit = async () => {
    setLoading(true)
    // Logic lưu vào Supabase (Bảng campaigns và campaign_options)
    // ... (Tự động lưu dựa trên state title, imageUrl, store, options)
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-[#F7F7FB]">
      <h1 className="text-2xl font-bold text-[#8B7CFF]">Đăng Sản Phẩm Mới</h1>

      {/* BOX 1: PHƯƠNG ÁN 1 - AUTO SCRAPE */}
      <Card className="border-2 border-dashed border-[#8B7CFF]/30 bg-white">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-gray-500">
            <Link2 className="h-4 w-4" /> Phương án 1: Tự động điền từ link
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input 
            placeholder="Dán link Aladin, Ktown4u..." 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={handleScrape} disabled={scraping} className="bg-[#8B7CFF] hover:bg-[#7A6BEB]">
            {scraping ? <Loader2 className="animate-spin h-4 w-4" /> : "Quét dữ liệu"}
          </Button>
        </CardContent>
      </Card>

      {/* BOX 2: PHƯƠNG ÁN 2 - THÔNG TIN CHI TIẾT (FORM THỦ CÔNG) */}
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-lg">Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên sản phẩm *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: BLACKPINK 3rd Mini Album" />
            </div>
            <div className="space-y-2">
              <Label>Nguồn hàng (Store) *</Label>
              <Input value={store} onChange={(e) => setStore(e.target.value)} placeholder="Aladin, Weverse..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Link ảnh bìa *</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            {imageUrl && <img src={imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md mt-2 border" />}
          </div>

          <hr className="my-6" />
          
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Các phiên bản & Giá (VND)</Label>
            <Button variant="outline" size="sm" onClick={addOption} className="text-[#8B7CFF] border-[#8B7CFF]">
              <Plus className="h-4 w-4 mr-1" /> Thêm phiên bản
            </Button>
          </div>

          {options.map((opt, index) => (
            <div key={index} className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl relative">
              <div className="col-span-2">
                <Label className="text-xs">Tên bản (Version)</Label>
                <Input placeholder="VD: Ver A" value={opt.version} onChange={(e) => {
                  const newOpts = [...options]; newOpts[index].version = e.target.value; setOptions(newOpts);
                }} />
              </div>
              <div>
                <Label className="text-xs">Giá tiền (VNĐ)</Label>
                <Input type="number" placeholder="500000" value={opt.price} onChange={(e) => {
                  const newOpts = [...options]; newOpts[index].price = Number(e.target.value); setOptions(newOpts);
                }} />
              </div>
              <div className="flex items-end">
                <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-[#8B7CFF] h-12 text-lg">
            {loading ? "Đang lưu..." : "Lưu & Đăng lên Web"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

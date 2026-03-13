// 1. Thêm State để lưu danh sách bank
const [banks, setBanks] = useState<any[]>([])
const [selectedBankId, setSelectedBankId] = useState('')

// 2. useEffect lấy danh sách bank
useEffect(() => {
  const getBanks = async () => {
    const { data } = await supabase.from('bank_accounts').select('*').eq('is_active', true)
    if (data) setBanks(data)
  }
  getBanks()
}, [])

// 3. Trong phần hiển thị (sau form thông tin khách)
<div className="space-y-3">
  <Label className="font-bold">Chọn ngân hàng thanh toán *</Label>
  <div className="grid grid-cols-2 gap-3">
    {banks.map(bank => (
      <div 
        key={bank.id}
        onClick={() => setSelectedBankId(bank.id)}
        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
          selectedBankId === bank.id ? 'border-[#8B7CFF] bg-[#F7F6FF]' : 'border-gray-100 bg-white'
        }`}
      >
        <p className="font-bold text-center text-sm">{bank.bank_name}</p>
      </div>
    ))}
  </div>
</div>

// 4. Khi router.push sang trang Success, Ninh nhớ truyền thêm ID của Bank đã chọn
router.push(`/order/success?code=${orderCode}&total=${totalAmount}&name=${formData.name}&bankId=${selectedBankId}`)

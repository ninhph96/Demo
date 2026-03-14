const handleOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Điền đủ thông tin để nhận hàng nhé!");
      return;
    }

    setLoading(true)
    try {
      const orderCode = `ORD${Math.floor(1000 + Math.random() * 9000)}`
      
      // 1. Lưu vào bảng orders (Khớp tên cột theo ảnh bạn gửi)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          social_id: formData.social, // Đã đổi thành social_id theo CSDL
          total_amount: finalAmount,
          order_code: orderCode,
          status: 'SUBMITTED',
          payment_type: payFull ? 'FULL' : 'DEPOSIT',
          payment_status: 'UNPAID' // Trạng thái mặc định theo ảnh của bạn
        }])
        .select().single()

      if (orderError) throw orderError

      // 2. Lưu vào bảng order_items (Khớp theo ảnh 2 của bạn)
      const orderItems = selectedItems.map(item => ({
        order_id: order.id,
        option_id: item.id,
        quantity: 1,
        status: 'SUBMITTED' // Cột status trong bảng order_items
      }))
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      // 3. Chuyển sang trang thành công
      router.push(`/order/success?code=${orderCode}&total=${finalAmount}&name=${encodeURIComponent(formData.name)}`)
    } catch (error: any) {
      alert("Lỗi hệ thống: " + error.message)
    } finally {
      setLoading(false)
    }
  }

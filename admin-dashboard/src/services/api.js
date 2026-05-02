import { supabase } from '../lib/supabase'

export const productsService = {
  async getAll(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false })
      .range(from, to)
    if (error) throw error
    return data
  },

  async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productData, is_active: true }])
      .select()
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  async toggleActive(id, isActive) {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async uploadImage(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: productImageData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    return productImageData.publicUrl
  },

  async getCount() {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  }
}

export const categoriesService = {
  async getAll(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: false })
      .range(from, to)
    if (error) throw error
    return data
  },

  async create(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...categoryData, is_active: true }])
      .select()
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  async toggleActive(id, isActive) {
    const { data, error } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async uploadImage(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: categoryImageData } = supabase.storage
      .from('categories')
      .getPublicUrl(filePath)

    return categoryImageData.publicUrl
  },

  async getCount() {
    const { count, error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  }
}

export const ordersService = {
  async getAll(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles(name),
        order_items(
          quantity,
          products(name)
        )
      `)
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) throw error
    return data
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async getCount() {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  },

  async getTotalRevenue() {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
    if (error) throw error
    return data.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  }
}

export const usersService = {
  async getAll(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .range(from, to)
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  async getCount() {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  }
}

export const adsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('ads')
      .select(`
        *,
        products(id, name, price, image_url)
      `)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async create(adData) {
    const { data, error } = await supabase
      .from('ads')
      .insert([{ ...adData, is_active: adData.is_active ?? true }])
      .select()
    if (error) throw error
    return data[0]
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  async toggleActive(id, isActive) {
    const { data, error } = await supabase
      .from('ads')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async uploadImage(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('ads-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage
      .from('ads-images')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl
  }
}

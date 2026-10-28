// src/types.ts
export type User = {
  name: string
  email: string
  password?: string
}

export type Product = {
  id: number
  title: string
  author: string
  price: number
  oldPrice?: number
  category: string
  rating: number
  cover: string
  text: string
  tag?: string
}
export interface OrderItem {
  id: number
  title: string
  price: number
  quantity: number
  cover: string
}

export interface Order {
  id: string
  createdAt: string
  name: string
  phone: string
  email?: string
  address: string
  payment: "cod" | "bank"
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
}
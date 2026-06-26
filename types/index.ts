// Base Types

export interface User {
  id: string
  email: string
  name: string
  role: 'buyer' | 'seller' | 'both' | 'admin'
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// Add more shared types across the application below

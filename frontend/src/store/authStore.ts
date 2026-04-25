import { create } from 'zustand'

interface AuthState {
  token: string | null
  userId: number | null
  phone: string | null
  email: string | null
  nickname: string | null
  avatar: string | null
  setAuth: (data: { token: string; userId: number; phone?: string; email?: string; nickname?: string; avatar?: string }) => void
  logout: () => void
}

function hydrate(): Pick<AuthState, 'token' | 'userId' | 'phone' | 'email' | 'nickname' | 'avatar'> {
  if (typeof window === 'undefined') {
    return { token: null, userId: null, phone: null, email: null, nickname: null, avatar: null }
  }
  return {
    token: localStorage.getItem('token'),
    userId: Number(localStorage.getItem('userId')) || null,
    phone: localStorage.getItem('phone'),
    email: localStorage.getItem('email'),
    nickname: localStorage.getItem('nickname'),
    avatar: localStorage.getItem('avatar'),
  }
}

const initial = hydrate()

export const useAuthStore = create<AuthState>((set) => ({
  ...initial,
  setAuth: (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', String(data.userId))
    if (data.phone != null) localStorage.setItem('phone', data.phone)
    if (data.email != null) localStorage.setItem('email', data.email)
    if (data.nickname != null) localStorage.setItem('nickname', data.nickname)
    if (data.avatar != null) localStorage.setItem('avatar', data.avatar)
    set(data)
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('phone')
    localStorage.removeItem('email')
    localStorage.removeItem('nickname')
    localStorage.removeItem('avatar')
    set({ token: null, userId: null, phone: null, email: null, nickname: null, avatar: null })
  },
}))

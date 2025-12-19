import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem('vb_user')
    if (raw) setUser(JSON.parse(raw))
  }, [])

  const getUsers = () => JSON.parse(localStorage.getItem('vb_users') || '[]')

  const saveUsers = (list) => localStorage.setItem('vb_users', JSON.stringify(list))

  const login = (payload) => {
    // payload: { phone, password }
    if (!payload || !payload.phone) return { ok: false }
    const users = getUsers()
    const match = users.find(u => u.phone === payload.phone && (!payload.password || u.password === payload.password))
    if (!match) return { ok: false, message: 'Account topilmadi yoki parol noto\'g\'ri' }
    const userInfo = { id: match.id, name: match.name, email: match.email || '', phone: match.phone, address: match.address || '' }
    setUser(userInfo)
    localStorage.setItem('vb_user', JSON.stringify(userInfo))
    return { ok: true, user: userInfo }
  }

  const register = (payload, password) => {
    // payload: { name, email, phone, address }
    const users = getUsers()
    const exists = users.find(u => u.phone === payload.phone)
    if (exists) return { ok: false, message: 'Bu telefon raqami bilan akkount mavjud' }
    const id = Date.now()
    const newUser = { id, ...payload, password: password || '' }
    users.push(newUser)
    saveUsers(users)
    const userInfo = { id: newUser.id, name: newUser.name, email: newUser.email || '', phone: newUser.phone, address: newUser.address || '' }
    setUser(userInfo)
    localStorage.setItem('vb_user', JSON.stringify(userInfo))
    return { ok: true, user: userInfo }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vb_user')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('vb_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

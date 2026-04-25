import { useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { login, register, sendSmsCode, sendEmailCode } from '../../api'
import './AuthModal.css'

export function AuthModal() {
  const showLoginModal = useUIStore((s) => s.showLoginModal)
  const setShowLoginModal = useUIStore((s) => s.setShowLoginModal)
  const setAuth = useAuthStore((s) => s.setAuth)

  const [isLogin, setIsLogin] = useState(true)
  const [method, setMethod] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isLogin) {
        const resp = await login(method === 'phone' ? phone : undefined, method === 'email' ? email : undefined, password)
        setAuth(resp)
      } else {
        const resp = await register(method === 'phone' ? phone : undefined, method === 'email' ? email : undefined, password, code)
        setAuth(resp)
      }
      setShowLoginModal(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败')
    }
  }

  const handleSendCode = async () => {
    setError('')
    try {
      if (method === 'phone' && phone) {
        await sendSmsCode(phone)
      } else if (method === 'email' && email) {
        await sendEmailCode(email)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发送验证码失败')
    }
  }

  if (!showLoginModal) return null

  return (
    <div className="auth-modal-overlay" onClick={() => setShowLoginModal(false)}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={() => setShowLoginModal(false)}>&times;</button>
        <h2>{isLogin ? '登录' : '注册'}</h2>

        <div className="auth-tabs">
          <button className={method === 'phone' ? 'active' : ''} onClick={() => setMethod('phone')}>手机号</button>
          <button className={method === 'email' ? 'active' : ''} onClick={() => setMethod('email')}>邮箱</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>{method === 'phone' ? '手机号' : '邮箱'}</label>
            <div className="auth-input-row">
              {method === 'phone' ? (
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" required />
              ) : (
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="请输入邮箱" type="email" required />
              )}
              {!isLogin && (
                <button type="button" className="auth-code-btn" onClick={handleSendCode}>
                  发送验证码
                </button>
              )}
            </div>
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label>验证码</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入验证码" />
            </div>
          )}

          <div className="auth-field">
            <label>密码</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" type="password" required />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit">
            {isLogin ? '登录' : '注册'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '去注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  )
}

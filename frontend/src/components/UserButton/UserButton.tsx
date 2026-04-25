import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import './UserButton.css'

export function UserButton() {
  const nickname = useAuthStore((s) => s.nickname)
  const email = useAuthStore((s) => s.email)
  const phone = useAuthStore((s) => s.phone)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="user-button">
      <div className="user-avatar">
        {(nickname || email || phone || '?')[0].toUpperCase()}
      </div>
      <span className="user-name">{nickname || email || phone}</span>
      <button className="logout-btn" onClick={logout}>
        退出
      </button>
    </div>
  )
}

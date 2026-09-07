import { useState, useEffect } from 'react'
import { onAuthChange, logout, getUserData, createChat, listenToUserChats } from './firebase'
import AuthModal from './components/AuthModal'
import Pricing from './components/Pricing'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import { Menu } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Auth listener
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u)
      if (u) {
        const data = await getUserData(u.uid)
        setUserData(data)
      } else {
        setUserData(null)
        setChats([])
        setCurrentChatId(null)
      }
      setLoadingAuth(false)
    })
    return unsub
  }, [])

  // Chats listener
  useEffect(() => {
    if (!user) return
    const unsub = listenToUserChats(user.uid, (list) => {
      setChats(list)
      if (!currentChatId && list.length > 0) {
        setCurrentChatId(list[0].id)
      }
    })
    return unsub
  }, [user])

  async function handleNewChat() {
    if (!user) {
      setShowAuth(true)
      return
    }
    const id = await createChat(user.uid)
    setCurrentChatId(id)
  }

  async function handleLogout() {
    await logout()
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-slate-950 text-white overflow-hidden">
      {user && (
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={setCurrentChatId}
          onNewChat={handleNewChat}
          onOpenPricing={() => setShowPricing(true)}
          onLogout={handleLogout}
          user={user}
          userData={userData}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-slate-800 rounded-lg lg:hidden"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="font-semibold text-lg tracking-tight">Unrestricted AI</h1>
            <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
              No limits
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg"
              >
                Sign in
              </button>
            ) : (
              <button
                onClick={() => setShowPricing(true)}
                className="text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg"
              >
                {userData?.plan === 'pro' || userData?.plan === 'unlimited' ? 'Manage plan' : 'Upgrade'}
              </button>
            )}
          </div>
        </header>

        {/* Main content */}
        {user ? (
          <Chat chatId={currentChatId} user={user} userData={userData} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-4xl font-bold mb-4">Deep Reasoning.<br />Zero Restrictions.</h2>
            <p className="text-slate-400 max-w-md mb-8">
              An AI that answers any question, solves hard problems, analyzes images,
              and keeps your full conversation history. Sign up to begin.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-8 py-3 rounded-xl text-lg"
            >
              Get started — free
            </button>
          </div>
        )}
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {}}
        />
      )}

      {showPricing && user && (
        <Pricing
          user={user}
          userData={userData}
          onClose={() => setShowPricing(false)}
        />
      )}
    </div>
  )
}

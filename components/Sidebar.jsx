import { Plus, MessageSquare, LogOut, CreditCard, User } from 'lucide-react'

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onOpenPricing,
  onLogout,
  user,
  userData,
  collapsed,
  onToggle
}) {
  return (
    <aside className={`bg-slate-950 border-r border-slate-800 flex flex-col transition-all ${collapsed ? 'w-16' : 'w-72'}`}>
      <div className="p-3 border-b border-slate-800">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg px-3 py-2.5 text-sm font-medium transition"
        >
          <Plus size={18} />
          {!collapsed && <span>New chat</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm truncate transition ${
              currentChatId === chat.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">{chat.title || 'New chat'}</span>}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-slate-800 space-y-1">
        {user && (
          <>
            <div className={`flex items-center gap-2 px-2 py-1.5 text-sm text-slate-300 ${collapsed ? 'justify-center' : ''}`}>
              <User size={16} />
              {!collapsed && (
                <div className="truncate">
                  <div className="font-medium truncate">{userData?.displayName || user.email}</div>
                  <div className="text-xs text-slate-500 capitalize">{userData?.plan || 'free'} plan</div>
                </div>
              )}
            </div>
            <button
              onClick={onOpenPricing}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg"
            >
              <CreditCard size={16} />
              {!collapsed && <span>Billing & Plans</span>}
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg"
            >
              <LogOut size={16} />
              {!collapsed && <span>Sign out</span>}
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

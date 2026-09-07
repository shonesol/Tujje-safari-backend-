import { useState, useEffect, useRef } from 'react'
import Message from './Message'
import { addMessage, listenToMessages } from '../firebase'
import { askAI } from '../ai'
import { Send, ImagePlus, Loader2 } from 'lucide-react'

export default function Chat({ chatId, user, userData }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!chatId) return
    const unsub = listenToMessages(chatId, setMessages)
    return unsub
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function uploadToCloudinary(file) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (!data.secure_url) throw new Error('Cloudinary upload failed')
    return data.secure_url
  }

  async function handleSend(e) {
    e?.preventDefault()
    if ((!input.trim() && !imageFile) || loading || !chatId) return

    // Simple free-tier limit check
    if (userData?.plan === 'free' && (userData?.messageCount || 0) >= 20) {
      alert('Free plan limit reached (20 messages/day). Upgrade to continue.')
      return
    }

    setLoading(true)
    let imageUrl = null

    try {
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile)
      }

      const userContent = input.trim() || (imageUrl ? '[Image uploaded]' : '')
      await addMessage(chatId, 'user', userContent, imageUrl)

      // Prepare history for the model (last ~20 messages)
      const history = [...messages, { role: 'user', content: userContent, imageUrl }]
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content, imageUrl: m.imageUrl }))

      const reply = await askAI(history, imageUrl)
      await addMessage(chatId, 'assistant', reply)

      setInput('')
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error(err)
      await addMessage(chatId, 'assistant', `Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Select a chat or create a new one
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold text-slate-300 mb-2">Unrestricted AI</h2>
            <p className="text-sm">
              Ask anything. No content filters. Deep reasoning for hard problems.
              Upload images for analysis. Your full history is saved.
            </p>
          </div>
        )}
        {messages.map(m => (
          <Message key={m.id} message={m} />
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Thinking deeply...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-4">
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img src={imagePreview} alt="preview" className="h-20 rounded-lg" />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null) }}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Upload image"
          >
            <ImagePlus size={20} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask any question or describe a hard problem..."
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none max-h-40"
          />
          <button
            type="submit"
            disabled={loading || (!input.trim() && !imageFile)}
            className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl transition"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-center text-[11px] text-slate-600 mt-2">
          Unrestricted mode • History saved • {userData?.plan || 'free'} plan
        </p>
      </div>
    </div>
  )
}

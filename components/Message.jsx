import { formatDate } from '../lib/utils'

export default function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-sky-600 text-white rounded-br-md'
            : 'bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700'
        }`}
      >
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Uploaded"
            className="max-w-full rounded-lg mb-2 max-h-64 object-contain"
          />
        )}
        <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
          {message.content}
        </div>
        {message.createdAt && (
          <div className={`text-[11px] mt-1.5 ${isUser ? 'text-sky-200' : 'text-slate-500'}`}>
            {formatDate(message.createdAt.toDate ? message.createdAt.toDate() : new Date(message.createdAt))}
          </div>
        )}
      </div>
    </div>
  )
}

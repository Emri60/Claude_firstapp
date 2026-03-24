import { useState, useRef, useEffect } from 'react'
import api from '../../api'

export default function AssistantIA() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const newMsg = { role: 'user', content: text }
    const updated = [...messages, newMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    try {
      const { data } = await api.post('/ai/chat', { messages: updated })
      setMessages(m => [...m, { role: 'assistant', content: data.content }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Erreur de connexion. Vérifiez la clé API Anthropic.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">Contexte : base d'objets injectée automatiquement</span>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="text-xs text-gray-400 underline">
            Effacer
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8 text-sm">
            <p className="text-2xl mb-2">🤖</p>
            <p>Posez vos questions sur les prix, l'authenticité, les négociations…</p>
            <p className="mt-3 text-xs italic">"Est-ce que 35€ pour un Grzybek rose c'est raisonnable ?"</p>
            <p className="text-xs italic">"Comment distinguer un 366 original d'une réédition ?"</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-card text-ink rounded-bl-sm border border-gray-200'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card rounded-2xl px-4 py-3 rounded-bl-sm border border-gray-200">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Votre question…"
          rows={2}
          className="flex-1 rounded-xl border-gray-200 text-sm py-3 px-4 resize-none focus:ring-primary focus:border-primary"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-primary text-white rounded-xl px-4 font-semibold text-sm disabled:opacity-40 transition-opacity"
        >
          Envoyer
        </button>
      </div>
    </div>
  )
}

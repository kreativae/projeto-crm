import { useState } from 'react';
import { motion } from 'framer-motion';
import { conversations as initialConversations, type Conversation } from '@/data/mockData';
import { Search, Send, Paperclip, Smile, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

const channelConfig: Record<string, { color: string; label: string }> = {
  whatsapp: { color: 'bg-emerald-500', label: 'WhatsApp' },
  email: { color: 'bg-blue-500', label: 'E-mail' },
  instagram: { color: 'bg-pink-500', label: 'Instagram' },
  telegram: { color: 'bg-sky-500', label: 'Telegram' },
  facebook: { color: 'bg-indigo-500', label: 'Facebook' },
};

export function ConversationsPage() {
  const [conversations] = useState(initialConversations);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');

  const filtered = conversations.filter(c => {
    const matchSearch = c.leadName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchChannel = channelFilter === 'all' || c.channel === channelFilter;
    return matchSearch && matchChannel;
  });

  const handleSend = () => { if (!newMessage.trim()) return; setNewMessage(''); };

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* List */}
      <div className={cn('w-full md:w-80 lg:w-96 border-r border-slate-200/60 bg-white/70 backdrop-blur-sm flex flex-col flex-shrink-0',
        selectedConvo ? 'hidden md:flex' : 'flex')}>
        <div className="p-4 border-b border-slate-200/60">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Conversas</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar conversa..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[{ key: 'all', label: 'Todos' }, ...Object.entries(channelConfig).map(([k, v]) => ({ key: k, label: v.label }))].map(item => (
              <motion.button key={item.key} whileTap={{ scale: 0.95 }} onClick={() => setChannelFilter(item.key)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                  channelFilter === item.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((convo) => {
            const ch = channelConfig[convo.channel];
            const isSelected = selectedConvo?.id === convo.id;
            return (
              <motion.button key={convo.id} whileHover={{ x: 2 }} onClick={() => setSelectedConvo(convo)}
                className={cn('w-full flex items-center gap-3 p-4 border-b border-slate-100/60 hover:bg-slate-50/60 transition-all text-left',
                  isSelected && 'bg-indigo-50/60 border-l-2 border-l-indigo-600')}>
                <div className="relative flex-shrink-0">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                    {convo.leadName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className={cn('absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white', ch.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{convo.leadName}</h4>
                    <span className="text-[10px] text-slate-400 ml-2">{convo.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{convo.lastMessage}</p>
                </div>
                {convo.unread > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5 shadow-lg shadow-indigo-600/30">
                    {convo.unread}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Chat */}
      {selectedConvo ? (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-50 to-slate-100/50">
          <div className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedConvo(null)} className="md:hidden p-1.5 hover:bg-slate-100 rounded-xl"><ArrowLeft className="h-5 w-5 text-slate-600" /></button>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                {selectedConvo.leadName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedConvo.leadName}</h3>
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', channelConfig[selectedConvo.channel].color)} />
                  <span className="text-xs text-slate-500">{channelConfig[selectedConvo.channel].label}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[Phone, Video, MoreVertical].map((Icon, i) => (
                <motion.button key={i} whileTap={{ scale: 0.9 }} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"><Icon className="h-4 w-4" /></motion.button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center"><span className="text-xs text-slate-400 bg-white/80 px-4 py-1.5 rounded-full border border-slate-200/60 shadow-sm">Hoje</span></div>
            {selectedConvo.messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={cn('flex', msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[75%] rounded-2xl px-4 py-3',
                  msg.direction === 'outbound'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md shadow-lg shadow-indigo-600/15'
                    : 'bg-white text-slate-900 border border-slate-200/60 rounded-bl-md shadow-sm')}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={cn('flex items-center justify-end gap-1 mt-1.5', msg.direction === 'outbound' ? 'text-indigo-200' : 'text-slate-400')}>
                    <span className="text-[10px]">{new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200/60 p-4">
            <div className="flex items-center gap-3">
              <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><Paperclip className="h-5 w-5" /></button>
              <div className="flex-1 relative">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite uma mensagem..."
                  className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-12 transition-all" />
                <button className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><Smile className="h-5 w-5" /></button>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={handleSend}
                className="h-11 w-11 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/25">
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/50">
          <div className="text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><Send className="h-8 w-8 text-slate-300" /></div>
            <h3 className="text-lg font-bold text-slate-600">Selecione uma conversa</h3>
            <p className="text-sm text-slate-400 mt-1">Escolha uma conversa para começar</p>
          </div>
        </div>
      )}
    </div>
  );
}

import { AppTemplate } from './AppTemplate';
import { MessageSquare, Users, Archive, Star, Send } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '../AppContext';
import { useAppStorage } from '../../hooks/useAppStorage';

const messagesSidebar = {
  sections: [
    {
      title: 'Conversations',
      items: [
        { id: 'all', label: 'All Messages', icon: MessageSquare, badge: '12' },
        { id: 'groups', label: 'Groups', icon: Users, badge: '3' },
        { id: 'starred', label: 'Starred', icon: Star },
        { id: 'archived', label: 'Archived', icon: Archive },
      ],
    },
  ],
};

const mockConversations = [
  { id: 1, name: 'Sarah Johnson', lastMessage: 'See you tomorrow!', time: '10:30 AM', unread: 2, avatar: 'bg-pink-500' },
  { id: 2, name: 'Team Design', lastMessage: 'New mockups are ready', time: '9:15 AM', unread: 5, avatar: 'bg-purple-500' },
  { id: 3, name: 'Mike Chen', lastMessage: 'Thanks for the help!', time: 'Yesterday', unread: 0, avatar: 'bg-blue-500' },
  { id: 4, name: 'Project Alpha', lastMessage: 'Meeting at 2pm', time: 'Yesterday', unread: 1, avatar: 'bg-green-500' },
  { id: 5, name: 'Emma Wilson', lastMessage: 'Got it, thanks!', time: 'Monday', unread: 0, avatar: 'bg-orange-500' },
];

const mockMessages = [
  { id: 1, text: 'Hey! How are you doing?', sender: 'other', time: '10:25 AM' },
  { id: 2, text: 'I\'m good, thanks! Working on the new project.', sender: 'me', time: '10:26 AM' },
  { id: 3, text: 'That sounds exciting! Want to grab coffee later?', sender: 'other', time: '10:28 AM' },
  { id: 4, text: 'Sure! How about 3pm?', sender: 'me', time: '10:29 AM' },
  { id: 5, text: 'See you tomorrow!', sender: 'other', time: '10:30 AM' },
];

export function Messages() {
  // Persisted state
  const [appState, setAppState] = useAppStorage('messages', {
    activeCategory: 'all',
  });

  const [selectedConversationId, setSelectedConversationId] = useState<string | number>(mockConversations[0].id);
  const [messageText, setMessageText] = useState('');
  const { accentColor } = useAppContext();

  const selectedConversation = mockConversations.find(c => c.id === selectedConversationId) || mockConversations[0];

  // Map sidebar items to include badge data if needed, or just use static definition
  // Since AppTemplate expects a static structure for sidebar sections, we can keep the static definition
  // or make it dynamic if we want to show unread counts in the sidebar itself (not implemented in mock yet for categories)

  const content = (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-[30%] min-w-[250px] max-w-xs border-r border-white/10 overflow-y-auto flex flex-col shrink-0">
        <div className="p-3">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
          />
        </div>
        <div className="space-y-1 px-2 flex-1">
          {mockConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversationId(conversation.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedConversationId === conversation.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
            >
              <div className={`w-12 h-12 rounded-full ${conversation.avatar} flex items-center justify-center text-white flex-shrink-0`}>
                {conversation.name[0]}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm truncate">{conversation.name}</span>
                  <span className="text-white/40 text-xs">{conversation.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs truncate">{conversation.lastMessage}</span>
                  {conversation.unread > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-xs text-white ml-2 flex-shrink-0"
                      style={{ backgroundColor: accentColor }}
                    >
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-14 border-b border-white/10 flex items-center px-4">
          <div className={`w-8 h-8 rounded-full ${selectedConversation.avatar} flex items-center justify-center text-white text-sm mr-3`}>
            {selectedConversation.name[0]}
          </div>
          <span className="text-white">{selectedConversation.name}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${message.sender === 'me'
                  ? 'text-white rounded-br-sm'
                  : 'bg-gray-700/50 text-white rounded-bl-sm'
                  }`}
                style={message.sender === 'me' ? { backgroundColor: accentColor } : {}}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block">{message.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="h-16 border-t border-white/10 flex items-center px-4 gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AppTemplate
      sidebar={messagesSidebar}
      content={content}
      hasSidebar={true}
      activeItem={appState.activeCategory}
      onItemClick={(id) => setAppState(s => ({ ...s, activeCategory: id }))}
    />
  );
}

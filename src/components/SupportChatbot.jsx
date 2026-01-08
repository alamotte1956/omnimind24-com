import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2, AlertCircle, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI support assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await base44.functions.invoke('supportChatbot', {
        message: input,
        conversation_history: messages
      });

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        needs_escalation: data.needs_escalation
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again or email support@omnimind24.com'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalate = async () => {
    try {
      const user = await base44.auth.me();
      const conversationLog = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      await base44.functions.invoke('sendResendEmail', {
        to: 'support@omnimind24.com',
        subject: `Support Escalation - ${user.email}`,
        body: `Support ticket escalation from chatbot:\n\nUser: ${user.full_name} (${user.email})\n\nConversation:\n${conversationLog}`,
        from_name: 'OmniMind24 Support Bot'
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'ve escalated your issue to our support team. They\'ll reach out to you shortly via email.'
      }]);
      
      toast.success('Support ticket created! Our team will contact you soon.');
    } catch (error) {
      toast.error('Failed to create support ticket. Please email support@omnimind24.com directly.');
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#1A1A1A] border-gray-800 shadow-2xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          Support Assistant
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#0D0D0D] text-gray-300 border border-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.needs_escalation && (
                <Button
                  onClick={handleEscalate}
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  <Mail className="w-3 h-3 mr-2" />
                  Create Support Ticket
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#0D0D0D] border border-gray-800 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="bg-[#0D0D0D] border-gray-700 text-white"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Powered by AI • Available 24/7
        </p>
      </div>
    </Card>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Salad, Brain, ThumbsUp, ThumbsDown, Send, Loader2 } from 'lucide-react';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
  category?: 'fitness' | 'nutrition' | 'mental';
  liked?: boolean;
}

const WellnessBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const detectCategory = (message: string): 'fitness' | 'nutrition' | 'mental' | undefined => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('exercise') || 
        lowerMessage.includes('gym') || lowerMessage.includes('training')) {
      return 'fitness';
    } else if (lowerMessage.includes('food') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || 
               lowerMessage.includes('eating') || lowerMessage.includes('meal')) {
      return 'nutrition';
    } else if (lowerMessage.includes('mental') || lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || 
               lowerMessage.includes('mind') || lowerMessage.includes('meditation')) {
      return 'mental';
    }
    return undefined;
  };

  const handleLike = (index: number, liked: boolean) => {
    setMessages(prev => 
      prev.map((msg, i) => 
        i === index ? { ...msg, liked } : msg
      )
    );
    toast({
      title: liked ? "Glad this was helpful! 💪" : "Thanks for the feedback! 🙏",
      duration: 2000,
    });
  };

  const addMessage = (content: string, isUser: boolean, category?: 'fitness' | 'nutrition' | 'mental') => {
    setMessages(prev => [...prev, { content, isUser, timestamp: new Date(), category }]);
  };

  const getAIResponse = async (userMessage: string, category?: 'fitness' | 'nutrition' | 'mental') => {
    if (!apiKey) {
      return "Please provide your Perplexity API key to get personalized responses.";
    }

    try {
      const prompt = category 
        ? `As a wellness assistant, provide a helpful tip about ${category} in response to: ${userMessage}` 
        : `As a wellness assistant, provide a helpful response to: ${userMessage}`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a wellness assistant focused on fitness, nutrition, and mental health. Keep responses concise and practical.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error('API Error:', error);
      return "I apologize, but I'm having trouble connecting to my knowledge base. Please try again in a moment.";
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = "Hey bro! 💪 I'm here to help you with fitness, nutrition, and mental wellness. What's on your mind? Please provide your Perplexity API key to get started!";
    setIsTyping(true);
    setTimeout(() => {
      addMessage(welcomeMessage, false);
      setIsTyping(false);
    }, 1000);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    const category = detectCategory(userMessage);
    
    setInputMessage('');
    addMessage(userMessage, true, category);
    setIsLoading(true);
    setIsTyping(true);

    const response = await getAIResponse(userMessage, category);
    addMessage(response, false, category);
    
    setIsLoading(false);
    setIsTyping(false);
  };

  const handleQuickSelect = async (category: 'fitness' | 'nutrition' | 'mental') => {
    if (isLoading) return;
    
    const userMessage = `Give me a ${category} tip`;
    addMessage(userMessage, true, category);
    setIsLoading(true);
    setIsTyping(true);

    const response = await getAIResponse(userMessage, category);
    addMessage(response, false, category);
    
    setIsLoading(false);
    setIsTyping(false);
  };

  const getCategoryColor = (category?: 'fitness' | 'nutrition' | 'mental') => {
    switch (category) {
      case 'fitness':
        return 'bg-blue-600';
      case 'nutrition':
        return 'bg-green-600';
      case 'mental':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 h-[80vh] flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">BroBot Wellness Assistant</h1>
        <p className="text-gray-600">Your personal guide to fitness, nutrition, and mental health</p>
      </div>

      <div className="mb-4">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Perplexity API key..."
          className="w-full"
        />
      </div>

      <div className="flex gap-2 mb-4 justify-center">
        <Button
          onClick={() => handleQuickSelect('fitness')}
          variant="outline"
          className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <Dumbbell className="w-4 h-4 text-blue-600" />
          Fitness
        </Button>
        <Button
          onClick={() => handleQuickSelect('nutrition')}
          variant="outline"
          className="flex items-center gap-2 hover:bg-green-50 transition-colors"
        >
          <Salad className="w-4 h-4 text-green-600" />
          Nutrition
        </Button>
        <Button
          onClick={() => handleQuickSelect('mental')}
          variant="outline"
          className="flex items-center gap-2 hover:bg-purple-50 transition-colors"
        >
          <Brain className="w-4 h-4 text-purple-600" />
          Mental Health
        </Button>
      </div>

      <ScrollArea className="flex-grow mb-4 border rounded-lg p-4 bg-white">
        <div ref={scrollAreaRef} className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col gap-2">
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : `${getCategoryColor(message.category)} text-white rounded-bl-none`
                  }`}
                >
                  {message.content}
                </div>
                {!message.isUser && (
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-green-100"
                      onClick={() => handleLike(index, true)}
                    >
                      <ThumbsUp className={`h-4 w-4 ${message.liked === true ? 'text-green-600' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-red-100"
                      onClick={() => handleLike(index, false)}
                    >
                      <ThumbsDown className={`h-4 w-4 ${message.liked === false ? 'text-red-600' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Typing...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          Send
        </Button>
      </form>
    </div>
  );
};

export default WellnessBot;

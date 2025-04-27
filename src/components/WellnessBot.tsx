
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const wellnessTips = {
    fitness: [
      "Try incorporating compound exercises like squats and deadlifts for maximum muscle gain.",
      "Aim for at least 150 minutes of moderate exercise per week.",
      "Don't forget to include rest days in your workout routine for proper recovery.",
    ],
    nutrition: [
      "Ensure you're getting enough protein - aim for 1.6-2.2g per kg of body weight.",
      "Stay hydrated! Drink at least 8 glasses of water daily.",
      "Include a variety of colorful vegetables in your meals for essential nutrients.",
    ],
    mental: [
      "Practice mindfulness meditation for 10 minutes daily to reduce stress.",
      "Don't hesitate to reach out to friends or professionals when you need support.",
      "Maintain a regular sleep schedule for better mental clarity.",
    ],
  };

  const addMessage = (content: string, isUser: boolean, category?: 'fitness' | 'nutrition' | 'mental') => {
    setMessages(prev => [...prev, { content, isUser, timestamp: new Date(), category }]);
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

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = "Hey bro! 💪 I'm here to help you with fitness, nutrition, and mental wellness. What's on your mind?";
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
    setInputMessage('');
    addMessage(userMessage, true);
    setIsLoading(true);
    setIsTyping(true);

    setTimeout(() => {
      let response;
      let category: 'fitness' | 'nutrition' | 'mental' | undefined;
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
        response = wellnessTips.fitness[Math.floor(Math.random() * wellnessTips.fitness.length)];
        category = 'fitness';
      } else if (lowerMessage.includes('food') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
        response = wellnessTips.nutrition[Math.floor(Math.random() * wellnessTips.nutrition.length)];
        category = 'nutrition';
      } else if (lowerMessage.includes('mental') || lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
        response = wellnessTips.mental[Math.floor(Math.random() * wellnessTips.mental.length)];
        category = 'mental';
      } else {
        response = "I can help you with fitness, nutrition, and mental wellness. Just let me know what you'd like to focus on!";
      }

      addMessage(response, false, category);
      setIsLoading(false);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickSelect = (category: 'fitness' | 'nutrition' | 'mental') => {
    if (isLoading) return;
    const tip = wellnessTips[category][Math.floor(Math.random() * wellnessTips[category].length)];
    addMessage(`Give me a ${category} tip`, true);
    setIsLoading(true);
    setIsTyping(true);
    
    setTimeout(() => {
      addMessage(tip, false, category);
      setIsLoading(false);
      setIsTyping(false);
    }, 1000);
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

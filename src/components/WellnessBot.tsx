import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Dumbbell, Salad, Brain } from 'lucide-react';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const WellnessBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const addMessage = (content: string, isUser: boolean) => {
    setMessages(prev => [...prev, { content, isUser, timestamp: new Date() }]);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    addMessage("Hey bro! 💪 I'm here to help you with fitness, nutrition, and mental wellness. What's on your mind?", false);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage(userMessage, true);
    setIsLoading(true);

    setTimeout(() => {
      let response;
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
        response = wellnessTips.fitness[Math.floor(Math.random() * wellnessTips.fitness.length)];
      } else if (lowerMessage.includes('food') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet')) {
        response = wellnessTips.nutrition[Math.floor(Math.random() * wellnessTips.nutrition.length)];
      } else if (lowerMessage.includes('mental') || lowerMessage.includes('stress') || lowerMessage.includes('anxiety')) {
        response = wellnessTips.mental[Math.floor(Math.random() * wellnessTips.mental.length)];
      } else {
        response = "I can help you with fitness, nutrition, and mental wellness. Just let me know what you'd like to focus on!";
      }

      addMessage(response, false);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickSelect = (category: 'fitness' | 'nutrition' | 'mental') => {
    const tip = wellnessTips[category][Math.floor(Math.random() * wellnessTips[category].length)];
    addMessage(`Give me a ${category} tip`, true);
    addMessage(tip, false);
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
          className="flex items-center gap-2"
        >
          <Dumbbell className="w-4 h-4" />
          Fitness
        </Button>
        <Button
          onClick={() => handleQuickSelect('nutrition')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Salad className="w-4 h-4" />
          Nutrition
        </Button>
        <Button
          onClick={() => handleQuickSelect('mental')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
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
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-bl-none">
                <span className="animate-pulse">Typing...</span>
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
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default WellnessBot;

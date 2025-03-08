
import React, { useRef, KeyboardEvent, ChangeEvent } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  isProcessing: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSend, 
  isProcessing,
  inputRef 
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Descrivi la tua transazione..."
        className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        disabled={isProcessing}
      />
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full"
        onClick={onSend}
        disabled={value.trim() === '' || isProcessing}
      >
        <SendHorizontal size={18} />
      </Button>
    </div>
  );
};

export default ChatInput;

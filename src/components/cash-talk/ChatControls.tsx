
import React from 'react';
import { X, HelpCircle, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ChatInput from './ChatInput';
import ReceiptImageButton from './ReceiptImageButton';

interface ChatControlsProps {
  expanded: boolean;
  onToggleExpanded: () => void;
  userInput: string;
  setUserInput: (value: string) => void;
  onSendMessage: () => void;
  isProcessing: boolean;
  onReceiptProcessed: (text: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const ChatControls: React.FC<ChatControlsProps> = ({
  expanded,
  onToggleExpanded,
  userInput,
  setUserInput,
  onSendMessage,
  isProcessing,
  onReceiptProcessed,
  inputRef
}) => {
  const { toast } = useToast();

  if (!expanded) {
    return (
      <Button
        variant="outline"
        onClick={onToggleExpanded}
        className="bg-white shadow-md rounded-full px-6 py-2 flex items-center gap-2"
      >
        <span>Cash Talk</span>
        <ChevronUp size={18} />
      </Button>
    );
  }

  const showHelpToast = () => {
    toast({
      title: "Suggerimenti",
      description: "Prova a scrivere: 'spesa 45 euro al supermercato', 'stipendio 1500 euro', 'investito 500 euro in ETF'",
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={onToggleExpanded}
      >
        <X size={18} />
      </Button>
      
      <ChatInput
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onSend={onSendMessage}
        isProcessing={isProcessing}
        inputRef={inputRef}
      />
      
      <ReceiptImageButton onProcessComplete={onReceiptProcessed} />
      
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={showHelpToast}
      >
        <HelpCircle size={18} />
      </Button>
    </div>
  );
};

export default ChatControls;

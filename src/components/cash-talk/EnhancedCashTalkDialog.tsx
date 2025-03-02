
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  MessageCircle, 
  PenLine, 
  AlertTriangle,
  Trash,
  Edit,
  ArrowRight,
  FileCheck,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  NlpAnalysisResult, 
  intent, 
  confidence, 
  Transaction 
} from '@/utils/transactionRouter';

import TransactionInterpretation from './TransactionInterpretation';

interface EnhancedCashTalkDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (data: Transaction) => void;
  analysis?: NlpAnalysisResult;
  initialMessage?: string;
}

const EnhancedCashTalkDialog: React.FC<EnhancedCashTalkDialogProps> = ({
  open,
  onClose,
  onConfirm,
  analysis,
  initialMessage = '',
}) => {
  const { toast } = useToast();
  const [message, setMessage] = useState(initialMessage);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setMessage(initialMessage);
      setShowConfirmation(false);
      setIsEditing(false);
    }
  }, [open, initialMessage]);
  
  // Create a simulated transaction from analysis
  const createTransactionFromAnalysis = (): Transaction => {
    if (!analysis) return {
      type: 'USCITA',
      amount: 0,
      date: new Date().toISOString(),
      description: 'Unknown transaction',
    };
    
    // Extract data from the analysis
    const intent = analysis.intent || 'expense';
    const amount = analysis.entities.find(e => e.type === 'amount')?.value || 0;
    const date = analysis.entities.find(e => e.type === 'date')?.value || new Date().toISOString();
    let description = analysis.entities.find(e => e.type === 'merchant')?.text || '';
    
    if (!description) {
      const category = analysis.entities.find(e => e.type === 'category')?.text;
      const item = analysis.entities.find(e => e.type === 'item')?.text;
      description = [category, item].filter(Boolean).join(' - ') || 'Unknown';
    }
    
    return {
      type: intent === 'income' ? 'ENTRATA' : 'USCITA',
      amount: typeof amount === 'number' ? amount : parseFloat(amount),
      date: typeof date === 'string' ? date : date.toISOString(),
      description,
      category: analysis.entities.find(e => e.type === 'category')?.text,
      metadata: {
        confidence: analysis.confidence || 'medium',
        originalText: analysis.text,
      }
    };
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (!analysis) return;
    
    const transaction = createTransactionFromAnalysis();
    
    // Call the onConfirm callback with the transaction data
    if (onConfirm) {
      onConfirm(transaction);
    }
    
    // Show confirmation toast
    toast({
      title: "Transaction saved",
      description: `${transaction.type === 'ENTRATA' ? 'Income' : 'Expense'} of €${transaction.amount} recorded.`,
    });
    
    // Close the dialog
    onClose();
  };
  
  // Handle message edit
  const handleEditMessage = () => {
    setIsEditing(true);
    setShowConfirmation(false);
  };
  
  // Format confidence level
  const getConfidenceDisplay = (confidenceLevel?: confidence) => {
    switch (confidenceLevel) {
      case 'high':
        return { label: 'High confidence', color: 'bg-green-100 text-green-800' };
      case 'medium':
        return { label: 'Medium confidence', color: 'bg-amber-100 text-amber-800' };
      case 'low':
        return { label: 'Low confidence', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown confidence', color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  // If not open, render nothing
  if (!open) return null;
  
  // Create a transaction from the analysis for the TransactionInterpretation component
  const transactionForInterpretation = analysis ? createTransactionFromAnalysis() : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-green-100">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </Avatar>
                <h2 className="text-lg font-medium">Cash Talk</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Dialog Content */}
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {isEditing ? (
                // Edit Message View
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Edit your message:</p>
                  <div className="border rounded-lg overflow-hidden">
                    <textarea
                      className="w-full p-3 text-gray-900 focus:outline-none"
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Describe your transaction..."
                    />
                    <div className="flex justify-end p-2 bg-gray-50">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          // Here would typically be code to reprocess the message
                          setIsEditing(false);
                          // Simulate analysis update
                          toast({
                            title: "Message updated",
                            description: "Your transaction has been reanalyzed.",
                          });
                        }}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              ) : showConfirmation ? (
                // Confirmation View
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <FileCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-900">Ready to save</h3>
                        <p className="text-sm text-green-700">This transaction will be added to your records.</p>
                      </div>
                    </div>
                  </div>
                  
                  {transactionForInterpretation && (
                    <TransactionInterpretation 
                      transaction={transactionForInterpretation} 
                    />
                  )}
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowConfirmation(false)}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleConfirm}
                    >
                      Confirm & Save
                    </Button>
                  </div>
                </div>
              ) : (
                // Analysis View
                <div className="space-y-4">
                  {/* User message */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <PenLine className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 flex-1 relative">
                      <p className="text-sm text-blue-900">{message || "No message provided"}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-60 hover:opacity-100"
                        onClick={handleEditMessage}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Analysis result */}
                  {analysis ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Analysis Result</h3>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${getConfidenceDisplay(analysis.confidence).color}`}
                        >
                          {getConfidenceDisplay(analysis.confidence).label}
                        </span>
                      </div>
                      
                      {transactionForInterpretation && (
                        <TransactionInterpretation
                          transaction={transactionForInterpretation}
                        />
                      )}
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          onClick={handleEditMessage}
                        >
                          Edit Message
                        </Button>
                        <Button 
                          onClick={() => setShowConfirmation(true)}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="bg-amber-100 rounded-full p-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 flex-1">
                        <p className="text-sm text-amber-900">
                          Sorry, I couldn't understand your message. Please try to be more specific about the transaction.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedCashTalkDialog;

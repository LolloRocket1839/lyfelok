
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mainCategories } from '@/utils/transactionStore';
import { Transaction } from '@/utils/transactionRouter';
import { supabase, userCategoryMappings, globalCategoryMappings } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ElegantFeedbackUIProps {
  transaction: Transaction;
  suggestedCategories: typeof mainCategories;
  onSelectCategory: (categoryId: string) => void;
  onDismiss: () => void;
}

const ElegantFeedbackUI = ({ transaction, suggestedCategories, onSelectCategory, onDismiss }: ElegantFeedbackUIProps) => {
  // Visibility state
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  
  // Auto-dismiss timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (visible) {
        handleDismiss();
      }
    }, 10000); // Reduced from 15 seconds to 10 seconds for better UX
    
    return () => clearTimeout(timer);
  }, [visible]);
  
  // Handle category selection
  const handleSelect = async (categoryId: string) => {
    try {
      // Update local UI first for responsiveness
      onSelectCategory(categoryId);
      
      // Check if we have valid transaction data for updating mappings
      const transactionDescription = transaction?.description || '';
      
      // If transaction has no description, create a fallback description based on category
      const effectiveDescription = transactionDescription || categoryId;
      
      // If user is logged in, update mapping in Supabase
      if (user && effectiveDescription) {
        await updateCategoryMapping(effectiveDescription, categoryId, user.id);
        toast.success('Categoria aggiornata con successo');
      } else {
        console.log("Skipping mapping update - missing user or transaction data:", {
          user: !!user,
          description: effectiveDescription
        });
      }
      
      setVisible(false);
    } catch (error) {
      console.error("Error updating category mapping:", error);
      toast.error('Errore durante l\'aggiornamento della categoria');
      // Still update the UI even if the backend update fails
      setVisible(false);
    }
  };
  
  // Handle dismissal
  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };
  
  // Update category mapping in Supabase
  const updateCategoryMapping = async (description: string, categoryId: string, userId: string) => {
    try {
      if (!description || !categoryId || !userId) {
        console.warn("Missing required parameters for category mapping update:", {
          description: !!description,
          categoryId: !!categoryId,
          userId: !!userId
        });
        return;
      }
      
      // Update user mappings
      await userCategoryMappings.updateMappings(description, categoryId, userId);
      
      // Extract keywords for global mappings
      const keywords = extractKeywords(description);
      
      // Update global mappings for each keyword
      for (const keyword of keywords) {
        if (keyword && keyword.length > 1) {
          await globalCategoryMappings.updateGlobalMapping(keyword, categoryId);
        }
      }
    } catch (error) {
      console.error("Error updating category mappings:", error);
      // Don't throw, we want the UI to still update even if backend fails
    }
  };
  
  // Extract keywords from description
  const extractKeywords = (text: string): string[] => {
    if (!text || typeof text !== 'string') {
      console.warn("Invalid text for keyword extraction:", text);
      return [];
    }
    
    // Improved stopwords list with more Italian common words
    const stopwords = [
      'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 
      'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'uno',
      'e', 'che', 'è', 'sono', 'ho', 'hai', 'ha', 'del', 'della',
      'al', 'dal', 'nel', 'sulla', 'questo', 'questa', 'mio', 'tuo'
    ];
    
    // Improved tokenization that handles partial words better
    return text
      .toLowerCase()
      .replace(/[^\w\sàèéìòù]/g, ' ') // Replace non-alphanumeric chars except Italian accents
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopwords.includes(word)); // Accept words with length > 1
  };
  
  // Don't render if not visible
  if (!visible) return null;
  
  // Display transaction description or a fallback
  const displayDescription = transaction?.description || "transazione";
  
  // Categories to display
  const displayCategories = expanded ? 
    suggestedCategories : 
    suggestedCategories.slice(0, 4); // Show only the first 4 if not expanded
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-20 left-0 right-0 mx-auto flex justify-center z-50 px-4"
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <p className="m-0 text-sm font-medium text-gray-800">
            Categoria per "{displayDescription}"?
          </p>
          <button 
            className="bg-transparent border-none text-gray-400 text-lg p-1"
            onClick={handleDismiss}
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 p-4">
          {displayCategories.map(category => (
            <button
              key={category.id}
              className="flex items-center gap-1.5 bg-opacity-10 rounded-full px-3 py-1.5 text-sm transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{ backgroundColor: `${category.color}20` }}
              onClick={() => handleSelect(category.id)}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
          
          {!expanded && suggestedCategories.length > 4 && (
            <button 
              className="text-emerald-500 bg-transparent border-none text-xs px-2 py-1.5"
              onClick={() => setExpanded(true)}
            >
              Più opzioni
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ElegantFeedbackUI;

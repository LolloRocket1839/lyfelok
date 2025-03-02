
import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import enhancedNlpProcessor from '@/utils/enhancedNlpProcessor';

interface ReceiptImageButtonProps {
  onProcessComplete: (text: string) => void;
}

const ReceiptImageButton: React.FC<ReceiptImageButtonProps> = ({ onProcessComplete }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "File type not supported",
        description: "Please upload an image file (JPEG, PNG).",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    toast({
      title: "Processing receipt...",
      description: "Analyzing the image for transaction data.",
    });

    try {
      // Read the image file
      const imageData = await readFileAsDataURL(file);
      
      // Process the receipt image (this would connect to a real OCR service)
      const extractedData = await processReceiptImage(imageData);
      
      if (extractedData && extractedData.text) {
        // Successfully extracted text from the receipt
        toast({
          title: "Receipt processed!",
          description: "Successfully extracted transaction data.",
        });
        
        // Send the extracted text to the NLP processor
        onProcessComplete(extractedData.text);
      } else {
        toast({
          title: "Processing failed",
          description: "Couldn't extract meaningful data from the image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing receipt image:", error);
      toast({
        title: "Processing error",
        description: "An error occurred while processing the image.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Simulate receipt OCR processing
  // In a real implementation, this would call a server-side OCR service
  const processReceiptImage = async (imageData: string): Promise<{ text: string, amount?: number, date?: string, merchant?: string } | null> => {
    // This is a simulated function that would normally call a backend OCR service
    // For demo purposes, we'll return placeholder data after a short delay
    
    return new Promise((resolve) => {
      // Simulate processing delay
      setTimeout(() => {
        // In a real implementation, this would return the actual OCR results
        // Here we're just returning a simple representation
        resolve({
          text: "Supermercato Esselunga €42.50",
          amount: 42.50,
          date: new Date().toISOString().split('T')[0],
          merchant: "Esselunga"
        });
      }, 1500);
    });
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full bg-white hover:bg-gray-100 text-gray-700"
        onClick={handleButtonClick}
        disabled={processing}
      >
        {processing ? (
          <div className="animate-spin">
            <Upload size={18} />
          </div>
        ) : (
          <Camera size={18} />
        )}
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
    </>
  );
};

export default ReceiptImageButton;

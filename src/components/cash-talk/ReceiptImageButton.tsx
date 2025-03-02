
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CameraCapture from './CameraCapture';
import receiptProcessor from '@/utils/receiptProcessor';

interface ReceiptImageButtonProps {
  onProcessComplete: (text: string) => void;
}

const ReceiptImageButton: React.FC<ReceiptImageButtonProps> = ({ onProcessComplete }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'idle' | 'loading' | 'analyzing' | 'success' | 'error'>('idle');
  const [showCameraDialog, setShowCameraDialog] = useState(false);

  const handleButtonClick = () => {
    // Show options for camera or file upload
    const useCameraConfirm = window.confirm("Use camera for receipt? Click 'Cancel' to upload an image file instead.");
    
    if (useCameraConfirm) {
      setShowCameraDialog(true);
    } else {
      fileInputRef.current?.click();
    }
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
    setProcessingStage('loading');
    
    toast({
      title: "Processing receipt...",
      description: "Analyzing the image for transaction data.",
    });

    try {
      // First processing stage - loading the image
      const imageData = await readFileAsDataURL(file);
      
      // Update processing stage
      setProcessingStage('analyzing');
      
      // Second processing stage - OCR analysis
      const extractedData = await processReceiptImage(imageData);
      
      if (extractedData && extractedData.text) {
        // Successfully extracted text from the receipt
        setProcessingStage('success');
        toast({
          title: "Receipt processed!",
          description: "Successfully extracted transaction data.",
        });
        
        // Send the extracted text to the NLP processor
        onProcessComplete(extractedData.text);
      } else {
        setProcessingStage('error');
        toast({
          title: "Processing failed",
          description: "Couldn't extract meaningful data from the image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing receipt image:", error);
      setProcessingStage('error');
      toast({
        title: "Processing error",
        description: "An error occurred while processing the image.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setProcessing(false);
        setProcessingStage('idle');
      }, 1000); // Keep the success/error state visible briefly
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle camera capture result
  const handleCameraCapture = (receiptText: string) => {
    setShowCameraDialog(false);
    
    // Process the captured text
    if (receiptText && receiptText.trim() !== '') {
      // Notify success
      toast({
        title: "Receipt captured!",
        description: "Successfully extracted data from the receipt.",
      });
      
      // Send the extracted text to the parent component
      onProcessComplete(receiptText);
    } else {
      toast({
        title: "Capture failed",
        description: "Couldn't extract data from the captured image.",
        variant: "destructive",
      });
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

  // Get the appropriate icon based on the processing stage
  const getButtonIcon = () => {
    switch (processingStage) {
      case 'loading':
        return <Upload size={18} className="animate-spin" />;
      case 'analyzing':
        return <ImageIcon size={18} className="animate-pulse" />;
      case 'success':
        return <Check size={18} className="text-green-500" />;
      case 'error':
        return <X size={18} className="text-red-500" />;
      default:
        return <Camera size={18} />;
    }
  };

  // Get button color based on processing stage
  const getButtonVariant = () => {
    switch (processingStage) {
      case 'success':
        return "outline";
      case 'error':
        return "destructive";
      default:
        return "ghost";
    }
  };

  return (
    <>
      <Button 
        variant={getButtonVariant()} 
        size="icon" 
        className="rounded-full bg-white hover:bg-gray-100 text-gray-700"
        onClick={handleButtonClick}
        disabled={processing}
        title="Capture or upload receipt"
      >
        {getButtonIcon()}
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      
      {/* Camera Dialog */}
      <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
        <DialogContent className="p-0 sm:max-w-md">
          <CameraCapture 
            onCapture={handleCameraCapture}
            onClose={() => setShowCameraDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptImageButton;

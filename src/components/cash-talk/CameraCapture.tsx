
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, X, RefreshCw, SaveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import receiptProcessor from '@/utils/receiptProcessor';

interface CameraCaptureProps {
  onCapture: (receiptData: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [receiptDetected, setReceiptDetected] = useState(false);
  const [processingStage, setProcessingStage] = useState<'idle' | 'capturing' | 'analyzing' | 'success' | 'error'>('idle');

  // Start camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setProcessingStage('idle');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setHasCamera(true);
      // Start receipt detection after camera is initialized
      setTimeout(detectReceipt, 1000);
    } catch (err) {
      console.error('Camera access error:', err);
      setHasCamera(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Basic receipt edge detection simulation
  // In a real implementation, this would use computer vision to detect receipts
  const detectReceipt = () => {
    if (!videoRef.current || processingStage !== 'idle') return;
    
    // This is a simplified simulation of receipt detection
    // In a real implementation, you'd use OpenCV.js or TensorFlow.js for edge detection
    const randomDetection = Math.random() > 0.5;
    setReceiptDetected(randomDetection);
    
    // Continue detection as long as camera is active
    setTimeout(detectReceipt, 500);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setProcessingStage('capturing');
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        
        // Process the captured image
        processImage(imageData);
      }
    } catch (err) {
      console.error('Error capturing image:', err);
      setProcessingStage('error');
      toast({
        title: "Capture Error",
        description: "Failed to capture image from camera.",
        variant: "destructive",
      });
    }
  };

  const processImage = async (imageData: string) => {
    setProcessingStage('analyzing');
    
    try {
      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, send the image to a server for OCR processing
      // or use a client-side OCR library
      
      // For demonstration, we'll use a simulated result
      const simulatedText = "Supermercato Esselunga €42.50";
      setProcessingStage('success');
      
      // Pass the extracted text to the parent component
      onCapture(simulatedText);
    } catch (err) {
      console.error('Error processing image:', err);
      setProcessingStage('error');
      toast({
        title: "Processing Error",
        description: "Failed to extract data from the receipt.",
        variant: "destructive",
      });
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setProcessingStage('idle');
  };

  // Render status indicators based on current state
  const renderStatusIndicator = () => {
    if (processingStage !== 'idle') {
      switch (processingStage) {
        case 'capturing':
          return (
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Camera size={16} className="animate-pulse" />
              <span>Capturing...</span>
            </div>
          );
        case 'analyzing':
          return (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <RefreshCw size={16} className="animate-spin" />
              <span>Analyzing receipt...</span>
            </div>
          );
        case 'success':
          return (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Check size={16} />
              <span>Data extracted!</span>
            </div>
          );
        case 'error':
          return (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <X size={16} />
              <span>Processing failed</span>
            </div>
          );
        default:
          return null;
      }
    }
    
    // When idle, show receipt detection status
    return receiptDetected ? (
      <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
        <Check size={16} />
        <span>Receipt detected</span>
      </div>
    ) : (
      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
        <Camera size={16} />
        <span>Position receipt in frame</span>
      </div>
    );
  };

  if (!hasCamera) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Camera Not Available</h3>
        <p className="mb-4">Please ensure camera permissions are granted or use the image upload option instead.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="relative">
        {/* Video display for camera feed */}
        <div className="relative aspect-[4/3] bg-black">
          {!capturedImage ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {receiptDetected && (
                <div className="absolute inset-0 border-4 border-green-500 pointer-events-none"></div>
              )}
              {renderStatusIndicator()}
            </>
          ) : (
            <>
              <img 
                src={capturedImage} 
                alt="Captured receipt" 
                className="w-full h-full object-contain"
              />
              {renderStatusIndicator()}
            </>
          )}
        </div>
        
        {/* Canvas for capturing frames (hidden) */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="p-4 flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        
        {!capturedImage ? (
          <Button 
            onClick={captureImage} 
            disabled={processingStage !== 'idle'}
            className={`${receiptDetected ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            Capture Receipt
          </Button>
        ) : (
          <div className="flex gap-2">
            {processingStage === 'error' && (
              <Button variant="outline" onClick={resetCapture}>
                Retry
              </Button>
            )}
            {processingStage === 'success' && (
              <Button variant="outline" onClick={onClose}>
                <SaveIcon className="mr-2 h-4 w-4" />
                Done
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CameraCapture;

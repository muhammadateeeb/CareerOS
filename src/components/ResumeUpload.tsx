import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  uploadStatus: 'uploading' | 'success' | 'error';
}

interface ResumeUploadProps {
  onFileUploaded?: (file: File) => void;
  onError?: (error: string) => void;
}

export function ResumeUpload({ onFileUploaded, onError }: ResumeUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!validTypes.includes(file.type)) {
      return 'Please upload a PDF, DOC, DOCX, or TXT file';
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFile = (file: File) => {
    setError(null);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onError) {
        onError(validationError);
      }
      return;
    }

    // Set upload state
    const uploadedFileData: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
      uploadStatus: 'uploading'
    };

    setUploadedFile(uploadedFileData);

    // Simulate upload process
    setTimeout(() => {
      setUploadedFile({
        ...uploadedFileData,
        uploadStatus: 'success'
      });
      
      if (onFileUploaded) {
        onFileUploaded(file);
      }
    }, 1500); // Simulate upload delay
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
        
        {/* Upload Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadedFile?.uploadStatus === 'uploading'}
          />
          
          <div className="pointer-events-none">
            {uploadedFile?.uploadStatus === 'uploading' ? (
              <div className="space-y-3">
                <div className="animate-spin h-8 w-8 mx-auto border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Uploading {uploadedFile.name}...</p>
              </div>
            ) : uploadedFile?.uploadStatus === 'success' ? (
              <div className="space-y-3">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
                <div>
                  <p className="font-medium text-green-600">Upload Successful!</p>
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Drag and drop your resume here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (PDF, DOCX, TXT • Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* File Details */}
        {uploadedFile && uploadedFile.uploadStatus === 'success' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              File Details
            </h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Name:</strong> {uploadedFile.name}</p>
              <p><strong>Size:</strong> {formatFileSize(uploadedFile.size)}</p>
              <p><strong>Type:</strong> {uploadedFile.file.type}</p>
              <p><strong>Status:</strong> <span className="text-green-600">Successfully uploaded</span></p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {uploadedFile?.uploadStatus === 'success' && (
            <Button 
              className="flex-1"
              onClick={() => {
                setUploadedFile(null);
                setError(null);
              }}
            >
              Upload Another File
            </Button>
          )}
          
          {uploadedFile?.uploadStatus === 'error' && (
            <Button 
              className="flex-1"
              onClick={() => {
                setUploadedFile(null);
                setError(null);
              }}
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

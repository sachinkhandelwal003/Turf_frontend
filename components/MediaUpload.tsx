"use client";

import { useState, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Video, FileText, AlertCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  originalFile?: File;
}
// ihg;rioeghoi'reh'gohrgioeh
// uiregp4i3uqfgpiug
interface MediaUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  initialFiles?: (string | UploadedFile)[];
  maxFiles?: number;
  acceptedTypes?: ('image' | 'video')[];
  className?: string;
}

export default function MediaUpload({ 
  onFilesChange, 
  initialFiles = [],
  maxFiles = 10, 
  acceptedTypes = ['image', 'video'],
  className = "" 
}: MediaUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(() => {
    return initialFiles.map(file => {
      if (typeof file === 'string') {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: file.split('/').pop() || 'Existing File',
          url: file.startsWith('http') ? file : `${baseUrl}${file}`,
          type: 'image', // Assume image for strings, can be improved
          size: 0
        };
      }
      return file;
    });
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local files when initialFiles changes
  useEffect(() => {
    if (initialFiles.length > 0) {
      const formattedFiles = initialFiles.map(file => {
        if (typeof file === 'string') {
          // Only add if it's not already in the files list (by checking URL)
          const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
          const url = file.startsWith('http') ? file : `${baseUrl}${file}`;
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: file.split('/').pop() || 'Existing File',
            url: url,
            type: 'image' as const,
            size: 0
          };
        }
        return file;
      });
      
      // Check if we actually need to update to avoid infinite loops
      // We compare URLs of existing files vs new initial files
      const currentUrls = files.map(f => f.url);
      const newUrls = formattedFiles.map(f => f.url);
      
      if (JSON.stringify(currentUrls) !== JSON.stringify(newUrls)) {
        setFiles(formattedFiles);
      }
    } else if (files.length > 0 && initialFiles.length === 0) {
      // If initialFiles becomes empty and we have files, check if they are all "existing" files
      // If they are, we should clear them.
      const hasOnlyExisting = files.every(f => !f.originalFile);
      if (hasOnlyExisting) {
        setFiles([]);
      }
    }
  }, [initialFiles]);

  const convertToPng = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw white background for transparent images
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const pngFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
              type: 'image/png',
              lastModified: Date.now()
            });
            resolve(pngFile);
          } else {
            reject(new Error('Could not convert image to PNG'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Could not load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const processFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        throw new Error('Only image and video files are allowed');
      }

      if (isImage && !acceptedTypes.includes('image')) {
        throw new Error('Image files are not allowed');
      }

      if (isVideo && !acceptedTypes.includes('video')) {
        throw new Error('Video files are not allowed');
      }

      // Convert only images to PNG, keep videos as-is
      let processedFile = file;
      if (isImage && file.type !== 'image/png') {
        processedFile = await convertToPng(file);
      }
      // Videos are kept in their original format - no conversion

      // Create preview URL
      const url = URL.createObjectURL(processedFile);
      
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: processedFile.name,
        url,
        type: isImage ? 'image' : 'video',
        size: processedFile.size,
        originalFile: processedFile
      };

      return uploadedFile;
    } catch (err) {
      console.error('Error processing file:', err);
      throw err;
    }
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    setError(null);
    setUploading(true);

    try {
      const newFiles: UploadedFile[] = [];
      
      for (let i = 0; i < fileList.length && files.length + newFiles.length < maxFiles; i++) {
        const file = fileList[i];
        
        try {
          const processedFile = await processFile(file);
          if (processedFile) {
            newFiles.push(processedFile);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error processing file');
        }
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading files');
    } finally {
      setUploading(false);
    }
  }, [files, maxFiles, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.includes('image') && acceptedTypes.includes('video') 
            ? 'image/*,video/*' 
            : acceptedTypes.includes('image') 
            ? 'image/*' 
            : 'video/*'
          }
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || files.length >= maxFiles}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Processing files...' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {acceptedTypes.includes('image') && acceptedTypes.includes('video') 
                ? 'Images and videos (images will be converted to PNG, videos stay as-is)'
                : acceptedTypes.includes('image') 
                ? 'Images (will be converted to PNG)'
                : 'Videos (original format preserved)'
              }
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max {maxFiles} files • Only images are converted to PNG format
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            <button
              onClick={() => {
                setFiles([]);
                onFilesChange([]);
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative group border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                {/* Preview */}
                <div className="aspect-video bg-gray-100 relative">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  {/* File Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                      file.type === 'image' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {file.type === 'image' ? (
                        <><ImageIcon className="w-3 h-3 mr-1" /> PNG</>
                      ) : (
                        <><Video className="w-3 h-3 mr-1" /> Video</>
                      )}
                    </span>
                  </div>
                </div>
                
                {/* File Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  {file.size > 0 && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                  {file.size === 0 && (
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                      Existing Server File
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Processing files...</span>
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image, FileText, Video, Music, Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function MediaUploader({ onFilesUploaded, maxFiles = 10 }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    return FileText;
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const filesWithPreviews = fileArray.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      uploaded: false,
      url: null,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setFiles(prev => [...prev, ...filesWithPreviews]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return updated;
    });
  };

  const uploadFiles = async () => {
    const unuploadedFiles = files.filter(f => !f.uploaded);
    if (unuploadedFiles.length === 0) {
      toast.error('All files are already uploaded');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < unuploadedFiles.length; i++) {
        const fileData = unuploadedFiles[i];
        
        const formData = new FormData();
        formData.append('file', fileData.file);
        
        const response = await base44.functions.invoke('uploadToS3', formData);
        const file_url = response.data.file_url;

        uploadedUrls.push(file_url);
        
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, uploaded: true, url: file_url } : f
        ));

        setUploadProgress(((i + 1) / unuploadedFiles.length) * 100);
      }

      toast.success(`${unuploadedFiles.length} file(s) uploaded to AWS S3 successfully`);
      
      if (onFilesUploaded) {
        const allUploadedUrls = files
          .filter(f => f.uploaded)
          .map(f => f.url)
          .concat(uploadedUrls);
        onFilesUploaded(allUploadedUrls);
      }
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const allFilesUploaded = files.length > 0 && files.every(f => f.uploaded);

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-all",
          dragActive 
            ? "border-purple-500 bg-purple-500 bg-opacity-10" 
            : "border-gray-700 bg-[#0D0D0D] hover:border-gray-600",
          files.length > 0 && "p-3"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {files.length === 0 ? (
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-3">
              Drag & drop files here, or click to browse
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-gray-700 text-white hover:bg-purple-600 hover:border-purple-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Max {maxFiles} files • 20MB per file • Images, Videos, Audio, PDF, DOC, DOCX
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">
                {files.length} file(s) selected
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= maxFiles}
                className="border-gray-700 text-white text-xs"
              >
                <Upload className="w-3 h-3 mr-1" />
                Add More
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {files.map((fileData) => {
                const Icon = getFileIcon(fileData.file.type);
                return (
                  <Card key={fileData.id} className="relative group bg-[#1A1A1A] border-gray-800 overflow-hidden">
                    <div className="aspect-square">
                      {fileData.preview ? (
                        <img
                          src={fileData.preview}
                          alt={fileData.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3">
                          <Icon className="w-8 h-8 text-gray-500 mb-2" />
                          <p className="text-xs text-gray-400 text-center truncate w-full">
                            {fileData.file.name}
                          </p>
                        </div>
                      )}
                      
                      {fileData.uploaded && (
                        <div className="absolute top-2 left-2">
                          <div className="bg-green-500 rounded-full p-1">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(fileData.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-gray-400">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            <Button
              type="button"
              onClick={uploadFiles}
              disabled={uploading || allFilesUploaded}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading {Math.round(uploadProgress)}%
                </>
              ) : allFilesUploaded ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  All Files Uploaded
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {files.filter(f => !f.uploaded).length} File(s)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
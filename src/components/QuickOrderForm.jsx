import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Zap } from 'lucide-react';
import MediaUploader from './MediaUploader';


export default function QuickOrderForm() {
  const [uploadedFileUrls, setUploadedFileUrls] = useState([]);

  const handleFilesUploaded = (urls) => {
    setUploadedFileUrls(urls);
  };

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Add Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-purple-500 bg-opacity-10 border border-purple-500 rounded-lg p-3">
          <p className="text-xs text-purple-300">
            ✨ Your COSTAR profile is applied automatically for best results
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-400 mb-2 block">Upload Media</Label>
            <MediaUploader onFilesUploaded={handleFilesUploaded} />
          </div>

          {uploadedFileUrls.length > 0 && (
            <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3">
              <p className="text-xs text-green-300">
                ✓ {uploadedFileUrls.length} file(s) will be included with your content
              </p>
            </div>
          )}
        </div>


      </CardContent>
    </Card>
  );
}
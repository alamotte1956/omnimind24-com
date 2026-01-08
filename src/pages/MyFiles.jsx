import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Music, Video, Download, Loader2, ExternalLink } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/OnboardingGuard';
import { format } from 'date-fns';

export default function MyFiles() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: exports = [], isLoading } = useQuery({
    queryKey: ['file-exports'],
    queryFn: () => base44.entities.FileExport.list('-created_date'),
    enabled: !!user
  });

  const getFormatIcon = (format) => {
    if (format === 'mp3') return <Music className="w-5 h-5 text-purple-400" />;
    if (format === 'mp4') return <Video className="w-5 h-5 text-blue-400" />;
    return <FileText className="w-5 h-5 text-green-400" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Files</h1>
            <p className="text-gray-400">All your exported content files in one place</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : exports.length === 0 ? (
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No files yet</h3>
                <p className="text-gray-400">Export your content in various formats to see them here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {exports.map((exp) => (
                <Card key={exp.id} className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-[#0D0D0D] rounded-lg">
                          {getFormatIcon(exp.format)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">
                            {exp.filename || `Export ${exp.id}`}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{format(new Date(exp.created_date), 'MMM dd, yyyy HH:mm')}</span>
                            <span>•</span>
                            <span>{formatFileSize(exp.file_size)}</span>
                            <span>•</span>
                            <Badge className="bg-purple-500/20 text-purple-400 uppercase">
                              {exp.format}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exp.status === 'processing' && (
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Processing
                          </Badge>
                        )}
                        {exp.status === 'failed' && (
                          <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
                        )}
                        {exp.status === 'completed' && exp.file_url && (
                          <Button
                            size="sm"
                            onClick={() => window.open(exp.file_url, '_blank')}
                            className="bg-purple-600 hover:bg-purple-700 gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </OnboardingGuard>
    </AuthGuard>
  );
}
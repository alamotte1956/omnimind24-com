import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SecurityDashboard() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const handleLogout = async () => {
    try {
      base44.auth.logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Security Overview
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your account security status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              Your account is protected with secure authentication
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Secure session management</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Protected authentication</span>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-6 border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
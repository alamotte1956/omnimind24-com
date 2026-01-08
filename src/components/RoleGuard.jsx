
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { AlertCircle } from 'lucide-react';

export default function RoleGuard({ children, allowedRoles = ['admin', 'staff', 'user'] }) {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.auth.me()
  });

  if (!user) {
    return null;
  }

  const userRole = user.access_level || 'user';
  
  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0D0D]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">
            You don&apos;t have permission to access this section. 
            {userRole === 'user' && ' Contact an administrator for access.'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertCircle } from 'lucide-react';

export function usePermissions() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: customRole } = useQuery({
    queryKey: ['user-role', user?.custom_role_id],
    queryFn: () => base44.entities.Role.filter({ id: user.custom_role_id }),
    enabled: !!user?.custom_role_id,
    select: (data) => data[0]
  });

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admins have all permissions
    if (user.access_level === 'admin') return true;
    
    // Staff have most permissions except role management
    if (user.access_level === 'staff') {
      const staffRestricted = ['manage_roles', 'manage_users'];
      if (staffRestricted.includes(permission)) return false;
      return true;
    }
    
    // Check custom role permissions
    if (customRole?.permissions) {
      return customRole.permissions.includes(permission);
    }
    
    // Default user permissions
    const defaultPermissions = [
      'view_dashboard',
      'create_content',
      'purchase_credits',
      'view_credit_history',
      'view_referrals',
      'create_referrals'
    ];
    
    return defaultPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions) => {
    return permissions.every(p => hasPermission(p));
  };

  return {
    user,
    customRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.access_level === 'admin',
    isStaff: user?.access_level === 'staff'
  };
}

export default function PermissionGuard({ children, permission, permissions, requireAll = false, fallback = null }) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    if (fallback) return fallback;
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-gray-400">
            You don't have permission to access this feature.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
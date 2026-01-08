import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, User } from 'lucide-react';

export default function UserRoleBadge({ role }) {
  const roleConfig = {
    admin: {
      label: 'ADMIN',
      icon: ShieldCheck,
      className: 'bg-purple-500 bg-opacity-20 text-purple-400 border-purple-500'
    },
    staff: {
      label: 'STAFF',
      icon: Shield,
      className: 'bg-blue-500 bg-opacity-20 text-blue-400 border-blue-500'
    },
    user: {
      label: 'USER',
      icon: User,
      className: 'bg-gray-500 bg-opacity-20 text-gray-400 border-gray-500'
    }
  };

  const config = roleConfig[role] || roleConfig.user;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} flex items-center gap-1 border`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard', category: 'General' },
  { id: 'create_content', label: 'Create Content', category: 'Content' },
  { id: 'review_content', label: 'Review Content', category: 'Content' },
  { id: 'delete_content', label: 'Delete Content', category: 'Content' },
  { id: 'view_all_content', label: 'View All Content', category: 'Content' },
  { id: 'create_templates', label: 'Create Templates', category: 'Templates' },
  { id: 'edit_templates', label: 'Edit Templates', category: 'Templates' },
  { id: 'delete_templates', label: 'Delete Templates', category: 'Templates' },
  { id: 'manage_templates', label: 'Manage All Templates', category: 'Templates' },
  { id: 'view_analytics', label: 'View Analytics', category: 'Analytics' },
  { id: 'purchase_credits', label: 'Purchase Credits', category: 'Credits' },
  { id: 'view_credit_history', label: 'View Credit History', category: 'Credits' },
  { id: 'manage_users', label: 'Manage Users', category: 'Admin' },
  { id: 'manage_roles', label: 'Manage Roles', category: 'Admin' },
  { id: 'access_admin_panel', label: 'Access Admin Panel', category: 'Admin' },
  { id: 'manage_settings', label: 'Manage Settings', category: 'Admin' },
  { id: 'view_referrals', label: 'View Referrals', category: 'Referrals' },
  { id: 'create_referrals', label: 'Create Referrals', category: 'Referrals' }
];

export default function RoleManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiClient.entities.Role.list('-created_date')
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => apiClient.entities.User.list()
  });

  const createRoleMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setIsDialogOpen(false);
      resetForm();
      toast.success('Role created successfully');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.Role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setIsDialogOpen(false);
      setEditingRole(null);
      resetForm();
      toast.success('Role updated successfully');
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id) => apiClient.entities.Role.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      toast.success('Role deleted');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', permissions: [] });
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || formData.permissions.length === 0) {
      toast.error('Name and at least one permission are required');
      return;
    }

    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createRoleMutation.mutate(formData);
    }
  };

  const handleDelete = (role) => {
    const assignedUsers = users.filter(u => u.custom_role_id === role.id).length;
    if (assignedUsers > 0) {
      toast.error(`Cannot delete role. ${assignedUsers} user(s) are assigned to this role.`);
      return;
    }

    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      deleteRoleMutation.mutate(role.id);
    }
  };

  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  const getRoleUserCount = (roleId) => {
    return users.filter(u => u.custom_role_id === roleId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Role Management</h2>
          <p className="text-gray-400">Create and manage custom roles with specific permissions</p>
        </div>
        <Button
          onClick={() => {
            setEditingRole(null);
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <CardTitle className="text-white text-lg">{role.name}</CardTitle>
                  </div>
                  {role.description && (
                    <p className="text-sm text-gray-400">{role.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Users:</span>
                  <span className="text-white font-semibold">{getRoleUserCount(role.id)}</span>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-2">Permissions ({role.permissions?.length || 0}):</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 4).map((perm) => (
                      <Badge key={perm} variant="outline" className="border-gray-700 text-gray-400 text-xs">
                        {perm.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {role.permissions?.length > 4 && (
                      <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                        +{role.permissions.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {!role.is_system_role && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(role)}
                      className="flex-1 border-gray-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(role)}
                      className="border-gray-700 hover:bg-red-600/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1A1A1A] border-gray-800 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-400">Role Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Content Manager"
                className="bg-[#0D0D0D] border-gray-700 text-white mt-2"
              />
            </div>

            <div>
              <Label className="text-gray-400">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this role's responsibilities..."
                className="bg-[#0D0D0D] border-gray-700 text-white mt-2 h-20"
              />
            </div>

            <div>
              <Label className="text-gray-400 mb-3 block">Permissions *</Label>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="bg-[#0D0D0D] rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={perm.id}
                            checked={formData.permissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                            className="border-gray-700"
                          />
                          <label
                            htmlFor={perm.id}
                            className="text-sm text-gray-300 cursor-pointer"
                          >
                            {perm.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingRole(null);
                resetForm();
              }}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {editingRole ? 'Update' : 'Create'} Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
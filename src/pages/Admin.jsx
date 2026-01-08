import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Settings, TrendingUp, Database, Activity, DollarSign, 
  AlertCircle, CheckCircle, Clock, Zap, FileText, MessageSquare,
  Calendar, TrendingDown, ArrowUpRight, ArrowDownRight, Target,
  Shield, Bell, BarChart3, Sparkles, Star
} from 'lucide-react';
import AuthGuard from '../components/AuthGuard';
import RoleGuard from '../components/RoleGuard';
import UserRoleBadge from '../components/UserRoleBadge';
import RoleManagement from '../components/RoleManagement';
import { toast } from 'sonner';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export default function Admin() {
  const queryClient = useQueryClient();
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list('-created_date')
  });

  const { data: contentOrders = [] } = useQuery({
    queryKey: ['content-orders-admin'],
    queryFn: () => base44.entities.ContentOrder.list('-created_date')
  });

  const { data: credits = [] } = useQuery({
    queryKey: ['credits-admin'],
    queryFn: () => base44.entities.Credit.list()
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions-admin'],
    queryFn: () => base44.entities.CreditTransaction.list('-created_date', 100)
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders-admin'],
    queryFn: () => base44.entities.Order.list('-created_date')
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates-admin'],
    queryFn: () => base44.entities.UserTemplate.list('-created_date')
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals-admin'],
    queryFn: () => base44.entities.Referral.list('-created_date')
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, accessLevel }) => 
      base44.entities.User.update(userId, { access_level: accessLevel }),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      toast.success('User role updated');
    }
  });

  const assignCustomRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }) => 
      base44.entities.User.update(userId, { custom_role_id: roleId || null }),
    onSuccess: () => {
      queryClient.invalidateQueries(['allUsers']);
      toast.success('Custom role assigned');
    }
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const daysAgo = selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30;
    const startDate = startOfDay(subDays(now, daysAgo));

    // Filter data by time range
    const recentOrders = contentOrders.filter(o => new Date(o.created_date) >= startDate);
    const recentTransactions = transactions.filter(t => new Date(t.created_date) >= startDate);
    const recentUsers = allUsers.filter(u => new Date(u.created_date) >= startDate);

    // Calculate previous period for comparison
    const prevStartDate = startOfDay(subDays(startDate, daysAgo));
    const prevOrders = contentOrders.filter(o => {
      const date = new Date(o.created_date);
      return date >= prevStartDate && date < startDate;
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.status === 'completed' ? o.price : 0), 0);
    const recentRevenue = orders.filter(o => new Date(o.created_date) >= startDate && o.status === 'completed')
      .reduce((sum, o) => sum + o.price, 0);
    
    const totalCreditsUsed = transactions.filter(t => t.transaction_type === 'usage')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalCreditsPurchased = transactions.filter(t => t.transaction_type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);

    const completedOrders = contentOrders.filter(o => o.status === 'completed').length;
    const processingOrders = contentOrders.filter(o => o.status === 'processing').length;
    const failedOrders = contentOrders.filter(o => o.status === 'failed').length;

    const successRate = contentOrders.length > 0 
      ? ((completedOrders / contentOrders.length) * 100).toFixed(1)
      : 0;

    const avgCreditsPerUser = allUsers.length > 0
      ? (totalCreditsUsed / allUsers.length).toFixed(0)
      : 0;

    const orderChange = prevOrders.length > 0
      ? (((recentOrders.length - prevOrders.length) / prevOrders.length) * 100).toFixed(1)
      : 0;

    return {
      totalUsers: allUsers.length,
      newUsers: recentUsers.length,
      totalOrders: contentOrders.length,
      recentOrders: recentOrders.length,
      totalRevenue,
      recentRevenue,
      completedOrders,
      processingOrders,
      failedOrders,
      successRate,
      totalCreditsUsed,
      totalCreditsPurchased,
      avgCreditsPerUser,
      orderChange,
      activeTemplates: templates.filter(t => t.is_public).length,
      totalReferrals: referrals.length,
      redeemedReferrals: referrals.filter(r => r.status === 'redeemed').length
    };
  }, [contentOrders, transactions, allUsers, orders, templates, referrals, selectedTimeRange]);

  const recentActivity = useMemo(() => {
    const activities = [];
    
    contentOrders.slice(0, 10).forEach(order => {
      activities.push({
        type: 'order',
        description: `New ${order.task_type.replace('_', ' ')} order`,
        user: order.created_by,
        status: order.status,
        timestamp: order.created_date
      });
    });

    orders.slice(0, 5).forEach(order => {
      if (order.status === 'completed') {
        activities.push({
          type: 'purchase',
          description: `Credit purchase: ${order.amount} credits`,
          user: order.created_by,
          amount: order.price,
          timestamp: order.created_date
        });
      }
    });

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);
  }, [contentOrders, orders]);

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['admin']}>
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Control Center</h1>
              <p className="text-gray-400">Real-time system monitoring and management</p>
            </div>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32 bg-[#1A1A1A] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-600/20">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <Badge className="bg-green-600 text-white">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +{metrics.newUsers}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400 mb-1">Total Users</div>
                <div className="text-3xl font-bold text-white">{metrics.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-600/20">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <Badge className={`${metrics.orderChange >= 0 ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    {metrics.orderChange >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {Math.abs(metrics.orderChange)}%
                  </Badge>
                </div>
                <div className="text-sm text-gray-400 mb-1">Content Orders</div>
                <div className="text-3xl font-bold text-white">{metrics.totalOrders}</div>
                <div className="text-xs text-gray-500 mt-2">{metrics.recentOrders} in selected period</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-600/20">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <Badge className="bg-green-600 text-white">
                    ${metrics.recentRevenue.toFixed(0)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
                <div className="text-3xl font-bold text-white">${metrics.totalRevenue.toFixed(0)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-600/20">
                    <Target className="w-6 h-6 text-yellow-400" />
                  </div>
                  <Badge className="bg-green-600 text-white">
                    {metrics.successRate}%
                  </Badge>
                </div>
                <div className="text-sm text-gray-400 mb-1">Success Rate</div>
                <div className="text-3xl font-bold text-white">{metrics.completedOrders}</div>
                <div className="text-xs text-gray-500 mt-2">of {metrics.totalOrders} total</div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Order Success Rate</span>
                    <span className="text-white font-semibold">{metrics.successRate}%</span>
                  </div>
                  <Progress value={parseFloat(metrics.successRate)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Processing Orders</span>
                    <span className="text-blue-400 font-semibold">{metrics.processingOrders}</span>
                  </div>
                  <Progress value={(metrics.processingOrders / Math.max(metrics.totalOrders, 1)) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Failed Orders</span>
                    <span className="text-red-400 font-semibold">{metrics.failedOrders}</span>
                  </div>
                  <Progress value={(metrics.failedOrders / Math.max(metrics.totalOrders, 1)) * 100} className="h-2 bg-red-900" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Credit Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg">
                  <div>
                    <div className="text-xs text-gray-400">Total Used</div>
                    <div className="text-xl font-bold text-white">{metrics.totalCreditsUsed.toLocaleString()}</div>
                  </div>
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg">
                  <div>
                    <div className="text-xs text-gray-400">Total Purchased</div>
                    <div className="text-xl font-bold text-white">{metrics.totalCreditsPurchased.toLocaleString()}</div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg">
                  <div>
                    <div className="text-xs text-gray-400">Avg Per User</div>
                    <div className="text-xl font-bold text-white">{metrics.avgCreditsPerUser}</div>
                  </div>
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Template & Referrals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg">
                  <div>
                    <div className="text-xs text-gray-400">Active Templates</div>
                    <div className="text-xl font-bold text-white">{metrics.activeTemplates}</div>
                  </div>
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg">
                  <div>
                    <div className="text-xs text-gray-400">Total Referrals</div>
                    <div className="text-xl font-bold text-white">{metrics.totalReferrals}</div>
                  </div>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg">
                  <div>
                    <div className="text-xs text-gray-400">Redeemed</div>
                    <div className="text-xl font-bold text-white">{metrics.redeemedReferrals}</div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for detailed views */}
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
              <TabsTrigger value="orders">Order Monitor</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card className="bg-[#1A1A1A] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Real-Time Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No recent activity</div>
                    ) : (
                      recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-[#0D0D0D] rounded-lg hover:bg-gray-800/50 transition-colors">
                          <div className={`p-2 rounded-lg ${
                            activity.type === 'order' ? 'bg-blue-600/20' : 'bg-green-600/20'
                          }`}>
                            {activity.type === 'order' ? (
                              <Sparkles className={`w-4 h-4 ${
                                activity.status === 'completed' ? 'text-green-400' : 
                                activity.status === 'processing' ? 'text-blue-400' : 'text-red-400'
                              }`} />
                            ) : (
                              <DollarSign className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{activity.description}</div>
                            <div className="text-xs text-gray-400">{activity.user}</div>
                          </div>
                          <div className="text-right">
                            {activity.status && (
                              <Badge className={`text-xs ${
                                activity.status === 'completed' ? 'bg-green-600' :
                                activity.status === 'processing' ? 'bg-blue-600' : 'bg-red-600'
                              }`}>
                                {activity.status}
                              </Badge>
                            )}
                            {activity.amount && (
                              <div className="text-green-400 font-semibold text-sm">
                                ${activity.amount.toFixed(2)}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="bg-[#1A1A1A] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allUsers.map((user) => {
                      const userCustomRole = roles.find(r => r.id === user.custom_role_id);
                      
                      return (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-[#0D0D0D] rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-white font-medium">{user.full_name || 'Unnamed User'}</div>
                              <UserRoleBadge role={user.access_level || 'user'} />
                              {userCustomRole && (
                                <Badge className="bg-purple-600/20 text-purple-400 border-purple-500">
                                  {userCustomRole.name}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Joined {format(new Date(user.created_date), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          
                          {currentUser?.access_level === 'admin' && currentUser.id !== user.id && (
                            <div className="flex gap-2">
                              <Select
                                value={user.access_level || 'user'}
                                onValueChange={(value) => updateRoleMutation.mutate({ 
                                  userId: user.id, 
                                  accessLevel: value 
                                })}
                              >
                                <SelectTrigger className="w-32 bg-[#1A1A1A] border-gray-700 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-gray-700">
                                  <SelectItem value="admin" className="text-white">Admin</SelectItem>
                                  <SelectItem value="staff" className="text-white">Staff</SelectItem>
                                  <SelectItem value="user" className="text-white">User</SelectItem>
                                </SelectContent>
                              </Select>

                              <Select
                                value={user.custom_role_id || 'none'}
                                onValueChange={(value) => assignCustomRoleMutation.mutate({ 
                                  userId: user.id, 
                                  roleId: value === 'none' ? null : value 
                                })}
                              >
                                <SelectTrigger className="w-48 bg-[#1A1A1A] border-gray-700 text-white">
                                  <SelectValue placeholder="Custom Role" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-gray-700">
                                  <SelectItem value="none" className="text-white">No Custom Role</SelectItem>
                                  {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id} className="text-white">
                                      {role.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          {currentUser?.id === user.id && (
                            <span className="text-sm text-gray-500">(You)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles">
              <RoleManagement />
            </TabsContent>

            <TabsContent value="orders">
              <Card className="bg-[#1A1A1A] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Order Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentOrders.slice(0, 20).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-[#0D0D0D] rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-white font-medium">
                              {order.title || order.task_type.replace('_', ' ')}
                            </div>
                            <Badge className={`${
                              order.status === 'completed' ? 'bg-green-600' :
                              order.status === 'processing' ? 'bg-blue-600' : 'bg-red-600'
                            }`}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">{order.created_by}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(order.created_date), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                        <div className="text-right">
                          {order.model_used && (
                            <div className="text-xs text-purple-400 mb-1">{order.model_used}</div>
                          )}
                          <Badge variant="outline" className="border-gray-700">
                            {order.task_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
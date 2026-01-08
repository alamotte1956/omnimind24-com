
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function OrderHistory() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.auth.me()
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const userOrders = await apiClient.entities.Order.filter({ created_by: user.email });
      return userOrders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Receipt className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-500 bg-opacity-20 text-green-500',
      failed: 'bg-red-500 bg-opacity-20 text-red-500',
      pending: 'bg-yellow-500 bg-opacity-20 text-yellow-500',
      refunded: 'bg-gray-500 bg-opacity-20 text-gray-500'
    };
    return colors[status] || colors.pending;
  };

  if (isLoading) {
    return (
      <Card className="bg-[#1A1A1A] border-gray-800">
        <CardContent className="p-8 text-center text-gray-400">
          Loading orders...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1A1A1A] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-purple-500" />
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No orders yet. Purchase credits to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-[#0D0D0D] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <div className="text-white font-medium">
                      {order.amount} Credits
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.created_date).toLocaleDateString()} • {order.order_id}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-white font-semibold">${order.price}</div>
                  <Badge className={getStatusBadge(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
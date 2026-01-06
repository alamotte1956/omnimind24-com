import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Calendar, FileText, Coins, Eye, Download, Search, Filter, ArrowUpDown, Trash2, X, Star, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/OnboardingGuard';

export default function OrderHistory() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pendingDeleteOrder, setPendingDeleteOrder] = useState(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['order-history'],
    queryFn: () => base44.entities.ContentOrder.list('-created_date')
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const deleteOrdersMutation = useMutation({
    mutationFn: async (orderIds) => {
      for (const id of orderIds) {
        await base44.entities.ContentOrder.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['order-history']);
      setSelectedOrders([]);
      toast.success('Selected orders deleted');
    },
    onError: () => {
      toast.error('Failed to delete orders');
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => 
      base44.entities.ContentOrder.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries(['order-history']);
      toast.success('Favorite updated');
    }
  });

  const reorderMutation = useMutation({
    mutationFn: async (order) => {
      const { data: credits } = await queryClient.fetchQuery({
        queryKey: ['credits'],
        queryFn: async () => {
          const allCredits = await base44.entities.Credit.filter({ created_by: user?.email });
          return allCredits[0];
        }
      });

      if (user?.access_level !== 'staff' && user?.access_level !== 'admin') {
        const creditCost = 20;
        if ((credits?.balance || 0) < creditCost) {
          throw new Error('Insufficient credits. Please purchase more credits to continue.');
        }

        await base44.entities.Credit.update(credits.id, {
          balance: credits.balance - creditCost,
          total_used: (credits.total_used || 0) + creditCost
        });

        await base44.entities.CreditTransaction.create({
          transaction_type: 'usage',
          amount: -creditCost,
          description: `Content generation (reorder): ${order.task_type}`,
          balance_after: credits.balance - creditCost
        });
      }

      const newOrder = await base44.entities.ContentOrder.create({
        task_type: order.task_type,
        input_data: order.input_data,
        title: `${order.title} (Copy)`,
        status: 'processing'
      });

      await base44.functions.invoke('processOrder', { order_id: newOrder.id });
      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['order-history']);
      queryClient.invalidateQueries(['credits']);
      toast.success('Order placed! Credits deducted.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reorder');
    }
  });

  const taskTypeLabels = {
    content_generation: 'Content Generation',
    analysis: 'Analysis',
    translation: 'Translation',
    summarization: 'Summarization',
    creative_writing: 'Creative Writing',
    technical: 'Technical'
  };

  const statusColors = {
    processing: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500'
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.input_data?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || order.task_type === filterType;
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      
      const orderDate = new Date(order.created_date);
      const matchesDateRange = (!dateRange.from || orderDate >= dateRange.from) &&
                               (!dateRange.to || orderDate <= dateRange.to);
      
      return matchesSearch && matchesType && matchesStatus && matchesDateRange;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.created_date) - new Date(b.created_date);
      } else if (sortBy === 'type') {
        comparison = a.task_type.localeCompare(b.task_type);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [orders, searchTerm, filterType, filterStatus, dateRange, sortBy, sortOrder]);

  const copyContent = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard');
  };

  const downloadContent = (order) => {
    try {
      const blob = new Blob([order.output_content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${order.title || 'content'}-${order.id}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Content downloaded');
      return true;
    } catch (error) {
      toast.error('Download failed');
      return false;
    }
  };

  const handleDownloadAndDelete = (order) => {
    setPendingDeleteOrder(order);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDownloadAndDelete = async () => {
    if (!pendingDeleteOrder) return;
    
    const success = downloadContent(pendingDeleteOrder);
    if (success) {
      await base44.entities.ContentOrder.delete(pendingDeleteOrder.id);
      queryClient.invalidateQueries(['order-history']);
      toast.success('Content downloaded and deleted');
    }
    
    setIsDeleteConfirmOpen(false);
    setPendingDeleteOrder(null);
  };

  const downloadAllSelected = () => {
    const selectedOrdersData = filteredAndSortedOrders.filter(o => selectedOrders.includes(o.id));
    const completedOrders = selectedOrdersData.filter(o => o.status === 'completed' && o.output_content);
    
    if (completedOrders.length === 0) {
      toast.error('No completed orders to download');
      return;
    }

    completedOrders.forEach(order => downloadContent(order));
    toast.success(`Downloaded ${completedOrders.length} order(s)`);
  };

  const downloadAndDeleteAllSelected = () => {
    const selectedOrdersData = filteredAndSortedOrders.filter(o => selectedOrders.includes(o.id));
    const completedOrders = selectedOrdersData.filter(o => o.status === 'completed' && o.output_content);
    
    if (completedOrders.length === 0) {
      toast.error('No completed orders to download');
      return;
    }

    setIsBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDownloadAndDelete = async () => {
    const selectedOrdersData = filteredAndSortedOrders.filter(o => selectedOrders.includes(o.id));
    const completedOrders = selectedOrdersData.filter(o => o.status === 'completed' && o.output_content);
    
    // Download all first
    completedOrders.forEach(order => downloadContent(order));
    
    // Then delete all
    for (const order of completedOrders) {
      await base44.entities.ContentOrder.delete(order.id);
    }
    
    queryClient.invalidateQueries(['order-history']);
    setSelectedOrders([]);
    toast.success(`Downloaded and deleted ${completedOrders.length} item(s)`);
    setIsBulkDeleteConfirmOpen(false);
  };

  const deleteSelected = () => {
    if (selectedOrders.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)?`)) {
      deleteOrdersMutation.mutate(selectedOrders);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredAndSortedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredAndSortedOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setDateRange({ from: null, to: null });
  };

  const hasActiveFilters = searchTerm || filterType !== 'all' || filterStatus !== 'all' || dateRange.from || dateRange.to;

  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Order History</h1>
            <p className="text-gray-400">View and manage all your past content orders</p>
          </div>

          <Card className="bg-[#1A1A1A] border-gray-800 mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-[#0D0D0D] border-gray-700 text-white"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-48 bg-[#0D0D0D] border-gray-700 text-white">
                      <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="content_generation">Content Generation</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="translation">Translation</SelectItem>
                      <SelectItem value="summarization">Summarization</SelectItem>
                      <SelectItem value="creative_writing">Creative Writing</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48 bg-[#0D0D0D] border-gray-700 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex flex-wrap gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="bg-[#0D0D0D] border-gray-700 text-white hover:bg-purple-600/20">
                          <Calendar className="w-4 h-4 mr-2" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                            ) : (
                              format(dateRange.from, 'MMM d, yyyy')
                            )
                          ) : (
                            'Date Range'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 bg-[#0D0D0D] border-gray-700 text-white">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="bg-[#0D0D0D] border-gray-700 text-white hover:bg-purple-600/20"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>

                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="bg-[#0D0D0D] border-gray-700 text-white hover:bg-red-600/20"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    )}
                  </div>

                  {selectedOrders.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAllSelected}
                        className="bg-[#0D0D0D] border-gray-700 text-white hover:bg-green-600/20"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Selected ({selectedOrders.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAndDeleteAllSelected}
                        className="bg-[#0D0D0D] border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        <Trash2 className="w-4 h-4 mr-2" />
                        Download & Delete ({selectedOrders.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deleteSelected}
                        disabled={deleteOrdersMutation.isPending}
                        className="bg-[#0D0D0D] border-gray-700 text-white hover:bg-red-600/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <Card className="bg-[#1A1A1A] border-gray-800">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white text-lg mb-2">No orders found</h3>
                <p className="text-gray-400">Try adjusting your filters or create a new order</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedOrders.length > 0 && (
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredAndSortedOrders.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-700 bg-[#0D0D0D] text-purple-600 focus:ring-purple-600 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-gray-400">
                      Select All ({filteredAndSortedOrders.length} orders)
                    </span>
                  </label>
                </div>
              )}
              {filteredAndSortedOrders.map((order) => (
                <Card key={order.id} className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <label className="flex items-start pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded border-gray-700 bg-[#0D0D0D] text-purple-600 focus:ring-purple-600 focus:ring-offset-0 cursor-pointer"
                        />
                      </label>
                      <div className="flex-1 flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                         <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <h3 className="text-lg font-semibold text-white">
                               {order.title || 'Untitled Order'}
                             </h3>
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => toggleFavoriteMutation.mutate({ 
                                 id: order.id, 
                                 isFavorite: order.is_favorite 
                               })}
                               className="h-8 w-8 text-gray-400 hover:text-yellow-400"
                             >
                               <Star className={`w-4 h-4 ${order.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                             </Button>
                           </div>
                           <div className="flex flex-wrap gap-2">
                             <Badge className="bg-purple-600/20 text-purple-400 border-purple-500">
                               {taskTypeLabels[order.task_type]}
                             </Badge>
                             <Badge className={`${statusColors[order.status]} text-white`}>
                               {order.status}
                             </Badge>
                             {order.is_favorite && (
                               <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500">
                                 <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                                 Favorite
                               </Badge>
                             )}
                           </div>
                         </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Created:</span>
                            <span className="text-white">
                              {format(new Date(order.created_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {order.model_used && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">Model:</span>
                              <span className="text-white">{order.model_used}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Coins className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">Credits:</span>
                            <span className="text-purple-400 font-semibold">
                              {user?.access_level === 'staff' || user?.access_level === 'admin' ? '0' : '20'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#0D0D0D] rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-400 mb-1">Input:</p>
                          <p className="text-sm text-white line-clamp-2">{order.input_data}</p>
                        </div>

                        {order.status === 'completed' && order.output_content && (
                          <div className="bg-[#0D0D0D] rounded-lg p-3">
                            <p className="text-sm text-gray-400 mb-1">Output:</p>
                            <p className="text-sm text-white line-clamp-3">{order.output_content}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        {order.status === 'completed' && order.output_content && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyContent(order.output_content)}
                              className="border-gray-700 hover:bg-purple-600/20 hover:border-purple-500"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadContent(order)}
                              className="border-gray-700 hover:bg-purple-600/20 hover:border-purple-500"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAndDelete(order)}
                              className="border-red-600 text-red-400 hover:bg-red-600/20 hover:border-red-500"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              <Trash2 className="w-4 h-4 mr-2" />
                              Download & Delete
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reorderMutation.mutate(order)}
                          disabled={reorderMutation.isPending}
                          className="border-gray-700 hover:bg-green-600/20 hover:border-green-500"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reorder
                        </Button>
                      </div>
                      </div>
                      </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Single Order Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent className="bg-[#1A1A1A] border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Download and delete this content?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                The content will be downloaded first, then permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setPendingDeleteOrder(null);
                }}
                className="bg-[#0D0D0D] border-gray-700 text-white hover:bg-gray-800"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDownloadAndDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Download & Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={isBulkDeleteConfirmOpen} onOpenChange={setIsBulkDeleteConfirmOpen}>
          <AlertDialogContent className="bg-[#1A1A1A] border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Download and delete selected items?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                {selectedOrders.length} item(s) will be downloaded first, then permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => setIsBulkDeleteConfirmOpen(false)}
                className="bg-[#0D0D0D] border-gray-700 text-white hover:bg-gray-800"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBulkDownloadAndDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Download & Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </OnboardingGuard>
    </AuthGuard>
  );
}
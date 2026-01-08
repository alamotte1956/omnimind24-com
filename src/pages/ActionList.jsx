
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Loader2, CheckCircle2, Circle, Calendar } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';
import OnboardingGuard from '../components/OnboardingGuard';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ActionList() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['action-items'],
    queryFn: () => base44.entities.ActionItem.list('-due_date')
  });

  const syncMutation = useMutation({
    mutationFn: () => base44.functions.invoke('syncSalesforceTasks'),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['action-items']);
      toast.success(`Synced ${response.data.synced} new tasks, updated ${response.data.updated}`);
    },
    onError: (error) => {
      toast.error('Sync failed: ' + error.message);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }) => {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await base44.entities.ActionItem.update(id, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['action-items']);
    }
  });

  const todayTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.due_date === today && t.status !== 'completed';
  });

  const overdueTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.due_date < today && t.status !== 'completed';
  });

  const upcomingTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.due_date > today && t.status !== 'completed';
  });

  const completedTasks = tasks.filter(t => t.status === 'completed');

  const getPriorityColor = (priority) => {
    return {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    }[priority] || 'bg-gray-500';
  };

  const TaskCard = ({ task }) => (
    <Card className="bg-[#1A1A1A] border-gray-800 hover:border-purple-500 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.status === 'completed'}
            onCheckedChange={() => toggleStatusMutation.mutate({ id: task.id, currentStatus: task.status })}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`text-white font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                {task.source === 'salesforce' && (
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                    Salesforce
                  </Badge>
                )}
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-gray-400 mt-1">{task.description}</p>
            )}
            {task.due_date && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AuthGuard>
      <OnboardingGuard>
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Daily Action List</h1>
              <p className="text-gray-400">Your tasks synced from Salesforce and more</p>
            </div>
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Salesforce
                </>
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {overdueTasks.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-red-400 mb-4">Overdue ({overdueTasks.length})</h2>
                  <div className="space-y-3">
                    {overdueTasks.map(task => <TaskCard key={task.id} task={task} />)}
                  </div>
                </div>
              )}

              {todayTasks.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Today ({todayTasks.length})</h2>
                  <div className="space-y-3">
                    {todayTasks.map(task => <TaskCard key={task.id} task={task} />)}
                  </div>
                </div>
              )}

              {upcomingTasks.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-400 mb-4">Upcoming ({upcomingTasks.length})</h2>
                  <div className="space-y-3">
                    {upcomingTasks.map(task => <TaskCard key={task.id} task={task} />)}
                  </div>
                </div>
              )}

              {completedTasks.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-green-400 mb-4">Completed ({completedTasks.length})</h2>
                  <div className="space-y-3">
                    {completedTasks.map(task => <TaskCard key={task.id} task={task} />)}
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <Card className="bg-[#1A1A1A] border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Circle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white text-lg mb-2">No tasks yet</h3>
                    <p className="text-gray-400">Click &quot;Sync Salesforce&quot; to import your tasks</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </OnboardingGuard>
    </AuthGuard>
  );
}
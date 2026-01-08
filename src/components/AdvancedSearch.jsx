import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter, Star } from 'lucide-react';

export default function AdvancedSearch({ 
  searchTerm, 
  onSearchChange,
  taskType,
  onTaskTypeChange,
  status,
  onStatusChange,
  showFavorites,
  onFavoritesToggle,
  dateRange,
  onDateRangeChange,
  selectedTags,
  onTagToggle,
  availableTags,
  onClearFilters
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = [
    taskType !== 'all',
    status !== 'all',
    showFavorites,
    dateRange !== 'all',
    selectedTags.length > 0
  ].filter(Boolean).length;

  return (
    <Card className="bg-[#1A1A1A] border-gray-800 mb-6">
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, content, or keywords..."
              className="bg-[#0D0D0D] border-gray-700 text-white pl-10"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-gray-700 text-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-purple-600 text-white">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              className="text-gray-400 hover:text-white"
            >
              Clear All
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Content Type</label>
              <Select value={taskType} onValueChange={onTaskTypeChange}>
                <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-800">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="content_generation">Content Generation</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="translation">Translation</SelectItem>
                  <SelectItem value="summarization">Summarization</SelectItem>
                  <SelectItem value="creative_writing">Creative Writing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Status</label>
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-800">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={onDateRangeChange}>
                <SelectTrigger className="bg-[#0D0D0D] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-gray-800">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Quick Filters</label>
              <Button
                variant="outline"
                onClick={onFavoritesToggle}
                className={`w-full ${showFavorites ? 'bg-yellow-600/20 border-yellow-600 text-yellow-400' : 'border-gray-700 text-gray-400'}`}
              >
                <Star className={`w-4 h-4 mr-2 ${showFavorites ? 'fill-yellow-400' : ''}`} />
                Favorites Only
              </Button>
            </div>
          </div>
        )}

        {availableTags.length > 0 && (
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Filter by Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  className={`cursor-pointer transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
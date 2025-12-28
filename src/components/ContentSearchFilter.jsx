import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Star } from 'lucide-react';

export default function ContentSearchFilter({ onFilterChange, selectedTags, onTagToggle, allTags }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [taskType, setTaskType] = useState('all');
  const [status, setStatus] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onFilterChange({ searchTerm: value, taskType, status, showFavorites });
  };

  const handleTaskTypeChange = (value) => {
    setTaskType(value);
    onFilterChange({ searchTerm, taskType: value, status, showFavorites });
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    onFilterChange({ searchTerm, taskType, status: value, showFavorites });
  };

  const handleFavoritesToggle = () => {
    const newValue = !showFavorites;
    setShowFavorites(newValue);
    onFilterChange({ searchTerm, taskType, status, showFavorites: newValue });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTaskType('all');
    setStatus('all');
    setShowFavorites(false);
    onFilterChange({ searchTerm: '', taskType: 'all', status: 'all', showFavorites: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search content..."
            className="pl-10 bg-[#0D0D0D] border-gray-700 text-white"
          />
        </div>
        <Button
          variant={showFavorites ? "default" : "outline"}
          size="icon"
          onClick={handleFavoritesToggle}
          className={showFavorites ? "bg-yellow-500 hover:bg-yellow-600" : "border-gray-700"}
        >
          <Star className={`w-4 h-4 ${showFavorites ? 'fill-white' : ''}`} />
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={taskType} onValueChange={handleTaskTypeChange}>
          <SelectTrigger className="w-48 bg-[#0D0D0D] border-gray-700 text-white">
            <SelectValue placeholder="Task Type" />
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

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40 bg-[#0D0D0D] border-gray-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-gray-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {(searchTerm || taskType !== 'all' || status !== 'all' || showFavorites) && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="border-gray-700">
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400">Tags:</span>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer ${
                selectedTags.includes(tag)
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'border-gray-700 hover:bg-gray-800'
              }`}
              onClick={() => onTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
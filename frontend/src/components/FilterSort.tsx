import { useState } from "react";
import { Check, ChevronDown, ArrowUpDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

type FilterCriteria = {
  sort: string;
  category: string;
};

interface FilterSortProps {
  onChange: (criteria: FilterCriteria) => void;
  currentFilters: FilterCriteria;
}

const FilterSort = ({ onChange, currentFilters }: FilterSortProps) => {
  const categories = [
    { label: "All Categories", value: "all" },
    { label: "AI & Machine Learning", value: "ai-ml" },
    { label: "Developer Tools", value: "dev-tools" },
    { label: "Productivity", value: "productivity" },
    { label: "Design Tools", value: "design" },
    { label: "Automation", value: "automation" }
  ];

  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Most Upvotes", value: "upvotes" },
    { label: "Most Wanted", value: "wants" }
  ];

  const getSortLabel = (value: string) => {
    return sortOptions.find(option => option.value === value)?.label || "Sort";
  };

  const getCategoryLabel = (value: string) => {
    return categories.find(category => category.value === value)?.label || "All Categories";
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <ArrowUpDown size={14} />
            <span>{getSortLabel(currentFilters.sort)}</span>
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup 
            value={currentFilters.sort}
            onValueChange={(value) => onChange({...currentFilters, sort: value})}
          >
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Category dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <span>Category</span>
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filter Category</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup 
            value={currentFilters.category}
            onValueChange={(value) => onChange({...currentFilters, category: value})}
          >
            {categories.map((category) => (
              <DropdownMenuRadioItem key={category.value} value={category.value}>
                {category.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Show active filters */}
      {currentFilters.category !== 'all' && (
        <Badge variant="secondary" className="gap-1 h-7 px-2">
          {getCategoryLabel(currentFilters.category)}
          <button 
            onClick={() => onChange({...currentFilters, category: 'all'})}
            className="ml-1 hover:text-destructive transition-colors"
          >
            ×
          </button>
        </Badge>
      )}
    </div>
  );
};

export default FilterSort;

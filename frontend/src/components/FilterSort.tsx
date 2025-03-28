import { motion } from "framer-motion";
import { Filter, ArrowDownAZ, ArrowUpAZ, ThumbsUp, Briefcase } from "lucide-react"; // Changed Star to Briefcase
import { SortOption, FilterOption } from "../hooks/useToolData";

type FilterSortProps = {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  filterOption: FilterOption;
  onFilterChange: (option: FilterOption) => void;
};

const FilterSort = ({ 
  sortOption, 
  onSortChange, 
  filterOption, 
  onFilterChange 
}: FilterSortProps) => {
  return (
    <motion.div
      className="w-full glass-card rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="space-y-2 w-full sm:w-auto">
        <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
          <Filter size={14} />
          <span>Filter by</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              filterOption === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All Ideas
          </button>
          <button
            onClick={() => onFilterChange("most-wanted")}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              filterOption === "most-wanted"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Most Wanted
          </button>
          <button
            onClick={() => onFilterChange("trending")}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              filterOption === "trending"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Trending
          </button>
        </div>
      </div>
      
      <div className="space-y-2 w-full sm:w-auto">
        <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
          <ArrowDownAZ size={14} />
          <span>Sort by</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSortChange("newest")}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              sortOption === "newest"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => onSortChange("oldest")}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              sortOption === "oldest"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Oldest
          </button>
          <button
            onClick={() => onSortChange("most-upvotes")}
            className={`px-3 py-1.5 text-xs rounded-full flex items-center space-x-1 transition-colors ${
              sortOption === "most-upvotes"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <ThumbsUp size={12} />
            <span>Upvotes</span>
          </button>
          <button
            onClick={() => onSortChange("most-wants")}
            className={`px-3 py-1.5 text-xs rounded-full flex items-center space-x-1 transition-colors ${
              sortOption === "most-wants"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Briefcase size={12} /> {/* Changed from Star to Briefcase */}
            <span>Funds</span> {/* Optionally changed label from "Wants" to "Funds" */}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterSort;


import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Info } from "lucide-react";

type SideColumnProps = {
  position: "left" | "right";
};

const SideColumn = ({ position }: SideColumnProps) => {
  // Different content based on the column position
  const isLeft = position === "left";
  
  return (
    <motion.div
      className="w-full h-full space-y-6"
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {isLeft ? (
        // Left column content
        <>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-primary/10 mr-3">
                <Lightbulb size={18} className="text-primary" />
              </div>
              <h3 className="font-medium">How It Works</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex">
                <span className="mr-2 font-medium text-foreground">1.</span>
                Submit your tool idea
              </li>
              <li className="flex">
                <span className="mr-2 font-medium text-foreground">2.</span>
                Get upvotes and wants from the community
              </li>
              <li className="flex">
                <span className="mr-2 font-medium text-foreground">3.</span>
                The best ideas rise to the top
              </li>
            </ul>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-primary/10 mr-3">
                <Info size={18} className="text-primary" />
              </div>
              <h3 className="font-medium">What Makes a Good Idea</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Clear problem it solves</li>
              <li>• Specific target audience</li>
              <li>• Unique from existing tools</li>
              <li>• Technically feasible</li>
            </ul>
          </div>
        </>
      ) : (
        // Right column content
        <>
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-primary/10 mr-3">
                <TrendingUp size={18} className="text-primary" />
              </div>
              <h3 className="font-medium">Trending Categories</h3>
            </div>
            <div className="space-y-2">
              {[
                { name: "AI & Machine Learning", count: 37 },
                { name: "Developer Tools", count: 24 },
                { name: "Productivity", count: 19 },
                { name: "Design Tools", count: 15 },
                { name: "Automation", count: 12 }
              ].map((category, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-border/40 last:border-0"
                >
                  <span className="text-sm">{category.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-primary/10 mr-3">
                <Info size={18} className="text-primary" />
              </div>
              <h3 className="font-medium">About Tooltopia</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Tooltopia is a community-driven platform where developers and users can share tool ideas, 
              vote on the ones they want, and help shape the future of development tools.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Have feedback? We'd love to hear it!
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SideColumn;

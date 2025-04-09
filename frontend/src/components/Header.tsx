import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface HeaderProps {
  onSubmitClick?: () => void;
}

const Header = ({ onSubmitClick }: HeaderProps) => {
  return (
    <motion.header 
      className="w-full py-8 px-6 flex flex-col items-center justify-center text-center relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute top-4 right-4 sm:right-6 lg:right-8 lg:top-6 hidden sm:block">
        <Button 
          onClick={onSubmitClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Submit Idea
        </Button>
      </div>
      <span className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
        Discover & Vote
      </span>
      <h1 className="text-4xl sm:text-5xl font-bold mt-2 tracking-tight">
        Tool<span className="subtle-text-gradient">topia</span>
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Share your tool ideas, vote for the best ones, and help developers build what you need.
      </p>
    </motion.header>
  );
};

export default Header;

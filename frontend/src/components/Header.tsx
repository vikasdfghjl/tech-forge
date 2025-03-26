
import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.header 
      className="w-full py-8 px-6 flex flex-col items-center justify-center text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
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

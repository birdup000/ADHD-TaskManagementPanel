import { motion } from 'framer-motion';

const DragPlaceholder = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: 1, 
        height: 60,
      }}
      exit={{ opacity: 0, height: 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
      className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-800/50"
    />
  );
};

export default DragPlaceholder;
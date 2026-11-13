import { motion } from "framer-motion";
import { categories } from "../../data/menuData";
import '../../styles/CategorySection.css';

export default function CategorySection({ activeCategory, onSelect }) {
  return (
    <>
      <div className="category-container">
        {categories.map((cat, i) => {
          const isActive = activeCategory === cat.id;

          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelect(cat.id)}
              className={`category-btn ${isActive ? "active" : ""}`}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-text">{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

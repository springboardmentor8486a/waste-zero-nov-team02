import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PageHeader({ title, subtitle, textColor, size }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-12 relative z-[60]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className={`${size || 'text-3xl'} font-normal ${textColor || 'text-black'} tracking-tight drop-shadow-sm`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`${textColor ? textColor + '/80' : 'text-gray-600'} mt-2 font-normal text-lg`}>
            {subtitle}
          </p>
        )}
      </motion.div>
    </div>
  );
}

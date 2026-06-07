import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ icon: Icon, title, subtitle, accent = '#F58A9C' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center mb-10"
  >
    {Icon && (
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
           style={{ background: `${accent}22`, color: accent }}>
        <Icon size={28} />
      </div>
    )}
    <h1 className="title-script text-5xl md:text-6xl mb-2">{title}</h1>
    {subtitle && <p className="text-mauve-500 max-w-xl mx-auto handwritten text-xl">{subtitle}</p>}
  </motion.div>
);

export default PageHeader;

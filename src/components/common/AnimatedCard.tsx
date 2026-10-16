import React from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';

export const cardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const cardItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    filter: 'blur(2px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.21, 0.45, 0.27, 0.9],
    },
  },
};

export interface AnimatedCardContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export const AnimatedCardContainer: React.FC<AnimatedCardContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.08,
  delayChildren = 0.04,
  ...props
}) => {
  const customContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={customContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  index?: number;
  enableHoverEffect?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> & {
  Container: React.FC<AnimatedCardContainerProps>;
} = ({
  children,
  className = '',
  index,
  enableHoverEffect = true,
  variants,
  initial,
  animate,
  transition,
  ...props
}) => {
  // If an index is explicitly passed without a parent container, compute smooth stagger
  const standaloneTransition =
    index !== undefined
      ? {
          duration: 0.45,
          delay: index * 0.06,
          ease: [0.21, 0.45, 0.27, 0.9] as [number, number, number, number],
        }
      : undefined;

  return (
    <motion.div
      variants={variants || cardItemVariants}
      initial={initial}
      animate={animate}
      transition={transition || standaloneTransition}
      whileHover={
        enableHoverEffect
          ? {
              y: -2,
              transition: { duration: 0.2, ease: 'easeOut' },
            }
          : undefined
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

AnimatedCard.Container = AnimatedCardContainer;

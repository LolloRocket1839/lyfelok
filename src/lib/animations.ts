
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

export const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    scale: 0.9, 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

export const slideInRight = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

export const modalAnimation = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  }
};

export const overlayAnimation = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

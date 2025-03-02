
import React from 'react';

export interface CategoryRule {
  category: string;
  patterns: RegExp[];
  iconType: string;
}

export interface CategorizationResult {
  category: string;
  icon: React.ReactElement;
}

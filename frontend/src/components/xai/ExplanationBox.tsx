'use client';

import React from 'react';

interface ExplanationBoxProps {
  title?: string;
  children?: React.ReactNode;
}

export default function ExplanationBox({ title = 'Explanation', children }: ExplanationBoxProps) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="text-sm text-muted-foreground">{children ?? 'Explanation content restored as placeholder.'}</div>
    </div>
  );
}

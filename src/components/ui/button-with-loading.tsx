
'use client';

import React, { useState } from 'react';
import { useLoading } from '@/contexts/loading-context';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ButtonWithLoadingProps extends ButtonProps {
  onClick: () => Promise<any>;
}

export function ButtonWithLoading({
  onClick,
  children,
  ...props
}: ButtonWithLoadingProps) {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    
    // Set loading state immediately
    setIsButtonLoading(true);
    showLoading();

    // Defer the async operation to allow UI to update
    setTimeout(async () => {
      try {
        await onClick();
      } finally {
        setIsButtonLoading(false);
        hideLoading();
      }
    }, 0);
  };

  return (
    <Button onClick={handleClick} disabled={isButtonLoading || props.disabled} {...props}>
      {isButtonLoading ? (
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement...
        </>
      ) : (
        children
      )}
    </Button>
  );
}

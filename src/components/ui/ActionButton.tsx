import Link from 'next/link';
import { Button } from './button';
import * as React from 'react';

interface ActionButtonProps {
  variant: 'edit' | 'delete' | 'approve' | 'view';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  href?: string;
  className?: string;
}

export function ActionButton({ variant, onClick, href, className = '' }: ActionButtonProps) {
  const getButtonProps = () => {
    switch (variant) {
      case 'edit':
        return {
          text: 'Edit',
          buttonVariant: 'outline' as const,
          className: `text-indigo-600 hover:text-indigo-900 border-indigo-600 hover:bg-indigo-50 ${className}`
        };
      case 'delete':
        return {
          text: 'Delete',
          buttonVariant: 'destructive' as const,
          className: `bg-red-500 hover:bg-red-600 text-white ${className}`
        };
      case 'approve':
        return {
          text: 'Approve',
          buttonVariant: 'outline' as const,
          className: `bg-green-500 hover:bg-green-600 text-white ${className}`
        };
      case 'view':
        return {
          text: 'View',
          buttonVariant: 'outline' as const,
          className: `text-blue-600 hover:text-blue-900 border-blue-600 hover:bg-blue-50 ${className}`
        };
      default:
        return {
          text: variant,
          buttonVariant: 'outline' as const,
          className
        };
    }
  };

  const { text, buttonVariant, className: buttonClassName } = getButtonProps();

  if (href) {
    return (
      <Link href={href} className={`inline-block mx-1 ${buttonClassName}`}>
        <Button variant={buttonVariant} size="sm" className={buttonClassName}>
          {text}
        </Button>
      </Link>
    );
  }

  return (
    <Button 
      variant={buttonVariant} 
      size="sm" 
      onClick={onClick} 
      className={`mx-1 ${buttonClassName}`}
    >
      {text}
    </Button>
  );
}
import type { HTMLAttributes, ReactNode } from 'react'

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'aside' | 'article'
  strong?: boolean
  children: ReactNode
}

export function GlassPanel({ as = 'div', strong, className = '', children, ...rest }: GlassPanelProps) {
  const Tag = as
  return (
    <Tag className={`${strong ? 'glass-strong' : 'glass'} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

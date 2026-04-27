import { clsx } from 'clsx'

type Variant = 'blue' | 'green' | 'red' | 'gray' | 'orange' | 'purple'

const variants: Record<Variant, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-slate-100 text-slate-600',
  orange: 'bg-orange-100 text-orange-700',
  purple: 'bg-purple-100 text-purple-700',
}

export default function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: Variant }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant])}>
      {children}
    </span>
  )
}

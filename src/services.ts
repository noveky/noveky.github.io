export type ServiceStatus = 'checking' | 'available' | 'unavailable'

export interface HostedService {
  name: string
  description: string
  href: string
  path: string
  localPort: number
  icon: 'fireworks' | 'flower' | 'novchat'
}

export const hostedServices: HostedService[] = [
  {
    name: 'Fireworks Studio',
    description: 'Compose a firework, tune its flight, and export the result.',
    href: '/fireworks/',
    path: '/fireworks/',
    localPort: 15174,
    icon: 'fireworks',
  },
  {
    name: 'Camellia',
    description: 'Store, relate, and compute over structured information in a source-first environment.',
    href: '/camellia/',
    path: '/camellia/',
    localPort: 15175,
    icon: 'flower',
  },
  {
    name: 'NovChat',
    description: 'Talk with AI models in a clean, focused interface.',
    href: '/novchat/',
    path: '/novchat/',
    localPort: 15176,
    icon: 'novchat',
  },
]

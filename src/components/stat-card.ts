/**
 * ═══════════════════════════════════════════════════════════
 *  Stats Card — Animated metric display
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color?: string;
}

export const StatCard = defineComponent<StatCardProps>('StatCard', (props) =>
  h('div', {
    class: 'stat-card',
    style: { '--accent': props.color || 'var(--primary)' } as any,
  },
    h('div', { class: 'stat-header' },
      h('span', { class: 'stat-icon' }, props.icon),
      props.change
        ? h('span', {
            class: `stat-change ${props.trend || 'neutral'}`,
          }, `${props.trend === 'up' ? '↑' : props.trend === 'down' ? '↓' : '→'} ${props.change}`)
        : null,
    ),
    h('div', { class: 'stat-value' }, String(props.value)),
    h('div', { class: 'stat-label' }, props.label),
    h('div', { class: 'stat-glow' }),
  )
);

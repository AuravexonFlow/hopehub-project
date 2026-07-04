/**
 * ═══════════════════════════════════════════════════════════
 *  Dashboard Page — Main overview with stats and activity
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { StatCard } from '../components/stat-card';
import { dataStore, type Project, type Task } from '../stores/data-store';
import { currentUser } from '../services/auth';

export const DashboardPage = defineComponent('DashboardPage', () => {
  const user = currentUser.peek();
  const state = dataStore.get.peek();
  const projects = state.projects;
  const tasks = state.tasks;

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent').length;

  return h('div', { class: 'page page-dashboard' },
    // Welcome Header
    h('div', { class: 'page-header' },
      h('div', null,
        h('h1', { class: 'page-title' },
          'Welcome back, ',
          h('span', { class: 'gradient-text' },
            user?.user_metadata?.full_name || 'Commander',
          ),
        ),
        h('p', { class: 'page-subtitle' }, 'Here\'s your mission briefing for today.'),
      ),
      h('div', { class: 'header-actions' },
        h('button', { class: 'btn btn-primary btn-glow' },
          '+ New Project',
        ),
      ),
    ),

    // Stats Grid
    h('div', { class: 'stats-grid' },
      h(StatCard, {
        icon: '◈',
        label: 'Active Projects',
        value: activeProjects,
        change: '+12%',
        trend: 'up',
        color: '#e02040',
      }),
      h(StatCard, {
        icon: '◉',
        label: 'Completed Tasks',
        value: completedTasks,
        change: '+8%',
        trend: 'up',
        color: '#00e878',
      }),
      h(StatCard, {
        icon: '◎',
        label: 'Pending Tasks',
        value: pendingTasks,
        change: '-3%',
        trend: 'down',
        color: '#ffaa00',
      }),
      h(StatCard, {
        icon: '⚡',
        label: 'Urgent Items',
        value: urgentTasks,
        change: urgentTasks > 0 ? 'Needs attention' : 'All clear',
        trend: urgentTasks > 0 ? 'up' : 'neutral',
        color: '#ff2244',
      }),
    ),

    // Content Grid
    h('div', { class: 'dashboard-grid' },

      // Recent Activity
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' },
            h('span', { class: 'card-icon' }, '📡'),
            'Recent Activity',
          ),
          h('button', { class: 'btn btn-sm btn-ghost' }, 'View All'),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'activity-list' },
            createActivityItem('🟢', 'Project "Nebula" created', '2 minutes ago'),
            createActivityItem('🔵', 'Task "Design system" moved to Review', '15 minutes ago'),
            createActivityItem('🟡', 'New comment on "API Integration"', '1 hour ago'),
            createActivityItem('🟣', 'Team member joined "Quantum"', '3 hours ago'),
            createActivityItem('🟢', 'Sprint completed successfully', 'Yesterday'),
          ),
        ),
      ),

      // Projects Overview
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' },
            h('span', { class: 'card-icon' }, '◈'),
            'Projects',
          ),
          h('button', { class: 'btn btn-sm btn-ghost' }, 'Manage'),
        ),
        h('div', { class: 'card-body' },
          projects.length > 0
            ? h('div', { class: 'project-list' },
                ...projects.slice(0, 5).map((project) =>
                  h('div', { class: 'project-item' },
                    h('div', {
                      class: 'project-color',
                      style: { backgroundColor: project.color },
                    }),
                    h('div', { class: 'project-info' },
                      h('span', { class: 'project-name' }, project.name),
                      h('span', { class: 'project-status' }, project.status),
                    ),
                    h('div', { class: 'project-progress' },
                      h('div', {
                        class: 'progress-bar',
                        style: { width: `${Math.random() * 100}%` },
                      }),
                    ),
                  ),
                ),
              )
            : h('div', { class: 'empty-state' },
                h('div', { class: 'empty-icon' }, '◈'),
                h('p', null, 'No projects yet. Create your first project to get started.'),
                h('button', { class: 'btn btn-primary btn-sm' }, '+ Create Project'),
              ),
        ),
      ),

      // Quick Actions
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' },
            h('span', { class: 'card-icon' }, '⚡'),
            'Quick Actions',
          ),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'quick-actions' },
            createQuickAction('📝', 'New Task', 'Create a new task'),
            createQuickAction('◈', 'New Project', 'Start a new project'),
            createQuickAction('👥', 'Invite Team', 'Add team members'),
            createQuickAction('📊', 'View Reports', 'Analytics dashboard'),
          ),
        ),
      ),

      // System Status
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' },
            h('span', { class: 'card-icon' }, '⬢'),
            'System Status',
          ),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'status-list' },
            createStatusItem('Supabase Connection', 'online', 'Connected'),
            createStatusItem('Realtime Service', 'online', 'Active'),
            createStatusItem('Auth Provider', 'online', 'Operational'),
            createStatusItem('Storage', 'online', '12.4 GB used'),
          ),
        ),
      ),
    ),
  );
});

function createActivityItem(icon: string, text: string, time: string) {
  return h('div', { class: 'activity-item' },
    h('span', { class: 'activity-icon' }, icon),
    h('div', { class: 'activity-content' },
      h('span', { class: 'activity-text' }, text),
      h('span', { class: 'activity-time' }, time),
    ),
  );
}

function createQuickAction(icon: string, label: string, desc: string) {
  return h('button', { class: 'quick-action' },
    h('span', { class: 'quick-action-icon' }, icon),
    h('span', { class: 'quick-action-label' }, label),
    h('span', { class: 'quick-action-desc' }, desc),
  );
}

function createStatusItem(label: string, status: string, detail: string) {
  return h('div', { class: 'status-item' },
    h('div', { class: 'status-indicator' },
      h('span', { class: `status-dot ${status}` }),
      h('span', null, label),
    ),
    h('span', { class: 'status-detail' }, detail),
  );
}

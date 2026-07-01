/**
 * ═══════════════════════════════════════════════════════════
 *  Analytics Page — Charts, metrics, and insights
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { dataStore } from '../stores/data-store';

export const AnalyticsPage = defineComponent('AnalyticsPage', () => {
  const state = dataStore.get.peek();
  const tasks = state.tasks;
  const projects = state.projects;

  // Calculate metrics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const priorityBreakdown = {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  const statusBreakdown = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: doneTasks,
  };

  return h('div', { class: 'page page-analytics' },
    h('div', { class: 'page-header' },
      h('div', null,
        h('h1', { class: 'page-title' },
          h('span', { class: 'section-icon' }, '◎'),
          ' Analytics',
        ),
        h('p', { class: 'page-subtitle' }, 'Insights and metrics for your workspace.'),
      ),
    ),

    // Overview Cards
    h('div', { class: 'analytics-overview' },
      h('div', { class: 'metric-card' },
        h('div', { class: 'metric-ring' },
          h('svg', { viewBox: '0 0 100 100', class: 'ring-svg' },
            h('circle', {
              cx: '50', cy: '50', r: '40',
              class: 'ring-bg',
            }),
            h('circle', {
              cx: '50', cy: '50', r: '40',
              class: 'ring-fill',
              style: {
                strokeDasharray: `${completionRate * 2.51} 251`,
              },
            }),
          ),
          h('span', { class: 'ring-value' }, `${completionRate}%`),
        ),
        h('span', { class: 'metric-label' }, 'Completion Rate'),
      ),

      h('div', { class: 'metric-card' },
        h('div', { class: 'metric-big' }, String(totalTasks)),
        h('span', { class: 'metric-label' }, 'Total Tasks'),
      ),

      h('div', { class: 'metric-card' },
        h('div', { class: 'metric-big' }, String(projects.length)),
        h('span', { class: 'metric-label' }, 'Active Projects'),
      ),

      h('div', { class: 'metric-card' },
        h('div', { class: 'metric-big' }, String(priorityBreakdown.urgent)),
        h('span', { class: 'metric-label' }, 'Urgent Items'),
      ),
    ),

    // Charts Grid
    h('div', { class: 'charts-grid' },

      // Status Breakdown — Bar Chart
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' }, 'Task Status Distribution'),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'bar-chart' },
            ...Object.entries(statusBreakdown).map(([key, count]) =>
              h('div', { class: 'bar-group' },
                h('div', { class: 'bar-track' },
                  h('div', {
                    class: `bar-fill bar-${key}`,
                    style: {
                      height: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%`,
                    },
                  }),
                ),
                h('span', { class: 'bar-label' }, key.replace('_', ' ')),
                h('span', { class: 'bar-value' }, String(count)),
              ),
            ),
          ),
        ),
      ),

      // Priority Breakdown
      h('div', { class: 'card' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' }, 'Priority Distribution'),
        ),
        h('div', { class: 'card-body' },
          h('div', { class: 'priority-chart' },
            ...Object.entries(priorityBreakdown).map(([key, count]) =>
              h('div', { class: 'priority-row' },
                h('span', { class: `priority-label priority-${key}` }, key),
                h('div', { class: 'priority-bar-track' },
                  h('div', {
                    class: `priority-bar-fill priority-${key}`,
                    style: {
                      width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%`,
                    },
                  }),
                ),
                h('span', { class: 'priority-count' }, String(count)),
              ),
            ),
          ),
        ),
      ),

      // Project Progress
      h('div', { class: 'card card-wide' },
        h('div', { class: 'card-header' },
          h('h3', { class: 'card-title' }, 'Project Progress'),
        ),
        h('div', { class: 'card-body' },
          projects.length > 0
            ? h('div', { class: 'progress-list' },
                ...projects.map((project) => {
                  const projectTasks = tasks.filter((t) => t.project_id === project.id);
                  const done = projectTasks.filter((t) => t.status === 'done').length;
                  const progress = projectTasks.length > 0
                    ? Math.round((done / projectTasks.length) * 100)
                    : 0;

                  return h('div', { class: 'progress-row' },
                    h('div', {
                      class: 'progress-color',
                      style: { backgroundColor: project.color },
                    }),
                    h('span', { class: 'progress-name' }, project.name),
                    h('div', { class: 'progress-bar-track' },
                      h('div', {
                        class: 'progress-bar-fill',
                        style: { width: `${progress}%` },
                      }),
                    ),
                    h('span', { class: 'progress-pct' }, `${progress}%`),
                    h('span', { class: 'progress-tasks' },
                      `${done}/${projectTasks.length} tasks`,
                    ),
                  );
                }),
              )
            : h('div', { class: 'empty-state' },
                h('p', null, 'No projects to analyze yet.'),
              ),
        ),
      ),
    ),
  );
});

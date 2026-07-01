/**
 * ═══════════════════════════════════════════════════════════
 *  Tasks Page — Task management with Kanban board
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { dataStore, type Task } from '../stores/data-store';
import { success, error as showError } from '../services/toast';
import { Modal, useModal } from '../components/modal';

const COLUMNS = [
  { key: 'todo', label: 'To Do', icon: '○', color: '#888' },
  { key: 'in_progress', label: 'In Progress', icon: '◑', color: '#00f5ff' },
  { key: 'review', label: 'Review', icon: '◕', color: '#ffaa00' },
  { key: 'done', label: 'Done', icon: '●', color: '#00ff88' },
] as const;

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export const TasksPage = defineComponent('TasksPage', () => {
  const state = dataStore.get.peek();
  const showCreate = useModal();
  const newTitle = createSignal('');
  const newDesc = createSignal('');
  const newPriority = createSignal<Task['priority']>('medium');
  const newProject = createSignal(state.selectedProject || '');
  const viewMode = createSignal<'kanban' | 'list'>('kanban');

  const handleCreate = () => {
    if (!newTitle.peek().trim()) {
      showError('Validation Error', 'Task title is required.');
      return;
    }

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTitle.peek(),
      description: newDesc.peek(),
      status: 'todo',
      priority: newPriority.peek(),
      project_id: newProject.peek() || 'default',
      assigned_to: null,
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dataStore.actions.addTask(task);
    success('Task Created', `"${task.title}" has been added.`);
    newTitle.set('');
    newDesc.set('');
    showCreate.close();
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    dataStore.actions.updateTask(taskId, {
      status: newStatus,
      updated_at: new Date().toISOString(),
    });
  };

  const handleDelete = (taskId: string) => {
    dataStore.actions.removeTask(taskId);
    success('Task Deleted', 'The task has been removed.');
  };

  return h('div', { class: 'page page-tasks' },
    h('div', { class: 'page-header' },
      h('div', null,
        h('h1', { class: 'page-title' },
          h('span', { class: 'section-icon' }, '◉'),
          ' Tasks',
        ),
        h('p', { class: 'page-subtitle' },
          `${state.tasks.length} tasks across ${state.projects.length} projects`,
        ),
      ),
      h('div', { class: 'header-actions' },
        h('div', { class: 'view-toggle' },
          h('button', {
            class: `btn btn-sm ${viewMode.peek() === 'kanban' ? 'btn-primary' : 'btn-ghost'}`,
            onClick: () => viewMode.set('kanban'),
          }, '▥ Kanban'),
          h('button', {
            class: `btn btn-sm ${viewMode.peek() === 'list' ? 'btn-primary' : 'btn-ghost'}`,
            onClick: () => viewMode.set('list'),
          }, '☰ List'),
        ),
        h('button', {
          class: 'btn btn-primary btn-glow',
          onClick: () => showCreate.open(),
        }, '+ New Task'),
      ),
    ),

    // Kanban View
    viewMode.peek() === 'kanban'
      ? h('div', { class: 'kanban-board' },
          ...COLUMNS.map((col) => {
            const columnTasks = state.tasks.filter((t) => t.status === col.key);
            return h('div', { class: 'kanban-column' },
              h('div', { class: 'kanban-header' },
                h('span', { class: 'kanban-icon', style: { color: col.color } }, col.icon),
                h('span', { class: 'kanban-title' }, col.label),
                h('span', { class: 'kanban-count' }, String(columnTasks.length)),
              ),
              h('div', { class: 'kanban-cards' },
                ...columnTasks.map((task) =>
                  h('div', {
                    class: `task-card priority-${task.priority}`,
                    draggable: 'true',
                  },
                    h('div', { class: 'task-card-header' },
                      h('span', { class: `priority-dot priority-${task.priority}` }),
                      h('span', { class: `badge badge-${task.priority}` }, task.priority),
                    ),
                    h('h4', { class: 'task-title' }, task.title),
                    task.description
                      ? h('p', { class: 'task-desc' }, task.description)
                      : null,
                    h('div', { class: 'task-card-footer' },
                      h('div', { class: 'task-actions' },
                        ...COLUMNS.filter((c) => c.key !== task.status).map((c) =>
                          h('button', {
                            class: 'btn btn-xs btn-ghost',
                            title: `Move to ${c.label}`,
                            onClick: () => handleStatusChange(task.id, c.key as Task['status']),
                          }, c.icon),
                        ),
                      ),
                      h('button', {
                        class: 'btn btn-xs btn-ghost danger',
                        onClick: () => handleDelete(task.id),
                      }, '✕'),
                    ),
                  ),
                ),
                columnTasks.length === 0
                  ? h('div', { class: 'kanban-empty' }, 'No tasks')
                  : null,
              ),
            );
          }),
        )
      : // List View
        h('div', { class: 'task-list' },
          ...state.tasks.map((task) =>
            h('div', { class: `task-list-item priority-${task.priority}` },
              h('div', { class: 'task-list-left' },
                h('span', { class: `priority-dot priority-${task.priority}` }),
                h('div', null,
                  h('span', { class: 'task-list-title' }, task.title),
                  h('span', { class: 'task-list-desc' }, task.description),
                ),
              ),
              h('div', { class: 'task-list-right' },
                h('span', { class: `badge badge-${task.status}` }, task.status),
                h('span', { class: `badge badge-${task.priority}` }, task.priority),
                h('button', {
                  class: 'btn btn-xs btn-ghost danger',
                  onClick: () => handleDelete(task.id),
                }, '✕'),
              ),
            ),
          ),
        ),

    // Create Modal
    h(Modal, {
      open: showCreate.isOpen.peek(),
      title: 'Create New Task',
      onClose: () => showCreate.close(),
    },
      h('div', { class: 'form-group' },
        h('label', { class: 'form-label' }, 'Task Title'),
        h('input', {
          type: 'text',
          class: 'form-input',
          placeholder: 'What needs to be done?',
          value: newTitle.peek(),
          onInput: (e: Event) => newTitle.set((e.target as HTMLInputElement).value),
        }),
      ),
      h('div', { class: 'form-group' },
        h('label', { class: 'form-label' }, 'Description'),
        h('textarea', {
          class: 'form-input form-textarea',
          placeholder: 'Add details...',
          value: newDesc.peek(),
          onInput: (e: Event) => newDesc.set((e.target as HTMLTextAreaElement).value),
        }),
      ),
      h('div', { class: 'form-group' },
        h('label', { class: 'form-label' }, 'Priority'),
        h('div', { class: 'priority-selector' },
          ...PRIORITIES.map((p) =>
            h('button', {
              class: `priority-btn priority-${p} ${newPriority.peek() === p ? 'active' : ''}`,
              onClick: () => newPriority.set(p),
            }, p),
          ),
        ),
      ),
      state.projects.length > 0
        ? h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Project'),
            h('select', {
              class: 'form-input',
              onChange: (e: Event) => newProject.set((e.target as HTMLSelectElement).value),
            },
              h('option', { value: '' }, 'Select project'),
              ...state.projects.map((p) =>
                h('option', { value: p.id }, p.name),
              ),
            ),
          )
        : null,
      h('div', { class: 'form-actions' },
        h('button', {
          class: 'btn btn-ghost',
          onClick: () => showCreate.close(),
        }, 'Cancel'),
        h('button', {
          class: 'btn btn-primary btn-glow',
          onClick: handleCreate,
        }, 'Create Task'),
      ),
    ),
  );
});

/**
 * ═══════════════════════════════════════════════════════════
 *  Projects Page — Project management with CRUD
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { dataStore, type Project } from '../stores/data-store';
import { create as createRecord, fetchAll, update, remove } from '../services/database';
import { success, error as showError } from '../services/toast';
import { Modal, useModal } from '../components/modal';

export const ProjectsPage = defineComponent('ProjectsPage', () => {
  const state = dataStore.get.peek();
  const showCreate = useModal();
  const newName = createSignal('');
  const newDesc = createSignal('');
  const newColor = createSignal('#e02040');

  const handleCreate = async () => {
    if (!newName.peek().trim()) {
      showError('Validation Error', 'Project name is required.');
      return;
    }

    const project: Project = {
      id: crypto.randomUUID(),
      name: newName.peek(),
      description: newDesc.peek(),
      status: 'active',
      color: newColor.peek(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: 'local',
    };

    try {
      // Try Supabase first, fall back to local
      try {
        await createRecord('projects', project);
      } catch {
        // Supabase not configured, use local
      }
      dataStore.actions.addProject(project);
      success('Project Created', `"${project.name}" has been created.`);
      newName.set('');
      newDesc.set('');
      showCreate.close();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      try {
        await remove('projects', id);
      } catch {
        // Supabase not configured
      }
      dataStore.actions.removeProject(id);
      success('Project Deleted', 'The project has been removed.');
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  return h('div', { class: 'page page-projects' },
    h('div', { class: 'page-header' },
      h('div', null,
        h('h1', { class: 'page-title' },
          h('span', { class: 'section-icon' }, '◈'),
          ' Projects',
        ),
        h('p', { class: 'page-subtitle' }, 'Manage your projects and workspaces.'),
      ),
      h('div', { class: 'header-actions' },
        h('div', { class: 'view-toggle' },
          h('button', {
            class: `btn btn-sm ${state.viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`,
            onClick: () => dataStore.actions.setViewMode('grid'),
          }, '▦'),
          h('button', {
            class: `btn btn-sm ${state.viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`,
            onClick: () => dataStore.actions.setViewMode('list'),
          }, '☰'),
          h('button', {
            class: `btn btn-sm ${state.viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`,
            onClick: () => dataStore.actions.setViewMode('kanban'),
          }, '▥'),
        ),
        h('button', {
          class: 'btn btn-primary btn-glow',
          onClick: () => showCreate.open(),
        }, '+ New Project'),
      ),
    ),

    // Projects Grid
    state.projects.length > 0
      ? h('div', { class: `projects-${state.viewMode}` },
          ...state.projects.map((project) =>
            h('div', { class: 'project-card' },
              h('div', { class: 'project-card-header' },
                h('div', {
                  class: 'project-card-color',
                  style: { backgroundColor: project.color },
                }),
                h('div', { class: 'project-card-actions' },
                  h('button', {
                    class: 'btn btn-sm btn-ghost',
                    onClick: () => handleDelete(project.id),
                  }, '🗑'),
                ),
              ),
              h('h3', { class: 'project-card-title' }, project.name),
              h('p', { class: 'project-card-desc' }, project.description || 'No description'),
              h('div', { class: 'project-card-footer' },
                h('span', {
                  class: `badge badge-${project.status}`,
                }, project.status),
                h('span', { class: 'project-card-date' },
                  new Date(project.created_at).toLocaleDateString(),
                ),
              ),
              h('div', { class: 'card-glow' }),
            ),
          ),
        )
      : h('div', { class: 'empty-state large' },
          h('div', { class: 'empty-icon' }, '◈'),
          h('h3', null, 'No Projects Yet'),
          h('p', null, 'Create your first project to start organizing your work.'),
          h('button', {
            class: 'btn btn-primary btn-glow',
            onClick: () => showCreate.open(),
          }, '+ Create First Project'),
        ),

    // Create Modal
    h(Modal, {
      open: showCreate.isOpen.peek(),
      title: 'Create New Project',
      onClose: () => showCreate.close(),
    },
      h('div', { class: 'form-group' },
        h('label', { class: 'form-label' }, 'Project Name'),
        h('input', {
          type: 'text',
          class: 'form-input',
          placeholder: 'Enter project name',
          value: newName.peek(),
          onInput: (e: Event) => newName.set((e.target as HTMLInputElement).value),
        }),
      ),
      h('div', { class: 'form-group' },
        h('label', { class: 'form-label' }, 'Description'),
        h('textarea', {
          class: 'form-input form-textarea',
          placeholder: 'Describe your project...',
          value: newDesc.peek(),
          onInput: (e: Event) => newDesc.set((e.target as HTMLTextAreaElement).value),
        }),
      ),
      h('div', { class: 'form-group' },
        h('label', { class: 'form-label' }, 'Color'),
        h('div', { class: 'color-picker' },
          ...['#e02040', '#0090d0', '#00e878', '#ffaa00', '#ff2244', '#00b0f0'].map((c) =>
            h('button', {
              class: `color-swatch ${newColor.peek() === c ? 'active' : ''}`,
              style: { backgroundColor: c },
              onClick: () => newColor.set(c),
            }),
          ),
        ),
      ),
      h('div', { class: 'form-actions' },
        h('button', {
          class: 'btn btn-ghost',
          onClick: () => showCreate.close(),
        }, 'Cancel'),
        h('button', {
          class: 'btn btn-primary btn-glow',
          onClick: handleCreate,
        }, 'Create Project'),
      ),
    ),
  );
});

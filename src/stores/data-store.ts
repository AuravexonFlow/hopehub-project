/**
 * ═══════════════════════════════════════════════════════════
 *  Data Store — Projects, tasks, and workspace data
 * ═══════════════════════════════════════════════════════════
 */

import { createStore } from '../vortex/store';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'draft';
  color: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_id: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export const dataStore = createStore('data', {
  state: {
    projects: [] as Project[],
    tasks: [] as Task[],
    selectedProject: null as string | null,
    searchQuery: '',
    viewMode: 'grid' as 'grid' | 'list' | 'kanban',
  },
  actions: {
    setProjects(state, projects: Project[]) {
      return { projects };
    },
    addProject(state, project: Project) {
      return { projects: [...state.projects, project] };
    },
    updateProject(state, id: string, updates: Partial<Project>) {
      return {
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      };
    },
    removeProject(state, id: string) {
      return {
        projects: state.projects.filter((p) => p.id !== id),
        tasks: state.tasks.filter((t) => t.project_id !== id),
        selectedProject: state.selectedProject === id ? null : state.selectedProject,
      };
    },
    setTasks(state, tasks: Task[]) {
      return { tasks };
    },
    addTask(state, task: Task) {
      return { tasks: [...state.tasks, task] };
    },
    updateTask(state, id: string, updates: Partial<Task>) {
      return {
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      };
    },
    removeTask(state, id: string) {
      return { tasks: state.tasks.filter((t) => t.id !== id) };
    },
    selectProject(state, id: string | null) {
      return { selectedProject: id };
    },
    setSearch(state, query: string) {
      return { searchQuery: query };
    },
    setViewMode(state, mode: 'grid' | 'list' | 'kanban') {
      return { viewMode: mode };
    },
  },
  persist: 'hope-hub-data',
});

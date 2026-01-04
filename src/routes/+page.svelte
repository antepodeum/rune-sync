<script lang="ts">
	import { lfSync } from '$lib/drivers/localForage.js';
	import { fly, slide } from 'svelte/transition';

	// Page data from server
	let { data } = $props();

	// --- Types ---
	interface Todo {
		id: number;
		text: string;
		completed: boolean;
	}

	interface Note {
		id: number;
		title: string;
		content: string;
		timestamp: number;
	}

	// --- State Management ---

	// User Profile
	const userProfile = lfSync('user-profile', {
		name: 'John Doe',
		avatar: '👤',
		bio: 'Svelte enthusiast building reactive apps.',
		location: 'San Francisco'
	});

	// Todos
	const todosState = lfSync('todos', {
		items: [
			{ id: 1, text: 'Try Rune Sync', completed: true },
			{ id: 2, text: 'Star the repo', completed: false }
		]
	} as { items: Todo[] });

	// Notes
	const notesState = lfSync('notes', {
		items: [
			{
				id: 1,
				title: 'Persistence Magic',
				content: 'Data remains even after you close the tab.',
				timestamp: Date.now()
			}
		]
	} as { items: Note[] });

	// App Settings
	const appSettings = lfSync('app-settings', {
		theme: 'system', // 'light', 'dark', 'system'
		language: 'en',
		fontSize: 100 // percentage
	});

	// Debounced Settings Demo (500ms delay)
	const debouncedSettings = lfSync(
		'app-settings',
		{
			theme: 'system', // 'light', 'dark', 'system'
			language: 'en',
			fontSize: 100 // percentage
		},
		{ debounce: 500 }
	);

	let uiState = lfSync(
		'ui-state',
		{
			newTodoText: '',
			newNoteTitle: '',
			newNoteContent: '',
			activeTab: 'todos' as 'profile' | 'todos' | 'notes' | 'settings' | 'playground',
			mobileMenuOpen: false
		},
		{ debounce: 500, doNotSubscribe: true } // Do not subscribe to changes in other tabs
	);

	// Counter Demo
	const counter = lfSync('counter', { value: 0 });

	// Debounced Counter Demo (1000ms delay)
	const debouncedCounter = lfSync('counter', { value: 0 }, { debounce: 1000 });

	// Throttled Counter Demo (500ms delay)
	const throttledCounter = lfSync('counter', { value: 0 }, { throttle: 500 });

	// --- Derived & Helpers ---

	// Theme handling
	$effect(() => {
		if (typeof document === 'undefined') return;

		const root = document.documentElement;
		const isDark =
			appSettings.theme === 'dark' ||
			(appSettings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

		root.setAttribute('data-theme', isDark ? 'dark' : 'light');
		root.style.fontSize = `${appSettings.fontSize}%`;
	});

	// Actions
	function addTodo() {
		if (!uiState.newTodoText.trim()) return;

		todosState.items.push({
			id: Date.now(),
			text: uiState.newTodoText,
			completed: false
		});
		uiState.newTodoText = '';
	}

	function toggleTodo(todo: Todo) {
		todo.completed = !todo.completed;
	}

	function deleteTodo(id: number) {
		todosState.items = todosState.items.filter((t) => t.id !== id);
	}

	function addNote() {
		if (!uiState.newNoteTitle.trim() || !uiState.newNoteContent.trim()) return;

		notesState.items.unshift({
			id: Date.now(),
			title: uiState.newNoteTitle,
			content: uiState.newNoteContent,
			timestamp: Date.now()
		});
		uiState.newNoteTitle = '';
		uiState.newNoteContent = '';
	}

	function deleteNote(id: number) {
		notesState.items = notesState.items.filter((n) => n.id !== id);
	}

	// Translations
	const translations = {
		en: {
			title: 'Rune Sync',
			subtitle: 'Reactive state synchronization demo',
			tabs: {
				profile: 'Profile',
				todos: 'Tasks',
				notes: 'Notes',
				settings: 'Config',
				playground: 'Demo'
			},
			placeholders: {
				todo: 'What needs to be done?',
				title: 'Title',
				content: 'Write something...'
			},
			labels: {
				add: 'Add',
				theme: 'Theme',
				lang: 'Language',
				name: 'Name',
				location: 'Location',
				bio: 'Bio',
				synced: 'Synced',
				noActiveTasks: 'No active tasks',
				appearance: 'Appearance',
				zoom: 'Zoom',
				localization: 'Localization',
				persistentCounter: 'Persistent Counter',
				reset: 'Reset',
				auto: 'Auto'
			}
		},
		ru: {
			title: 'Rune Sync',
			subtitle: 'Демонстрация реактивной синхронизации',
			tabs: {
				profile: 'Профиль',
				todos: 'Задачи',
				notes: 'Заметки',
				settings: 'Конфиг',
				playground: 'Демо'
			},
			placeholders: {
				todo: 'Что нужно сделать?',
				title: 'Заголовок',
				content: 'Напишите что-нибудь...'
			},
			labels: {
				add: 'Добавить',
				theme: 'Тема',
				lang: 'Язык',
				name: 'Имя',
				location: 'Местоположение',
				bio: 'Био',
				synced: 'Синхронизировано',
				noActiveTasks: 'Нет активных задач',
				appearance: 'Внешний вид',
				zoom: 'Масштаб',
				localization: 'Локализация',
				persistentCounter: 'Постоянный счетчик',
				reset: 'Сброс',
				auto: 'Авто'
			}
		},
		es: {
			title: 'Rune Sync',
			subtitle: 'Demostración de sincronización reactiva',
			tabs: {
				profile: 'Perfil',
				todos: 'Tareas',
				notes: 'Notas',
				settings: 'Ajustes',
				playground: 'Demo'
			},
			placeholders: { todo: '¿Qué hay que hacer?', title: 'Título', content: 'Escribe algo...' },
			labels: {
				add: 'Añadir',
				theme: 'Tema',
				lang: 'Idioma',
				name: 'Nombre',
				location: 'Ubicación',
				bio: 'Biografía',
				synced: 'Sincronizado',
				noActiveTasks: 'No hay tareas activas',
				appearance: 'Apariencia',
				zoom: 'Zoom',
				localization: 'Localización',
				persistentCounter: 'Contador persistente',
				reset: 'Reiniciar',
				auto: 'Auto'
			}
		}
	};

	const t = $derived(
		translations[appSettings.language as keyof typeof translations] || translations.en
	);
</script>

<svelte:head>
	<title>{t.title} Demo</title>
</svelte:head>

<div class="app-layout">
	<!-- Mobile overlay -->
	{#if uiState.mobileMenuOpen}
		<button
			class="mobile-overlay"
			onclick={() => (uiState.mobileMenuOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (uiState.mobileMenuOpen = false)}
			aria-label="Close menu"
			type="button"
		></button>
	{/if}

	<aside class="sidebar" class:mobile-open={uiState.mobileMenuOpen}>
		<div class="brand">
			<div class="logo-icon">⚡</div>
			<div>
				<h1>{t.title}</h1>
				<span class="version">{data.version}</span>
			</div>
		</div>

		<nav>
			{#each Object.entries(t.tabs) as [key, label]}
				<button
					class:active={uiState.activeTab === key}
					onclick={() => {
						uiState.activeTab = key as any;
						uiState.mobileMenuOpen = false;
					}}
				>
					<span class="nav-indicator"></span>
					{label}
				</button>
			{/each}
		</nav>

		<div class="footer-status">
			<div class="status-dot pulse"></div>
			<span>{t.labels.synced}</span>
		</div>
	</aside>

	<main class="main-content">
		<header class="top-bar">
			<div class="header-left">
				<button
					class="mobile-menu-toggle"
					onclick={() => (uiState.mobileMenuOpen = !uiState.mobileMenuOpen)}
					aria-label="Toggle menu"
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M3 12h18M3 6h18M3 18h18" />
					</svg>
				</button>
				<h2>{t.tabs[uiState.activeTab]}</h2>
			</div>
			<div class="user-chip">
				<span class="avatar-small">{userProfile.avatar}</span>
				<span class="username">{userProfile.name}</span>
			</div>
		</header>

		<div class="content-wrapper">
			{#if uiState.activeTab === 'profile'}
				<div class="card profile-card" in:fly={{ y: 20, duration: 400 }}>
					<div class="avatar-uploader">
						<div class="avatar-xl">{userProfile.avatar}</div>
						<div class="avatar-actions">
							<button class="emoji-btn" onclick={() => (userProfile.avatar = '👨‍💻')}>👨‍💻</button>
							<button class="emoji-btn" onclick={() => (userProfile.avatar = '🚀')}>🚀</button>
							<button class="emoji-btn" onclick={() => (userProfile.avatar = '👾')}>👾</button>
						</div>
					</div>
					<div class="form-grid">
						<div class="input-group">
							<label for="profile-name">{t.labels.name}</label>
							<input id="profile-name" type="text" bind:value={userProfile.name} />
						</div>
						<div class="input-group">
							<label for="profile-location">{t.labels.location}</label>
							<input id="profile-location" type="text" bind:value={userProfile.location} />
						</div>
						<div class="input-group full-width">
							<label for="profile-bio">{t.labels.bio}</label>
							<textarea id="profile-bio" bind:value={userProfile.bio} rows="3"></textarea>
						</div>
					</div>
				</div>
			{/if}

			{#if uiState.activeTab === 'todos'}
				<div class="todo-container" in:fly={{ y: 20, duration: 400 }}>
					<div class="input-row">
						<input
							type="text"
							placeholder={t.placeholders.todo}
							bind:value={uiState.newTodoText}
							onkeydown={(e) => e.key === 'Enter' && addTodo()}
						/>
						<button class="btn-primary btn-circle" onclick={addTodo} aria-label="Add todo">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"><path d="M12 5v14M5 12h14" /></svg
							>
						</button>
					</div>

					<div class="list">
						{#each todosState.items as todo (todo.id)}
							<div
								class="list-item"
								class:completed={todo.completed}
								transition:slide={{ duration: 300, axis: 'y' }}
							>
								<label class="checkbox-wrapper">
									<input
										type="checkbox"
										checked={todo.completed}
										onchange={() => toggleTodo(todo)}
									/>
									<span class="checkmark"></span>
								</label>
								<span class="item-text">{todo.text}</span>
								<button class="btn-icon delete" onclick={() => deleteTodo(todo.id)}>×</button>
							</div>
						{/each}

						{#if todosState.items.length === 0}
							<div class="empty-state">{t.labels.noActiveTasks}</div>
						{/if}
					</div>
				</div>
			{/if}

			{#if uiState.activeTab === 'notes'}
				<div class="notes-layout" in:fly={{ y: 20, duration: 400 }}>
					<div class="card create-note">
						<input
							class="title-input"
							placeholder={t.placeholders.title}
							bind:value={uiState.newNoteTitle}
						/>
						<textarea
							class="content-input"
							placeholder={t.placeholders.content}
							bind:value={uiState.newNoteContent}
						></textarea>
						<div class="actions">
							<button class="btn-primary" onclick={addNote}>{t.labels.add}</button>
						</div>
					</div>

					<div class="notes-grid">
						{#each notesState.items as note (note.id)}
							<div class="card note-card" transition:fly={{ y: 20, duration: 300 }}>
								<div class="note-header">
									<h3>{note.title}</h3>
									<button class="btn-icon" onclick={() => deleteNote(note.id)}>×</button>
								</div>
								<p>{note.content}</p>
								<small class="timestamp">{new Date(note.timestamp).toLocaleDateString()}</small>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if uiState.activeTab === 'settings'}
				<div class="settings-container" in:fly={{ y: 20, duration: 400 }}>
					<div class="card setting-group">
						<h3>{t.labels.appearance}</h3>
						<div class="setting-row">
							<span>{t.labels.theme}</span>
							<div class="segmented-control">
								<button
									class:active={appSettings.theme === 'light'}
									onclick={() => (appSettings.theme = 'light')}>☀️</button
								>
								<button
									class:active={appSettings.theme === 'system'}
									onclick={() => (appSettings.theme = 'system')}>{t.labels.auto}</button
								>
								<button
									class:active={appSettings.theme === 'dark'}
									onclick={() => (appSettings.theme = 'dark')}>🌙</button
								>
							</div>
						</div>
						<div class="setting-row">
							<span>{t.labels.zoom} ({appSettings.fontSize}%)</span>
							<input type="range" min="80" max="120" step="5" bind:value={appSettings.fontSize} />
						</div>
					</div>

					<div class="card setting-group">
						<h3>{t.labels.localization}</h3>
						<div class="setting-row">
							<span>{t.labels.lang}</span>
							<select bind:value={appSettings.language}>
								<option value="en">English</option>
								<option value="ru">Русский</option>
								<option value="es">Español</option>
							</select>
						</div>
					</div>
				</div>
			{/if}

			{#if uiState.activeTab === 'playground'}
				<div class="playground-container" in:fly={{ y: 20, duration: 400 }}>
					<div class="card counter-card">
						<span class="counter-label">{t.labels.persistentCounter}</span>
						<div class="counter-value">{counter.value}</div>
						<div class="counter-actions">
							<button class="icon-btn" onclick={() => counter.value--}>−</button>
							<button class="pill-btn" onclick={() => (counter.value = 0)}>{t.labels.reset}</button>
							<button class="icon-btn" onclick={() => counter.value++}>+</button>
						</div>
					</div>

					<div class="card counter-card">
						<span class="counter-label">Debounced Counter (1000ms delay)</span>
						<div class="counter-value">{debouncedCounter.value}</div>
						<div class="counter-actions">
							<button class="icon-btn" onclick={() => debouncedCounter.value--}>−</button>
							<button class="pill-btn" onclick={() => (debouncedCounter.value = 0)}
								>{t.labels.reset}</button
							>
							<button class="icon-btn" onclick={() => debouncedCounter.value++}>+</button>
						</div>
						<div class="debounce-info">
							<small>Updates are delayed by 1 second</small>
						</div>
					</div>

					<div class="card counter-card">
						<span class="counter-label">Throttled Counter (500ms delay)</span>
						<div class="counter-value">{throttledCounter.value}</div>
						<div class="counter-actions">
							<button class="icon-btn" onclick={() => throttledCounter.value--}>−</button>
							<button class="pill-btn" onclick={() => (throttledCounter.value = 0)}
								>{t.labels.reset}</button
							>
							<button class="icon-btn" onclick={() => throttledCounter.value++}>+</button>
						</div>
						<div class="debounce-info">
							<small>Updates are throttled once per 500ms</small>
						</div>
					</div>

					<div class="card settings-card">
						<span class="counter-label">Debounced Settings (500ms delay)</span>
						<div class="settings-grid">
							<div class="setting-item">
								<label for="debounced-language">Language</label>
								<select id="debounced-language" bind:value={debouncedSettings.language}>
									<option value="en">English</option>
									<option value="ru">Русский</option>
									<option value="es">Español</option>
								</select>
							</div>
							<div class="setting-item">
								<label for="debounced-fontsize">Font Size</label>
								<input
									id="debounced-fontsize"
									type="range"
									min="80"
									max="120"
									bind:value={debouncedSettings.fontSize}
								/>
								<span class="range-value">{debouncedSettings.fontSize}%</span>
							</div>
						</div>
						<div class="debounce-info">
							<small>Settings are saved after 500ms of inactivity</small>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	/* --- Design Tokens --- */
	:root {
		color-scheme: light;
		--bg-app: #f1f5f9;
		--bg-surface: #ffffff;
		--bg-sidebar: #ffffff;
		--text-main: #0f172a;
		--text-muted: #64748b;
		--primary: #3b82f6;
		--primary-glow: rgba(59, 130, 246, 0.15);
		--border: #e2e8f0;

		--radius-lg: 16px;
		--radius-md: 10px;
		--radius-full: 9999px;

		--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05);
		--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
	}

	:global([data-theme='dark']) {
		color-scheme: dark; /* Важно для нативных контролов */
		--bg-app: #0f172a;
		--bg-surface: #1e293b;
		--bg-sidebar: #0f172a;
		--text-main: #f1f5f9;
		--text-muted: #94a3b8;
		--primary: #60a5fa;
		--primary-glow: rgba(96, 165, 250, 0.2);
		--border: #334155;
	}

	:global(body) {
		margin: 0;
		font-family: var(--font-sans);
		background: var(--bg-app);
		color: var(--text-main);
		transition:
			background 0.3s ease,
			color 0.3s ease;
		overflow: hidden;
	}

	:global(*) {
		box-sizing: border-box;
	}

	/* --- Layout --- */
	.app-layout {
		display: grid;
		grid-template-columns: 260px 1fr;
		height: 100vh;
	}

	/* --- Sidebar --- */
	.sidebar {
		background: var(--bg-sidebar);
		border-right: 1px solid var(--border);
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		z-index: 10;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo-icon {
		width: 36px;
		height: 36px;
		background: linear-gradient(135deg, var(--primary), #8b5cf6);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.2rem;
		box-shadow: 0 4px 10px var(--primary-glow);
	}

	.brand h1 {
		font-size: 1.1rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.version {
		font-size: 0.75rem;
		color: var(--text-muted);
		background: var(--bg-app);
		border: 1px solid var(--border);
		padding: 2px 6px;
		border-radius: 4px;
	}

	nav {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	nav button {
		display: flex;
		align-items: center;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--text-muted);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		font-size: 0.95rem;
	}

	nav button:hover {
		background: var(--bg-app);
		color: var(--text-main);
	}

	nav button.active {
		background: var(--primary-glow);
		color: var(--primary);
	}

	.nav-indicator {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: currentColor;
		margin-right: 12px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	nav button.active .nav-indicator {
		opacity: 1;
	}

	.footer-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		background: #10b981;
		border-radius: 50%;
	}

	.pulse {
		animation: pulse 2s infinite;
	}
	@keyframes pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
		100% {
			opacity: 1;
		}
	}

	/* --- Main Content --- */
	.main-content {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
		background: var(--bg-app);
	}

	.top-bar {
		height: 70px;
		padding: 0 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		background: var(--bg-surface);
	}

	.top-bar h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}

	.user-chip {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		background: var(--bg-app);
		border-radius: 20px;
		border: 1px solid var(--border);
	}

	.content-wrapper {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
		max-width: 1000px;
		width: 100%;
		margin: 0 auto;
	}

	/* --- Generic Components --- */
	.card {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		padding: 1.5rem;
	}

	input[type='text'],
	textarea,
	select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--bg-app); /* Contextual background */
		color: var(--text-main); /* Ensure text is visible */
		font-family: inherit;
		transition: border-color 0.2s;
	}

	/* Ensure placeholder is visible but muted */
	::placeholder {
		color: var(--text-muted);
		opacity: 0.6;
	}

	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px var(--primary-glow);
	}

	.btn-primary {
		background: var(--primary);
		color: #ffffff; /* Always white for contrast on primary */
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: var(--radius-md);
		font-weight: 500;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: filter 0.2s;
	}

	.btn-primary:hover {
		filter: brightness(1.1);
	}
	.btn-circle {
		border-radius: 50%;
		width: 46px;
		height: 46px;
		padding: 0;
	}

	/* --- Specific Views --- */

	/* Profile */
	.profile-card {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}
	.avatar-uploader {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.avatar-xl {
		font-size: 4rem;
		width: 100px;
		height: 100px;
		background: var(--bg-app);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--border);
	}

	.emoji-btn {
		background: transparent;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
	}
	.emoji-btn:hover {
		background: var(--bg-app);
	}

	.form-grid {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.full-width {
		grid-column: span 2;
	}
	.input-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text-muted);
	}

	/* Todos */
	.todo-container {
		max-width: 600px;
		margin: 0 auto;
	}
	.input-row {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
	.input-row input {
		flex: 1;
		border-radius: 50px;
		padding-left: 1.5rem;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.list-item {
		display: flex;
		align-items: center;
		padding: 1rem;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		gap: 1rem;
	}

	.list-item.completed {
		opacity: 0.6;
	}
	.list-item.completed .item-text {
		text-decoration: line-through;
	}
	.empty-state {
		text-align: center;
		color: var(--text-muted);
		padding: 2rem;
		border: 2px dashed var(--border);
		border-radius: var(--radius-md);
	}

	/* Custom Checkbox */
	.checkbox-wrapper {
		position: relative;
		cursor: pointer;
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}
	.checkbox-wrapper input {
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}
	.checkmark {
		position: absolute;
		top: 0;
		left: 0;
		height: 20px;
		width: 20px;
		background-color: var(--bg-app);
		border: 2px solid var(--border);
		border-radius: 6px;
		transition: all 0.2s;
	}
	.checkbox-wrapper input:checked ~ .checkmark {
		background-color: var(--primary);
		border-color: var(--primary);
	}
	.checkmark:after {
		content: '';
		position: absolute;
		display: none;
		left: 6px;
		top: 2px;
		width: 4px;
		height: 8px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
	}
	.checkbox-wrapper input:checked ~ .checkmark:after {
		display: block;
	}

	.btn-icon {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		color: var(--text-muted);
		opacity: 0;
		transition: opacity 0.2s;
	}
	.list-item:hover .btn-icon,
	.note-card:hover .btn-icon {
		opacity: 1;
	}
	.btn-icon:hover {
		color: #ef4444;
	}

	/* Notes */
	.notes-layout {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.create-note {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.title-input {
		font-weight: 700;
		border: none;
		background: transparent;
		font-size: 1.1rem;
		padding: 0.5rem 0;
	}
	.content-input {
		border: none;
		background: transparent;
		resize: none;
		min-height: 80px;
		padding: 0.5rem 0;
	}

	/* Fix input visibility in Note Card for dark mode */
	.create-note .title-input:focus,
	.create-note .content-input:focus {
		box-shadow: none;
		border-bottom: 1px solid var(--primary);
		border-radius: 0;
	}

	.notes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}
	.note-card {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.note-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}
	.note-card h3 {
		margin: 0;
		font-size: 1rem;
	}
	.note-card p {
		color: var(--text-muted);
		font-size: 0.9rem;
		flex: 1;
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
	}
	.timestamp {
		display: block;
		margin-top: 1rem;
		font-size: 0.75rem;
		color: var(--text-muted);
		opacity: 0.7;
	}
	.note-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
		transition: all 0.2s;
	}

	/* Settings */
	.settings-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}
	.setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
	.setting-row:first-of-type {
		border-top: none;
		margin-top: 0;
		padding-top: 0;
	}

	.segmented-control {
		display: flex;
		background: var(--bg-app);
		padding: 4px;
		border-radius: 8px;
		border: 1px solid var(--border);
	}
	.segmented-control button {
		flex: 1;
		border: none;
		background: transparent;
		padding: 6px 12px;
		border-radius: 6px;
		cursor: pointer;
		color: var(--text-muted);
	}
	.segmented-control button.active {
		background: var(--bg-surface);
		color: var(--text-main);
		box-shadow: var(--shadow-sm);
	}

	/* Playground (Counter Fixes) */
	.playground-container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
	}
	.counter-card {
		text-align: center;
		min-width: 320px;
	}
	.counter-value {
		font-size: 4rem;
		font-weight: 800;
		color: var(--primary);
		margin: 1rem 0;
		font-variant-numeric: tabular-nums;
	}

	.counter-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		align-items: center;
	}

	.debounce-info {
		margin-top: 1rem;
		padding: 0.5rem;
		background: var(--bg-app);
		border-radius: var(--radius-md);
		color: var(--text-muted);
	}

	.settings-card {
		min-width: 400px;
		text-align: left;
	}

	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin: 1.5rem 0;
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.setting-item label {
		font-weight: 600;
		color: var(--text-main);
		font-size: 0.875rem;
	}

	.setting-item select,
	.setting-item input[type='range'] {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--bg-app);
		color: var(--text-main);
	}

	.setting-item input[type='range'] {
		padding: 0;
	}

	.setting-item .range-value {
		text-align: center;
		font-weight: 600;
		color: var(--primary);
		margin-top: 0.25rem;
	}

	/* Fixed Counter Buttons */
	.icon-btn {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: var(--bg-app);
		cursor: pointer;
		font-size: 1.5rem;
		color: var(--text-main);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.1s;
	}

	.pill-btn {
		height: 50px;
		padding: 0 2rem;
		border-radius: 25px; /* Pill shape */
		border: 1px solid var(--border);
		background: var(--bg-app);
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-main);
		transition: all 0.1s;
	}

	.icon-btn:hover,
	.pill-btn:hover {
		background: var(--bg-surface);
		border-color: var(--primary);
		color: var(--primary);
		transform: translateY(-1px);
	}
	.icon-btn:active,
	.pill-btn:active {
		transform: translateY(1px);
	}

	.mobile-menu-toggle {
		display: none;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.app-layout {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}

		.mobile-overlay {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			z-index: 20;
			backdrop-filter: blur(4px);
		}

		.sidebar {
			position: fixed;
			top: 0;
			left: -100%;
			width: 280px;
			height: 100vh;
			z-index: 30;
			transition: left 0.3s ease;
			box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
		}

		.sidebar.mobile-open {
			left: 0;
		}

		.main-content {
			height: 100vh;
		}

		.top-bar {
			padding: 0 1rem;
		}

		.header-left {
			display: flex;
			align-items: center;
			gap: 1rem;
		}

		.mobile-menu-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			border: none;
			background: transparent;
			border-radius: var(--radius-md);
			cursor: pointer;
			color: var(--text-main);
			transition: background 0.2s;
		}

		.mobile-menu-toggle:hover {
			background: var(--bg-app);
		}

		.content-wrapper {
			padding: 1rem;
		}

		.profile-card {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}

		.full-width {
			grid-column: auto;
		}

		.notes-grid {
			grid-template-columns: 1fr;
		}

		.todo-container,
		.settings-container {
			max-width: 100%;
		}

		.input-row {
			flex-direction: column;
			gap: 0.5rem;
		}

		.input-row input {
			border-radius: var(--radius-md);
			padding-left: 0.75rem;
		}

		.btn-circle {
			width: 100%;
			height: auto;
			border-radius: var(--radius-md);
			padding: 0.75rem;
		}

		.playground-container {
			padding: 1rem;
		}

		.counter-card,
		.settings-card {
			min-width: auto;
			width: 100%;
		}

		.counter-value {
			font-size: 3rem;
		}

		.setting-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.segmented-control {
			width: 100%;
		}

		.user-chip .username {
			display: none;
		}

		.avatar-small {
			font-size: 1.2rem;
		}
	}

	@media (max-width: 480px) {
		.sidebar {
			width: 100%;
			left: -100%;
		}

		.sidebar.mobile-open {
			left: 0;
		}

		.content-wrapper {
			padding: 0.75rem;
		}

		.top-bar {
			height: 60px;
			padding: 0 0.75rem;
		}

		.brand {
			padding: 1rem;
		}

		.logo-icon {
			width: 32px;
			height: 32px;
			font-size: 1rem;
		}

		.brand h1 {
			font-size: 1rem;
		}

		nav button {
			padding: 1rem;
			font-size: 1rem;
		}

		.counter-value {
			font-size: 2.5rem;
		}

		.avatar-xl {
			width: 80px;
			height: 80px;
			font-size: 3rem;
		}
	}
</style>

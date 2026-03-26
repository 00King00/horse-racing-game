# Claude Code — Гайд для Full-Stack JS/Vue розробника

## 1. Claude Chat vs Claude Code — в чому різниця?

| | Claude Chat (claude.ai) | Claude Code |
|---|---|---|
| **Що це** | Веб-чат, Q&A | Agentic інструмент розробки |
| **Читає файли** | ❌ | ✅ |
| **Виконує команди** | ❌ | ✅ |
| **Редагує код** | ❌ | ✅ |
| **Розуміє проект** | ❌ | ✅ (git, структура, залежності) |
| **Підходить для** | Питання, пояснення | Розробка, рефакторинг, тести |

**Claude Code** — це agentic цикл: спостерігає → планує → діє → перевіряє.
Він реально відкриває твої файли, запускає `npm test`, робить коміти.

---

## 2. VS Code Extension vs CLI

### VS Code Extension (рекомендований для щоденної роботи)
- Візуальні side-by-side diffs прямо в редакторі
- Кілька розмов у вкладках — переключайся між задачами
- `Option+K` (Mac) / `Alt+K` (Win) — згадати виділений код у чаті
- `/mcp` — управління MCP серверами без виходу з IDE
- Перегляд планів у markdown перед виконанням

### CLI (для автоматизації та скриптів)
```bash
# Headless режим
cat error.log | claude "знайди причину помилки"

# Паралельні агенти
claude --worktree

# CI/CD інтеграція
claude --print "review PR changes" --output-format json
```

**Обидва шарять**: налаштування, сесії, MCP сервери, агентів.

---

## 3. MCP Сервери (розширення можливостей Claude)

MCP (Model Context Protocol) — це "плагіни" що дають Claude доступ до зовнішніх інструментів.

### Підключення

```bash
# Playwright — автоматизовані тести у реальному браузері
claude mcp add --transport stdio playwright npx -y @playwright/mcp@latest

# GitHub — PRs, issues, commits, дифи
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

Або через `/mcp` у VS Code Extension чаті.

### Конфігурація (`.claude/mcp.json` для проекту)

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

### Що дає Playwright MCP для Vue розробника
- Claude відкриває реальний браузер і тестує твої компоненти
- Робить скріншоти, перевіряє DOM, кліка на елементи
- Пише Playwright тести на основі реальної поведінки
- Ловить баги які статичний аналіз пропускає

```
Запусти dev сервер і протестуй форму логіну в браузері
```

---

## 4. Skills / Slash Commands

Skills — це багаторазові workflow що ти викликаєш через `/`.

### Вбудовані корисні skills

| Команда | Що робить |
|---|---|
| `/simplify` | Аналізує код на якість, спрощує, виправляє |
| `/batch <задача>` | Виконує масові зміни паралельно (5-30 файлів) |
| `/debug` | Діагностика поточної сесії Claude Code |
| `/loop 5m <задача>` | Повторює задачу кожні 5 хвилин |

### Створення власного skill

`.claude/skills/vue-component/SKILL.md`:
```yaml
---
name: vue-component
description: Створює Vue 3 компонент за специфікацією
---

Створи Vue 3 компонент для: $ARGUMENTS

Вимоги:
- Composition API з <script setup>
- TypeScript
- Props з типами
- Emit events якщо потрібно
- Базові стилі scoped
- Unit тест з Vitest
```

Виклик: `/vue-component кнопка з лічильником кліків`

---

## 5. AI Агенти

### Subagents — спеціалізовані ізольовані агенти

`.claude/agents/code-reviewer.md`:
```yaml
---
name: code-reviewer
description: Експерт з code review. Перевіряє якість, безпеку, продуктивність Vue коду.
tools: Read, Grep, Glob, Bash
model: sonnet
---

Ти senior Vue розробник. Перевіряй:
- Composition API best practices
- Реактивність (ref vs reactive, watchEffect)
- Витоки пам'яті (незачищені listeners)
- XSS вразливості в шаблонах
- Продуктивність (v-if vs v-show, key в v-for)

Групуй по severity: Критично → Попередження → Пропозиції
```

Виклик:
```
@"code-reviewer (agent)" перевір зміни в src/components/
```

### Агенти для Vue/JS розробки — ідеї

```
.claude/agents/
├── code-reviewer.md     # Code review з Vue best practices
├── test-writer.md       # Пише Vitest/Playwright тести
├── api-designer.md      # Проектує REST/GraphQL API
└── pr-reviewer.md       # Ревʼю GitHub PR через MCP
```

---

## 6. CLAUDE.md — контекст проекту

Створи `CLAUDE.md` у корені проекту — Claude читає його автоматично:

```markdown
# Horse Racing Game

## Tech Stack
- Frontend: Vue 3, Composition API, Vite
- Backend: Node.js / Express (або інше)
- Тести: Vitest (unit), Playwright (e2e)
- Пакетний менеджер: npm

## Структура
- `src/components/` — Vue компоненти (PascalCase)
- `src/composables/` — Composables (use-префікс)
- `src/stores/` — Pinia stores
- `tests/` — тести

## Команди
- `npm run dev` — запуск dev сервера
- `npm run test` — запуск тестів
- `npm run build` — білд

## Конвенції
- Composition API з <script setup>
- TypeScript скрізь де можливо
- Компоненти іменуються PascalCase
```

---

## 7. Типові сценарії використання

### Написання тестів з Playwright MCP
```
Підключись до dev сервера localhost:5173, відкрий браузер,
перевір що форма реєстрації працює, і напиши Playwright тест
```

### Code review через GitHub MCP
```
Відкрий мій останній PR на GitHub і зроби детальний code review
з фокусом на Vue best practices
```

### Масовий рефакторинг
```
/batch переведи всі компоненти в src/components/ з Options API на Composition API
```

### Дебаг з реальним браузером
```
В Playwright відкрий localhost:5173/dashboard, зроби скріншот
і поясни чому layout зламаний
```

---

## 8. Швидкий старт

```bash
# 1. Встанови Claude Code CLI
npm install -g @anthropic-ai/claude-code

# 2. Або встанови VS Code Extension
# Extensions → шукай "Claude Code"

# 3. Підключи MCP сервери
claude mcp add --transport stdio playwright npx -y @playwright/mcp@latest
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# 4. Створи CLAUDE.md з контекстом проекту

# 5. Запусти сесію
claude
```

---

## Корисні посилання

- [Claude Code документація](https://docs.anthropic.com/claude-code)
- [MCP сервери (офіційний реєстр)](https://github.com/modelcontextprotocol/servers)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [GitHub MCP](https://github.com/github/github-mcp-server)

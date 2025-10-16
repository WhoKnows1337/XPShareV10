# MCP Server Configuration Guide

## ✅ Successful Setup (Oktober 2025)

### Working MCP Servers
- **browsermcp**: Frontend testing
- **serena**: Code navigation & editing
- **supabase**: Database operations
- **exa**: AI-powered search
- **linear-server**: Issue tracking
- **github**: Version control
- **vibe-check**: Metacognitive oversight
- **semgrep**: Security scanning
- **v0**: UI generation (neu hinzugefügt)

## 🔧 How to Add MCP Servers in Claude Code

### ❌ NICHT verwenden:
- Manuelle `.mcp.json` Bearbeitung im Projektverzeichnis → wird ignoriert!
- `~/.config/claude-code/mcp.json` → funktioniert nicht zuverlässig

### ✅ RICHTIGE Methode: `claude` CLI

```bash
# MCP Server hinzufügen (stdio)
claude mcp add --transport stdio <name> <command> -- [args]

# Mit Environment Variables
claude mcp add --transport stdio <name> <command> -- [args] --env KEY=value

# Beispiel v0:
claude mcp add --transport stdio v0 npx -- -y mcp-remote https://mcp.v0.dev --header "Authorization: Bearer ${V0_API_KEY}" --env V0_API_KEY=<api-key>

# MCP Server auflisten
claude mcp list

# MCP Server entfernen
claude mcp remove <name>
```

## 📝 v0 Konfiguration Details

**API Key Format:** `v1:team_<team_id>:<secret>`

**Command:**
```bash
npx -y mcp-remote https://mcp.v0.dev --header "Authorization: Bearer ${V0_API_KEY}"
```

**Environment Variable:** `V0_API_KEY=<full-api-key>`

**Speicherort:** `/home/tom/.claude.json` (local scope, project-specific)

## 🔒 Security Notes

- `.mcp.json` ist in `.gitignore` (enthält API-Keys!)
- Bereits in Git-History vorhanden (Commit f394480) - Keys ggf. rotieren
- Sensitive Keys NIEMALS committen

## 🎯 Scopes

- `--scope local` (default): Project-specific, private
- `--scope project`: Shared via `.mcp.json`
- `--scope user`: Global, all projects

## 🧪 Testing

```bash
# Health check aller MCP Server
claude mcp list

# Sollte zeigen: ✓ Connected
```
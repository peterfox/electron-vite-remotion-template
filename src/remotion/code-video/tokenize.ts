import type { TokenizedLine, TokenizedToken } from "../../types/composition-script";

// ─── Theme palettes ───────────────────────────────────────────────────────────

type TokenKind =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "type"
  | "function"
  | "operator"
  | "default";

type ThemePalette = Record<TokenKind, string>;

const PALETTES: Record<string, ThemePalette> = {
  "github-dark": {
    keyword: "#FF7B72",
    string: "#A5D6FF",
    comment: "#8B949E",
    number: "#79C0FF",
    type: "#FFA657",
    function: "#D2A8FF",
    operator: "#FF7B72",
    default: "#E6EDF3",
  },
  dracula: {
    keyword: "#FF79C6",
    string: "#F1FA8C",
    comment: "#6272A4",
    number: "#BD93F9",
    type: "#8BE9FD",
    function: "#50FA7B",
    operator: "#FF79C6",
    default: "#F8F8F2",
  },
  nord: {
    keyword: "#81A1C1",
    string: "#A3BE8C",
    comment: "#616E88",
    number: "#B48EAD",
    type: "#8FBCBB",
    function: "#88C0D0",
    operator: "#81A1C1",
    default: "#D8DEE9",
  },
};

// ─── Keyword sets ─────────────────────────────────────────────────────────────

const TS_KEYWORDS = new Set([
  "async", "await", "break", "case", "catch", "class", "const", "continue",
  "default", "delete", "do", "else", "export", "extends", "finally", "for",
  "from", "function", "if", "implements", "import", "in", "instanceof",
  "interface", "let", "new", "null", "of", "override", "private", "protected",
  "public", "readonly", "return", "static", "super", "switch", "this", "throw",
  "try", "type", "typeof", "undefined", "var", "void", "while", "yield",
  "true", "false", "as", "satisfies", "declare", "abstract", "enum",
]);

const OPERATORS = new Set([
  "=>", "===", "!==", "==", "!=", ">=", "<=", "&&", "||", "??",
  "+=", "-=", "*=", "/=", "++", "--", "...",
]);

// ─── Tokenizer ────────────────────────────────────────────────────────────────

function tokenizeLine(line: string, palette: ThemePalette): TokenizedToken[] {
  const tokens: TokenizedToken[] = [];
  let i = 0;

  const push = (content: string, kind: TokenKind) =>
    tokens.push({ content, color: palette[kind] });

  while (i < line.length) {
    // Line comment
    if (line[i] === "/" && line[i + 1] === "/") {
      push(line.slice(i), "comment");
      break;
    }

    // String / template literal
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\" ) { j += 2; continue; }
        if (line[j] === quote) { j++; break; }
        j++;
      }
      push(line.slice(i, j), "string");
      i = j;
      continue;
    }

    // Multi-char operators
    const op2 = line.slice(i, i + 3);
    const op1 = line.slice(i, i + 2);
    if (OPERATORS.has(op2)) { push(op2, "operator"); i += 3; continue; }
    if (OPERATORS.has(op1)) { push(op1, "operator"); i += 2; continue; }

    // Number
    if (/[0-9]/.test(line[i]) && (i === 0 || !/[a-zA-Z_$]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9._xXbBoO]/.test(line[j])) j++;
      push(line.slice(i, j), "number");
      i = j;
      continue;
    }

    // Word: keyword, type (PascalCase), function call, or identifier
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let kind: TokenKind;
      if (TS_KEYWORDS.has(word)) {
        kind = "keyword";
      } else if (/^[A-Z]/.test(word)) {
        kind = "type";
      } else if (line[j] === "(") {
        kind = "function";
      } else {
        kind = "default";
      }
      push(word, kind);
      i = j;
      continue;
    }

    // Everything else: single character
    const ch = line[i];
    const isOp = /[+\-*/%=<>!&|^~?:,;.[\]{}()]/.test(ch);
    push(ch, isOp ? "operator" : "default");
    i++;
  }

  return tokens;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function tokenizeCode(
  code: string,
  _language: string,
  theme: string = "github-dark"
): TokenizedLine[] {
  const palette = PALETTES[theme] ?? PALETTES["github-dark"];
  return code.split("\n").map((line) => tokenizeLine(line, palette));
}

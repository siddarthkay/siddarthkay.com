import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import nim from "react-syntax-highlighter/dist/esm/languages/prism/nim";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import objectivec from "react-syntax-highlighter/dist/esm/languages/prism/objectivec";
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby";

SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("go", go);
SyntaxHighlighter.registerLanguage("nim", nim);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("objc", objectivec);
SyntaxHighlighter.registerLanguage("ruby", ruby);

export default function CodeBlock({ language, children }: { language: string; children: string }) {
  return (
    <SyntaxHighlighter
      style={oneDark}
      language={language}
      wrapLongLines
      customStyle={{
        borderRadius: "6px",
        margin: 0,
        fontSize: "0.8125rem",
        lineHeight: "1.7",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
}

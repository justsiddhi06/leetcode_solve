import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  flowchart: { htmlLabels: false, useMaxWidth: true },
  themeVariables: {
    fontFamily: 'arial, sans-serif'
  }
});

export function MermaidDiagram({ code }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      // Sometimes the AI wraps the mermaid code in backticks even if asked not to
      let cleanedCode = code?.replace(/^```mermaid\s*/i, '').replace(/\s*```$/i, '').trim();
      
      // Fix common AI syntax casing mistakes (Mermaid is strictly case-sensitive)
      if (cleanedCode) {
        cleanedCode = cleanedCode.replace(/^(Graph|Flowchart)\s+/i, 'graph ');
      }

      if (!cleanedCode) return;

      try {
        setError(false);
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, cleanedCode);
        
        if (isMounted) {
          setSvg(svg);
        }
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        if (isMounted) {
          setError(true);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (!code) return null;

  if (error) {
    return (
      <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg text-red-200 text-sm flex items-center gap-2 overflow-x-auto whitespace-pre-wrap font-mono relative mt-2">
        <span className="font-semibold text-red-400 block mb-1">Failed to render diagram:</span>
        <pre>{code}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container flex justify-center p-6 bg-black/30 rounded-xl border border-white/10 overflow-x-auto shadow-inner my-4 min-h-[100px] items-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

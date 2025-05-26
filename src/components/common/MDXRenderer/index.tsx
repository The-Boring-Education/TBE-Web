import MarkdownIt from 'markdown-it';
import { MDXRendererProps } from '@/interfaces';
import { Fragment } from 'react';
import { useEffect, useRef } from 'react'

const MDXRenderer = ({ mdxSource, actions }: MDXRendererProps) => {
  const md = new MarkdownIt({
    html: true,
  });

  // Extend renderer rules to handle aside tag
  md.renderer.rules.html_block = (tokens: any[], idx: any) => {
    let content = tokens[idx].content;
    if (content.includes('<aside>')) {
      content = content.replace(
        /<aside>/g,
        '<aside class="md-aside flex gap-1 bg-accent rounded p-2 mb-2">'
      );
    }
    return content;
  };

  // Add class names to specific tags
  md.renderer.rules.heading_open = (tokens: any[], idx: number) => {
    const { tag } = tokens[idx];
    return `<${tag} class="md-1 mb-1">`;
  };

  md.renderer.rules.list_open = () => {
    return `<ol class="md-list bg-red">`;
  };

  md.renderer.rules.paragraph_open = () => {
    return '<p class="mb-2">';
  };

  md.renderer.rules.link_open = (tokens: any, idx: any) => {
    const token = tokens[idx];
    const href = token.attrGet('href');
    if (href.includes('youtube.com') || href.includes('youtu.be')) {
      if (href.includes('list=')) {
        return `<a href=${href} target="_blank" class="text-primary underline strong-text">`;
      } else {
        let embedHref = href;
        if (href.includes('watch')) {
          const videoId = href.split('v=')[1].split('&')[0];
          embedHref = `https://www.youtube.com/embed/${videoId}`;
        }
        return `<iframe width="100%" height="550" class="rounded" src="${embedHref}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      }
    }

    return `<a href=${href} target="_blank" class="text-primary underline strong-text">`;
  };

  md.renderer.rules.link_block = (tokens: any, idx: any) => {
    const token = tokens[idx];
    const href = token.attrGet('href');

    return `<a href=${href} target="_blank">${href}</a>`;
  };
  
    md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]
    const lang = token.info.trim()
    const code = token.content

    return (
      `<div class="relative mb-4">` +
      `<pre class="bg-accent overflow-x-auto hover:bg-greyLight transition border px-2 py-1 rounded">` +
      `<code class="language-${lang}">${md.utils.escapeHtml(code)}</code>` +
      `</pre>` +
      `</div>`
    )
  }

  const mdxHTML = md.render(mdxSource);

  const containerRef = useRef<HTMLDivElement>(null)

  
  useEffect(() => {
    if (!containerRef.current) return

    const codeBlocks = containerRef.current.querySelectorAll('pre code')

    codeBlocks.forEach((codeElem) => {
      const parentPre = codeElem.parentElement    
      if (!parentPre) return
      const wrapperDiv = parentPre.parentElement  
      if (!wrapperDiv) return

      
      if (wrapperDiv.querySelector('.copy-button')) return

      const btn = document.createElement('button')
      btn.innerText = 'Copy'
      btn.type = 'button'



      btn.className =
        'copy-button absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-sm rounded hover:scale-105 transition-all transition'

      
      btn.onclick = () => {
        const textToCopy = codeElem.textContent || ''
        navigator.clipboard.writeText(textToCopy).then(() => {
          btn.innerText = 'Copied!'
          setTimeout(() => {
            btn.innerText = 'Copy'
          }, 1500)
        })
      }

   
      wrapperDiv.appendChild(btn)
    })
  }, [mdxHTML])



  const actionContainer = actions && (
    <div className='flex justify-start gap-2'>
      {actions.map((action, index) => (
        <Fragment key={index}>{action}</Fragment>
      ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col justify-between">
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: mdxHTML }}
        className="break-all"
      />
      {actionContainer}
    </div>
  );
};

export default MDXRenderer;

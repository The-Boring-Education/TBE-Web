// File: src/pages/test.tsx

import { ReactElement } from 'react'
import MDXRenderer from '@/components/common/MDXRenderer' // or adjust if your path is different

export default function TestPage(): ReactElement {
  // A small MDX snippet with a single code fence:
  const sampleMDX = `
\`\`\`js
// This is a sample code block
function greet(name) {
  console.log(\`Hello, \${name}!\`)
}
greet("TBE-User")
\`\`\`
  `

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">MDXRenderer “Copy” Button Test</h1>
      <MDXRenderer mdxSource={sampleMDX} />
    </div>
  )
}

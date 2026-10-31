import { richNodes, type FontName, type RichNode } from "@/lib/site-content/rich-text"

const fontClass: Record<FontName, string> = {
  serif: "font-serif",
  sans: "font-sans",
  mono: "font-mono",
}

function renderNodes(nodes: RichNode[], keyPrefix: string) {
  return nodes.map((node, index) => renderNode(node, `${keyPrefix}-${index}`))
}

function renderNode(node: RichNode, key: string) {
  if (node.t === "text") return <span key={key}>{node.v}</span>
  if (node.t === "br") return <br key={key} />
  if (node.t === "img") {
    return (
      <img
        key={key}
        src={node.src}
        alt={node.alt}
        className="inline-block max-h-32 max-w-full align-middle object-contain"
      />
    )
  }
  if (node.t === "ul") {
    return (
      <span key={key} className="my-1 block list-disc pl-5">
        {node.items.map((item, index) => (
          <span key={index} className="block list-item">
            {item.length ? renderNodes(item, `${key}-${index}`) : null}
          </span>
        ))}
      </span>
    )
  }
  if (node.t === "strong") return <strong key={key}>{renderNodes(node.c, key)}</strong>
  if (node.t === "em") return <em key={key}>{renderNodes(node.c, key)}</em>
  if (node.t === "u") return <u key={key}>{renderNodes(node.c, key)}</u>
  if (node.t === "span") {
    return (
      <span key={key} className={node.font ? fontClass[node.font] : undefined} style={node.color ? { color: node.color } : undefined}>
        {renderNodes(node.c, key)}
      </span>
    )
  }
  return null
}

export function RichText({ value }: { value: string }) {
  if (!value) return null
  return <span className="whitespace-pre-wrap">{renderNodes(richNodes(value), "t")}</span>
}

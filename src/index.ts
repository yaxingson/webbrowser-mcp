import Koa from 'koa'
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse'
import type { McpError } from '@modelcontextprotocol/sdk/types'
import { z } from 'zod'
import * as cheerio from 'cheerio'

const app = new Koa()

const server = new McpServer({
  name: 'Demo',
  version: '1.0.0'
})

server.tool('add',
  { 
    a: z.number().describe('first value'), 
    b: z.number().describe('second value') 
  },
  async ({ a, b }) => ({
    content: [{ type: 'text', text: String(a + b) }]
  })
)

server.resource(
  'greeting',
  new ResourceTemplate('greeting://{name}', { list: undefined }),
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}!`
    }]
  })
)

server.prompt('review-code', { code:z.string() }, async ({code}) => ({
  messages:[
    {role:'user', text:'I have reviewed the code'},
  ]
}))

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.log(`[${new Date().toLocaleTimeString()}] Server is running on stdio`)
}

main().catch(e=>{
  process.exit(1)
})

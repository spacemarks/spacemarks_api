#!/usr/bin/env -S deno run --allow-net=:${PORT},github.com --allow-env=PORT,HOSTNAME,END_REDIRECTION_URI,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET
import { Oak, OAuth2Client } from './deps.ts'

const PORT = Number(Deno.env.get('PORT'))
const HOSTNAME = Deno.env.get('HOSTNAME')
const URL = HOSTNAME ? HOSTNAME : `0.0.0.0:${PORT}`
const END_REDIRECTION_URI = Deno.env.get('END_REDIRECTION_URI')!
const GITHUB_CLIENT_ID = Deno.env.get('GITHUB_CLIENT_ID')!
const GITHUB_CLIENT_SECRET = Deno.env.get('GITHUB_CLIENT_SECRET')!

const oauth2Client = new OAuth2Client({
  clientId: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  authorizationEndpointUri: 'https://github.com/login/oauth/authorize',
  tokenUri: 'https://github.com/login/oauth/access_token',
  redirectUri: `${URL}/oauth2/callback`,
  defaults: {
    scope: 'public_repo',
  },
})

const router = new Oak.Router()
router.get('/status', (ctx) => {
  ctx.response.body = 'Working...'
})
router.get('/login', (ctx) => {
  ctx.response.redirect(oauth2Client.code.getAuthorizationUri())
})
router.get('/oauth2/callback', async (ctx) => {
  // Exchange the authorization code for an access token
  const tokens = await oauth2Client.code.getToken(ctx.request.url)
  const endRedirectionUrl = `${END_REDIRECTION_URI}?accessToken=${encodeURIComponent(tokens.accessToken)}`

  ctx.response.redirect(endRedirectionUrl)
})

const app = new Oak.Application()
app.use(router.allowedMethods(), router.routes())

await app.listen({ port: PORT })

console.log(`Server running at ${URL}`)

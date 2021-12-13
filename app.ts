<<<<<<< HEAD
import { Oak, OAuth2Client } from './deps.ts'
=======
import { Oak, OAuth2Client } from './Deps.ts'
>>>>>>> 95079408e5b18fc797f7b3ada7bd0e3ac0138299

const PORT = Number(Deno.env.get('PORT'))
const HOSTNAME = Deno.env.get('HOSTNAME')
const URL = `${HOSTNAME}:${PORT}`
const END_REDIRECTION_URI = Deno.env.get('END_REDIRECTION_URI')!
const oauth2Client = new OAuth2Client({
  clientId: Deno.env.get('GITHUB_CLIENT_ID')!,
  clientSecret: Deno.env.get('GITHUB_CLIENT_SECRET'),
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

await app.listen({ port: PORT, hostname: HOSTNAME })

console.log(`Server running at ${URL}`)

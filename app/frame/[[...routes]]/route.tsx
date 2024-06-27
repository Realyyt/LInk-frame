/** @jsxImportSource frog/jsx */

/* eslint-disable react/jsx-key */
/* eslint-disable jsx-a11y/alt-text */
import {
  getFarcasterIdByUsername,
  getFarcasterUser,
} from '@/utils/fetch-farcaster-user'
import { createSupabaseAdmin } from '@/utils/supabase/admin'
import { Button, FrameIntent, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { pinata } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { Box, Heading, Image, Text, VStack, vars } from './ui.js'

const supabase = createSupabaseAdmin()
const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

const app = new Frog({
  basePath: '/frame',
  ui: { vars },
  hub: pinata(),
})

app.frame('/', (c) => {
  return c.res({
    action: '/signup',
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="8">
          <Heading>Frame Links ⛓️</Heading>
          <Text color="text200" size="20">
            Link in bio for Farcaster Frames
          </Text>
        </VStack>
      </Box>
    ),
    intents: [
      <TextInput placeholder="Enter Link..." />,
      <Button>Add Link</Button>,
    ],
  })
})

app.frame('/signup', async (c) => {
  const { inputText, frameData, verified } = c

  if (frameData?.fid && verified) {
    try {
      const { data: user, error: selectError } = await supabase
        .from('users')
        .select()
        .eq('fid', frameData.fid)
        .limit(1)
        .maybeSingle()

      if (selectError) {
        throw new Error(selectError.message)
      }

      if (!user) {
        const { error: insertUserError } = await supabase.from('users').insert({
          fid: frameData.fid,
        })

        const { error: insertLinksError } = await supabase
          .from('links')
          .insert([
            {
              website: inputText,
              user_fid: frameData.fid,
            },
          ])

        if (insertUserError || insertLinksError) {
          throw new Error('Error creating user')
        }

        return c.res({
          image: (
            <Box
              grow
              alignVertical="center"
              backgroundColor="background"
              padding="32"
            >
              <Heading>Welcome New User</Heading>
            </Box>
          ),
          intents: [
            <Button.Link href={`${BASE_URL}/user/${frameData.fid}`}>
              View Your Profile
            </Button.Link>,
          ],
        })
      }

      const { error: updateError } = await supabase
        .from('links')
        .update({
          website: inputText,
        })
        .eq('user_fid', frameData.fid)

      if (updateError) {
        throw new Error(updateError.message)
      }

      return c.res({
        image: (
          <Box
            grow
            alignVertical="center"
            backgroundColor="background"
            padding="32"
          >
            <Heading>Link Updated!</Heading>
          </Box>
        ),
        intents: [
          <Button.Link href={`${BASE_URL}/user/${frameData.fid}`}>
            View Your Profile
          </Button.Link>,
        ],
      })
    } catch (error) {
      console.error(error)

      return c.res({
        image: (
          <Box
            grow
            alignVertical="center"
            backgroundColor="background"
            padding="32"
          >
            <Heading>Error ⚠️</Heading>
            <Text color="text200" size="20">
              Could Not Add Link
            </Text>
          </Box>
        ),
      })
    }
  }

  return c.res({
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <Heading>Error ⚠️</Heading>
        <Text color="text200" size="20">
          Farcaster User ID Not Found
        </Text>
      </Box>
    ),
  })
})

app.frame('/user/:id', async (c) => {
  const id = c.req.param('id')

  let fid = id

  // Test to see if `id` is potentially a username
  const isNumbersOnly = new RegExp('^[0-9]+$')
  if (!isNumbersOnly.test(id)) {
    fid = await getFarcasterIdByUsername(id)
  }

  const { data: linksData } = await supabase
    .from('links')
    .select()
    .eq('user_fid', fid)
    .limit(1)
    .maybeSingle()

  const farcasterUser = await getFarcasterUser(Number(fid))

  if (!farcasterUser.username) {
    return c.res({
      image: (
        <Box
          grow
          alignVertical="center"
          backgroundColor="background"
          padding="32"
        >
          <Heading>Error ⚠️</Heading>
          <Text color="text200" size="20">
            User Not Found
          </Text>
        </Box>
      ),
    })
  }

  let intents: FrameIntent[] = [
    <TextInput placeholder="Enter Link..." />,
    <Button action="/signup">Add Link</Button>,
  ]

  if (linksData && linksData.website) {
    intents = [<Button.Link href={linksData.website}>View Website</Button.Link>]
  }

  return c.res({
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="8">
          <Image
            src={farcasterUser.pfp}
            width="96"
            height="96"
            objectFit="cover"
            borderRadius="48"
          />
          <Heading>{farcasterUser.displayName}</Heading>
          <Text color="text200" size="16">
            {farcasterUser.bio}
          </Text>
        </VStack>
      </Box>
    ),
    intents,
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)

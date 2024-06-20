/** @jsxImportSource frog/jsx */

/* eslint-disable react/jsx-key */
import { createSupabaseAdmin } from '@/utils/supabase/admin'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { Box, Heading, Text, VStack, vars } from './ui.js'

const supabase = createSupabaseAdmin()
const BASE_URL = 'http://localhost:3000'

const app = new Frog({
  basePath: '/frame',
  ui: { vars },
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
  const { inputText, frameData } = c

  if (frameData?.fid) {
    try {
      const { data: user, error: selectError } = await supabase
        .from('links')
        .select()
        .eq('fid', frameData.fid)
        .limit(1)
        .maybeSingle()

      if (selectError) {
        throw new Error(selectError.message)
      }

      if (!user) {
        const { error: insertError } = await supabase.from('links').insert({
          website: inputText,
          fid: frameData?.fid,
        })

        if (insertError) {
          throw new Error(insertError.message)
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
        .eq('fid', frameData?.fid)

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

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)

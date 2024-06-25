type FarcasterUser = {
  bio: string
  displayName: string
  pfp: string
  username: string
}

const DEFAULT_FARCASTER_USER = {
  bio: '',
  displayName: '',
  pfp: '',
  username: '',
}

export async function getFarcasterUser(fid: number): Promise<FarcasterUser> {
  const res = await fetch(
    `https://hub.pinata.cloud/v1/userDataByFid?fid=${fid}`,
    {
      method: 'GET',
    }
  )

  if (!res.ok) {
    return DEFAULT_FARCASTER_USER
  }

  const data = await res.json()

  if (data.messages.length === 0) {
    return DEFAULT_FARCASTER_USER
  }

  const user = data.messages.reduce(
    (
      acc: FarcasterUser,
      message: { data: { userDataBody: { type: string; value: string } } }
    ) => {
      if (message.data.userDataBody.type === 'USER_DATA_TYPE_PFP') {
        acc.pfp = message.data.userDataBody.value
      }

      if (message.data.userDataBody.type === 'USER_DATA_TYPE_DISPLAY') {
        acc.displayName = message.data.userDataBody.value
      }

      if (message.data.userDataBody.type === 'USER_DATA_TYPE_BIO') {
        acc.bio = message.data.userDataBody.value
      }

      if (message.data.userDataBody.type === 'USER_DATA_TYPE_USERNAME') {
        acc.username = message.data.userDataBody.value
      }

      return acc
    },
    DEFAULT_FARCASTER_USER
  )

  return user
}

export async function getFarcasterIdByUsername(username: string) {
  const res = await fetch(
    `https://hub.pinata.cloud/v1/userNameProofByName?name=${username}`,
    {
      method: 'GET',
    }
  )

  if (!res.ok) {
    return 0
  }

  const data = await res.json()

  return data.fid
}

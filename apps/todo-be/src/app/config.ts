import { isTestEnv } from '@panda-org/helpers'

export const appConfig = {
  security: {
    jwt: {
      alg: 'EdDSA',
      keys: (() => {
        const path = 'apps/todo-be/secrets/certs/'
        return {
          private: path + 'ed25519_private.pem',
          public: path + 'ed25519_public.pem',
        }
      })(),
      expiration: isTestEnv() ? '1 second' : '5 minutes',
    },
    refreshToken: {
      exp: isTestEnv() ? 3 : 604800, // * 7 days
    },
    hash: {
      default: {
        alg: 'bcrypt',
        rounds: 10,
        salt: null,
      },
    },
    cookie: {
      secret: '440e9bd4246347d9f0069556a3228f2b',
      keys: {
        DEVICE_ID_KEY: 'device-id',
      },
    },
  },
}

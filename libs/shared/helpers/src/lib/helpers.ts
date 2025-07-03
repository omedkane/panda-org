export function wait(timeMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs)
  })
}

export function isTestEnv() {
  return process.env["NODE_ENV"]?.toLowerCase() === 'test'
}

function isFulfilled<T> (result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled'
}

export function getFulfilledResults<T> (results: Array<PromiseSettledResult<T>>): T[] {
  const successfulResults = results
    .filter(isFulfilled)
    .map(result => result.value)

  return successfulResults
}

export const noRefetchParams = (): {
  refetchInterval: false
  refetchIntervalInBackground: false
  refetchOnMount: false
  refetchOnReconnect: false
  refetchOnWindowFocus: false
} => {
  return {
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false
  }
}

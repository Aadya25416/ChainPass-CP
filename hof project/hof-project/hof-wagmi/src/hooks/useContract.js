import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { chainPassAddress, sepoliaChainId } from '../lib/chainPass'
import { chainPassAbi } from '../lib/chainPassAbi'

export function useContractWrite() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const write = (functionName, args, value) =>
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName,
      args,
      ...(value !== undefined ? { value } : {}),
    })

  return { write, hash, isPending, isConfirming, isConfirmed, error, reset }
}

export function useContractRead(functionName, args = [], opts = {}) {
  return useReadContract({
    address: chainPassAddress,
    abi: chainPassAbi,
    functionName,
    args,
    ...opts,
  })
}

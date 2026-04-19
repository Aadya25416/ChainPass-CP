import { encodeFunctionData } from 'viem'
import { aaConfig, chainPassAbi } from './config'
import { createChainPassSmartAccountClient } from './smartAccountClient'

export type SendUserOperationParams = {
  functionName: (typeof chainPassAbi)[number]['name']
  args?: readonly unknown[]
  value?: bigint
  ownerAddress: `0x${string}`
  ethereumProvider: unknown
}

type SendUserOperationSimple = {
  functionName: (typeof chainPassAbi)[number]['name']
  args?: readonly unknown[]
  value?: bigint
}

type BrowserEthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

async function getConnectedWalletContext(): Promise<{
  ownerAddress: `0x${string}`
  ethereumProvider: BrowserEthereumProvider
}> {
  const ethereumProvider = (window as Window & { ethereum?: BrowserEthereumProvider }).ethereum
  if (!ethereumProvider) {
    throw new Error('No injected wallet provider found in browser.')
  }

  const accounts = (await ethereumProvider.request({
    method: 'eth_requestAccounts',
  })) as string[]

  const ownerAddress = accounts?.[0] as `0x${string}` | undefined
  if (!ownerAddress) {
    throw new Error('No wallet account available for UserOperation signing.')
  }

  return { ownerAddress, ethereumProvider }
}

/**
 * Sends ChainPass contract interactions as ERC-4337 UserOperations.
 *
 * Gas sponsorship model:
 * 1) User signs UserOperation from wallet.
 * 2) Pimlico paymaster returns sponsorship data.
 * 3) Bundler submits handleOps on-chain.
 * 4) Paymaster deposit pays gas, while user only pays function value (ticket price).
 *
 * Operational reminder:
 * Keep paymaster funded in Pimlico dashboard with Sepolia ETH, otherwise
 * sponsored operations will revert/fail during validation.
 */
export async function sendUserOperation(
  functionName: SendUserOperationSimple['functionName'],
  args?: SendUserOperationSimple['args'],
  value?: SendUserOperationSimple['value'],
): Promise<{ userOpHash: `0x${string}`; receipt: unknown }>

export async function sendUserOperation(
  params: SendUserOperationParams,
): Promise<{ userOpHash: `0x${string}`; receipt: unknown }>

export async function sendUserOperation(
  inputOrFunctionName: SendUserOperationParams | SendUserOperationSimple['functionName'],
  inputArgs: SendUserOperationSimple['args'] = [],
  inputValue: SendUserOperationSimple['value'] = 0n,
) {
  const payload: SendUserOperationParams =
    typeof inputOrFunctionName === 'string'
      ? {
          functionName: inputOrFunctionName,
          args: inputArgs,
          value: inputValue,
          ...(await getConnectedWalletContext()),
        }
      : inputOrFunctionName

  const {
    functionName,
    args = [],
    value = 0n,
    ownerAddress,
    ethereumProvider,
  } = payload

  const smartClient = await createChainPassSmartAccountClient({
    ownerAddress,
    ethereumProvider,
  })

  const data = encodeFunctionData({
    abi: chainPassAbi,
    functionName,
    args: args as never,
  })

  const userOpHash = await smartClient.sendUserOperation({
    calls: [
      {
        to: aaConfig.contractAddress,
        data,
        value,
      },
    ],
  })

  const receipt = await smartClient.waitForUserOperationReceipt({
    hash: userOpHash,
  })

  return {
    userOpHash,
    receipt,
  }
}

/**
 * Integration note for existing wagmi UI (do this in wagmi app when you are ready):
 * Replace only write calls, for example buyTicket:
 *
 * await sendUserOperation({
 *   functionName: 'buyTicket',
 *   args: [BigInt(eventId)],
 *   value: parseEther(ticketPriceEth),
 *   ownerAddress: address,
 *   ethereumProvider,
 * })
 *
 * This preserves existing wallet connect flow and swaps tx transport only.
 */

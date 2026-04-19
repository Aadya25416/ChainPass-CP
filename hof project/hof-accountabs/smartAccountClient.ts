import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { aaConfig } from './config'
import { createSmartAccountClient } from 'permissionless/clients'
import { toSimpleSmartAccount } from 'permissionless/accounts'
import { pimlicoPaymaster } from './paymasterClient'

export type CreateChainPassAAClientParams = {
  ownerAddress: `0x${string}`
  ethereumProvider: unknown
}

/**
 * Creates a Simple Smart Account client backed by Pimlico bundler + paymaster.
 *
 * Normal tx path:
 * EOA -> sendTransaction/writeContract -> user pays gas.
 *
 * ERC-4337 path:
 * EOA signs UserOperation -> bundler submits handleOps -> paymaster sponsors gas.
 */
export async function createChainPassSmartAccountClient(
  params: CreateChainPassAAClientParams,
) {
  const publicClient = createPublicClient({
    chain: aaConfig.chain,
    transport: http(aaConfig.rpcUrl),
  })

  const walletClient = createWalletClient({
    chain: aaConfig.chain,
    transport: custom(params.ethereumProvider as any),
    account: params.ownerAddress,
  })

  const smartAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner: walletClient,
    entryPoint: {
      version: aaConfig.entryPointVersion,
      // Default address is used internally for 0.7 unless explicitly overridden.
      address: '0x0000000071727de22e5e9d8baf0edac6f37da032',
    },
  })

  return createSmartAccountClient({
    account: smartAccount,
    chain: aaConfig.chain,
    bundlerTransport: http(aaConfig.bundlerUrl),
    paymaster: {
      getPaymasterStubData: pimlicoPaymaster.getPaymasterStubData,
      getPaymasterData: pimlicoPaymaster.getPaymasterData,
    },
    userOperation: {
      async estimateFeesPerGas() {
        const fees = await publicClient.estimateFeesPerGas()
        return {
          maxFeePerGas: fees.maxFeePerGas ?? 0n,
          maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? 0n,
        }
      },
    },
  })
}

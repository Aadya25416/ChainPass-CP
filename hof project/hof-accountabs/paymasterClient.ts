import { http } from 'viem'
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import { aaConfig } from './config'

/**
 * Pimlico client.
 *
 * We use Pimlico's sponsorUserOperation action to retrieve sponsorship data,
 * which avoids direct pm_getPaymasterData endpoint mismatches.
 */
export const pimlicoClient = createPimlicoClient({
  transport: http(aaConfig.bundlerUrl),
  entryPoint: {
    address: '0x0000000071727de22e5e9d8baf0edac6f37da032',
    version: '0.7',
  },
})

/**
 * Hook payload for permissionless smartAccountClient paymaster integration.
 *
 * getPaymasterData is adapted to Pimlico sponsorUserOperation response.
 */
export const pimlicoPaymaster = {
  async getPaymasterStubData(parameters: {
    callData: `0x${string}`
    callGasLimit?: bigint
    factory?: `0x${string}`
    factoryData?: `0x${string}`
    maxFeePerGas?: bigint
    maxPriorityFeePerGas?: bigint
    nonce: bigint
    preVerificationGas?: bigint
    sender: `0x${string}`
    verificationGasLimit?: bigint
    paymasterPostOpGasLimit?: bigint
    paymasterVerificationGasLimit?: bigint
    calls?: unknown
    context?: unknown
    chainId: number
    entryPointAddress: `0x${string}`
  }) {
    const context = parameters.context
    const userOperation = {
      sender: parameters.sender,
      nonce: parameters.nonce,
      callData: parameters.callData,
      callGasLimit: parameters.callGasLimit,
      verificationGasLimit: parameters.verificationGasLimit,
      preVerificationGas: parameters.preVerificationGas,
      maxFeePerGas: parameters.maxFeePerGas,
      maxPriorityFeePerGas: parameters.maxPriorityFeePerGas,
      factory: parameters.factory,
      factoryData: parameters.factoryData,
      paymasterPostOpGasLimit: parameters.paymasterPostOpGasLimit,
      paymasterVerificationGasLimit: parameters.paymasterVerificationGasLimit,
      signature:
        '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c' as `0x${string}`,
    }

    const sponsored = await pimlicoClient.sponsorUserOperation({
      userOperation: userOperation as never,
      paymasterContext: context,
    })

    return {
      paymaster: sponsored.paymaster,
      paymasterData: sponsored.paymasterData,
      paymasterPostOpGasLimit: sponsored.paymasterPostOpGasLimit,
      paymasterVerificationGasLimit: sponsored.paymasterVerificationGasLimit,
      isFinal: false,
    }
  },
  async getPaymasterData(parameters: {
    callData: `0x${string}`
    callGasLimit?: bigint
    factory?: `0x${string}`
    factoryData?: `0x${string}`
    maxFeePerGas?: bigint
    maxPriorityFeePerGas?: bigint
    nonce: bigint
    preVerificationGas?: bigint
    sender: `0x${string}`
    verificationGasLimit?: bigint
    paymasterPostOpGasLimit?: bigint
    paymasterVerificationGasLimit?: bigint
    calls?: unknown
    context?: unknown
    chainId: number
    entryPointAddress: `0x${string}`
  }) {
    const context = parameters.context
    const userOperation = {
      sender: parameters.sender,
      nonce: parameters.nonce,
      callData: parameters.callData,
      callGasLimit: parameters.callGasLimit,
      verificationGasLimit: parameters.verificationGasLimit,
      preVerificationGas: parameters.preVerificationGas,
      maxFeePerGas: parameters.maxFeePerGas,
      maxPriorityFeePerGas: parameters.maxPriorityFeePerGas,
      factory: parameters.factory,
      factoryData: parameters.factoryData,
      paymasterPostOpGasLimit: parameters.paymasterPostOpGasLimit,
      paymasterVerificationGasLimit: parameters.paymasterVerificationGasLimit,
      signature:
        '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c' as `0x${string}`,
    }

    const sponsored = await pimlicoClient.sponsorUserOperation({
      userOperation: userOperation as never,
      paymasterContext: context,
    })

    return {
      paymaster: sponsored.paymaster,
      paymasterData: sponsored.paymasterData,
      paymasterPostOpGasLimit: sponsored.paymasterPostOpGasLimit,
      paymasterVerificationGasLimit: sponsored.paymasterVerificationGasLimit,
    }
  },
}

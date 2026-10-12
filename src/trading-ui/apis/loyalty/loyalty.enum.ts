export enum LoyaltyCustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MERGED = 'MERGED',
}

export enum LoyaltyMemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  MERGED = 'MERGED',
  NEW = 'NEW',
}

/** Khớp `PointTransactionType` trên BE (`src/point/enums/point-transaction.enum.ts`). */
export enum LoyaltyPointTransactionType {
  OPENING_BALANCE = 'OPENING_BALANCE',
  EARN = 'EARN',
  BURN = 'BURN',
  REFUND_REVERSAL = 'REFUND_REVERSAL',
  REVERSAL_BURN = 'REVERSAL_BURN',
  EXPIRED = 'EXPIRED',
  ADJUSTMENT = 'ADJUSTMENT',
  POINT_FORFEIT = 'POINT_FORFEIT',
  NEW_MEMBER_REWARD = 'NEW_MEMBER_REWARD',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  MERGE_OUT = 'MERGE_OUT',
  MERGE_IN = 'MERGE_IN',
  SPLIT_OUT = 'SPLIT_OUT',
  SPLIT_IN = 'SPLIT_IN',
}

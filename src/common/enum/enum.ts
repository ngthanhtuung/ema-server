export enum ERole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  EMPLOYEE = 'EMPLOYEE',
}

export enum EGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum EAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum EEventStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  CANCEL = 'CANCEL',
}

export enum EPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum ETaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  CANCEL = 'CANCEL',
  OVERDUE = 'OVERDUE',
}

export enum EReplyRequest {
  PENDING = 'PENDING',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export enum ERole {
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  EMPLOYEE = 'EMPLOYEE',
}

export enum EGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum EUserStatus {
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
  CONFIRM = 'CONFIRM',
  DONE = 'DONE',
  CANCEL = 'CANCEL',
  OVERDUE = 'OVERDUE',
}

export enum EReplyRequest {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  CANCEL = 'CANCEL',
}

export enum SortEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ETypeEmployee {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
}

export enum ERequestType {
  A = 'A',
  L = 'L',
  M = 'M',
}

export enum ERequestStatus {
  PENDING = 'PENDING',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export enum EStatusBudgets {
  PROCESSING = 'PROCESSING',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  USED = 'USED',
  CANCEL = 'CANCEL',
}

export enum ETypeNotification {
  TASK = 'TASK',
  COMMENT = 'COMMENT',
  REQUEST = 'REQUEST',
  BUDGETS = 'BUDGETS',
}

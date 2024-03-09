export enum ERole {
  ADMIN = 'Administrator',
  MANAGER = 'Quản Lý',
  STAFF = 'Trưởng Nhóm',
  CUSTOMER = 'Khách Hàng',
  EMPLOYEE = 'Nhân Viên',
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
  ALL = 'ALL',
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  CANCEL = 'CANCEL',
}

export enum EEventDate {
  TODAY = 'TODAY',
  UPCOMMING = 'UPCOMMING',
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
  U = 'U',
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
  SUBTASK = 'SUBTASK',
  COMMENT = 'COMMENT',
  REQUEST = 'REQUEST',
  BUDGETS = 'BUDGETS',
  CONTRACT = 'CONTRACT',
  COMMENT_SUBTASK = 'COMMENT_SUBTASK',
}

export enum ETypeMessage {
  TASK = 'TASK',
  COMMENT = 'COMMENT',
  REQUEST = 'REQUEST',
  BUDGETS = 'BUDGETS',
}

export enum ERoleParticipant {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  MODERATOR = 'MODERATOR',
}

export enum EGroupSetting {
  MAIL = 'MAIL',
  SYSTEM = 'SYSTEM',
}

export enum EContactInformation {
  ALL = 'ALL',
  PENDING = 'PENDING',
  ACCEPT = 'ACCEPTED',
  REJECT = 'REJECTED',
  DELETED = 'DELETED',
  SUCCESS = 'SUCCESS',
}

export enum EFileType {
  PDF = 'PDF',
  DOC = 'DOC',
  DOCX = 'DOCX',
  XLS = 'XLS',
  XLSX = 'XLSX',
  PPT = 'PPT',
  PPTX = 'PPTX',
}

export enum EContractPaymentMethod {
  CASH = 'Tiền Mặt',
  TRANSFER = 'Chuyển Khoản',
}

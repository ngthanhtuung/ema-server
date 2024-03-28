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
  REJECTED = 'REJECTED',
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

export enum ETypeNotification {
  TASK = 'TASK',
  SUBTASK = 'SUBTASK',
  COMMENT = 'COMMENT',
  CONTRACT = 'CONTRACT',
  COMMENT_SUBTASK = 'COMMENT_SUBTASK',
  BUDGET = 'BUDGET',
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

export enum EPlanningUnit {
  GÓI = 'Gói',
  BỘ = 'Bộ',
  NGƯỜI = 'Người',
  M2 = 'm2',
  CÁI = 'Cái',
}

export enum EStatusAssignee {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum EContractStatus {
  ALL = 'ALL',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  PAID = 'PAID',
  WAIT_FOR_SIGN = 'WAIT_FOR_SIGN',
  WAIT_FOR_PAID = 'WAIT_FOR_PAID',
  SUCCESS = 'SUCCESS',
}

export enum EContractEvidenceType {
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  CONTRACT_PAID = 'CONTRACT_PAID',
}

export enum ETransaction {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ALL = 'ALL',
  SUCCESS = 'SUCCESS',
}

export enum ECheckUserInTask {
  TASK_MASTER = 'TASK_MASTER',
  ASSIGNEE = 'ASSIGNEE',
  ALL = 'ALL',
}

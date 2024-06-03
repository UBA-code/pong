export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ROOM_TYPE {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum FriendshipStatus {
  FRIEND = 'FRIEND',
  PENDING = 'PENDING',
  REQUESTED = 'REQUESTED',
  NOT_FRIEND = 'NOT_FRIEND',
  BLOCKED = 'BLOCKED',
  BLOCKED_BY_HIM = 'BLOCKED_BY_HIM',
}

export enum notificationType {
  primary = 'primary',
  success = 'success',
  warning = 'warning',
  danger = 'danger',
  neutral = 'neutral',
}

export interface alertProp {
  alertContent: string;
  color:
    | notificationType.danger
    | notificationType.primary
    | notificationType.success
    | notificationType.warning
    | notificationType.neutral;
}

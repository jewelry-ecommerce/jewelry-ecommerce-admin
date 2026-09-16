export enum RouteType {
  /** Reachable only while signed out — an authenticated visitor is sent to the dashboard. */
  PUBLIC = "PUBLIC",
  /** Requires a session; also checked against the role's route permissions. */
  PROTECTED = "PROTECTED",
}

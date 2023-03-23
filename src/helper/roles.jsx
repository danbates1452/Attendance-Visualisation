export function RoleWrapper({children, role, allowedRoles}) {
    return allowedRoles.indexOf(role) > -1 ? children : null
}
  
export function getCurrentUserRole() {
    return 'admin'; //hardcoded for now, access control system not yet established
}
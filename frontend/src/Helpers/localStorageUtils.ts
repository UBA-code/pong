/**
 * getting the sideBar status from localStorage if exist, if isn't set it to false
 * @returns boolean value representing the status of sideBar
 */
export function getSideBarStatusFromStorage() {
  const status = localStorage.getItem("sidebar");
  if (status) {
    return status === "true" ? true : false;
  }
  localStorage.setItem("sidebar", "false");
  return false;
}

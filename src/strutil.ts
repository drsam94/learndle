export function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
export function convertMove(name: string): string {
  const parts = name.split('-');
  let ret = "";
  for (const part of parts) {
    if (ret.length > 0) {
      ret += " ";
    }
    ret += capitalize(part);
  }
  return ret;
}
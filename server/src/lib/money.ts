export function assertToman(value:number,label='amount') {
  if(!Number.isSafeInteger(value)||value<0)throw new TypeError(`${label} must be a non-negative integer toman amount`);
  return value;
}

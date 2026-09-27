import { ApiError } from '../../lib/errors.js';
type Group = {
  id: string;
  minSelect: number;
  maxSelect: number | null;
  isRequired: boolean;
};
type Option = { id: string; optionGroupId: string; isActive: boolean };
export function validateOptionSelection(
  groups: Group[],
  availableOptions: Option[],
  selectedIds: string[],
) {
  if (new Set(selectedIds).size !== selectedIds.length)
    throw new ApiError(
      422,
      'DUPLICATE_OPTION',
      'یک افزودنی بیش از یک بار انتخاب شده است.',
    );
  const permitted = new Set(groups.map((group) => group.id));
  const optionsById = new Map(
    availableOptions.map((option) => [option.id, option]),
  );
  for (const id of selectedIds) {
    const option = optionsById.get(id);
    if (!option || !option.isActive || !permitted.has(option.optionGroupId))
      throw new ApiError(
        422,
        'INVALID_OPTION',
        'افزودنی انتخاب‌شده برای این غذا معتبر نیست.',
      );
  }
  for (const group of groups) {
    const count = selectedIds.filter(
      (id) => optionsById.get(id)?.optionGroupId === group.id,
    ).length;
    const minimum = group.isRequired
      ? Math.max(1, group.minSelect)
      : group.minSelect;
    if (
      count < minimum ||
      (group.maxSelect !== null && count > group.maxSelect)
    )
      throw new ApiError(
        422,
        'OPTION_SELECTION_INVALID',
        'تعداد افزودنی‌های انتخاب‌شده معتبر نیست.',
      );
  }
}

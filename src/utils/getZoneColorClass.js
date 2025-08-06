// utils/getZoneColorClass.js
export const getZoneColorClass = (zoneName) => {
  switch (zoneName) {
    case '神化ゾーン':
      return 'text-purple-600 font-bold';
    case '超越ゾーン':
      return 'text-blue-600 font-bold';
    case '爆裂ゾーン':
      return 'text-red-500 font-bold';
    default:
      return 'text-gray-500';
  }
};

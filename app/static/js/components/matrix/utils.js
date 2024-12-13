export function debounce(func, wait) {
   let timeout;
   return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
   };
}

export function getCellBackground(colors) {
   if (!colors || colors.length === 0) return "#344454";
   if (colors.length === 1) return colors[0];

   const percentage = 100 / colors.length;
   const gradientColors = colors.map((color, idx) => {
      const start = idx * percentage;
      const end = (idx + 1) * percentage;
      return `${color} ${start}%, ${color} ${end}%`;
   });

   return `linear-gradient(to right, ${gradientColors.join(", ")})`;
}
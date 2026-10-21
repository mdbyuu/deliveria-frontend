<script setup>
defineProps({
  name: { type: String, default: 'box' },
  size: { type: [Number, String], default: 20 },
})
const paths = {
  box: 'm21 8-9 5-9-5m9 5v9M3 7l9-5 9 5v10l-9 5-9-5V7Zm4.5-2.5 9 5',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  truck: 'M1 4h13v13H1zM14 8h4l4 5v4h-8M4 17a2 2 0 1 0 4 0m8 0a2 2 0 1 0 4 0M14 13h8',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m8-7.87a4 4 0 0 1 0 7.75',
  plus: 'M12 5v14M5 12h14',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6-6-6 6 6 6',
  check: 'm5 12 4 4L19 6',
  clock: 'M12 8v4l3 2M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0',
  refresh: 'M20 7v5h-5M4 17v-5h5M6.1 6a8 8 0 0 1 13.2 2M4.7 16A8 8 0 0 0 17.9 18',
  logout: 'M9 21H3V3h6m6 5 4 4-4 4M8 12h13',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0',
  shield: 'M12 22s9-4 9-11V5l-9-3-9 3v6c0 7 9 11 9 11Zm-4-11 3 3 5-5',
  chart: 'M3 3v18h18M7 16v-5m5 5V7m5 9v-8',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'm6 6 12 12M6 18 18 6',
}
</script>
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.box" />
  </svg>
</template>

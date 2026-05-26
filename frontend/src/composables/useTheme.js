import { onMounted, watch, ref } from 'vue';

export function useTheme(defaultTheme = 'default') {
  const themeName = ref(defaultTheme);

  const applyTheme = () => {
    document.body.dataset.theme = themeName.value;
  };

  const loadTheme = () => {
    themeName.value = localStorage.getItem('themeName') || defaultTheme;
    applyTheme();
  };

  const toggleTheme = () => {
    themeName.value = themeName.value === 'default' ? 'vibrant' : 'default';
  };

  onMounted(loadTheme);

  watch(themeName, (value) => {
    localStorage.setItem('themeName', value);
    applyTheme();
  });

  return {
    themeName,
    toggleTheme,
  };
}

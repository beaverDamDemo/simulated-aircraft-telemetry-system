import { onMounted, watch, ref } from 'vue';

export function useTheme(defaultTheme = 'default') {
  const themeName = ref(defaultTheme);

  const applyTheme = () => {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.dataset.theme = themeName.value;
    document.body.dataset.themeName = themeName.value;
  };

  const loadTheme = () => {
    if (typeof window === 'undefined') {
      return;
    }

    themeName.value = window.localStorage.getItem('themeName') || defaultTheme;
    applyTheme();
  };

  const toggleTheme = () => {
    themeName.value = themeName.value === 'default' ? 'vibrant' : 'default';
  };

  onMounted(loadTheme);

  watch(themeName, (value) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('themeName', value);
    }

    applyTheme();
  });

  return {
    themeName,
    toggleTheme,
  };
}

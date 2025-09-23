import { useColorScheme as _useColorScheme } from 'react-native';

// Hook personalizado para obtener el esquema de color (claro/oscuro)
export function useColorScheme() {
  return _useColorScheme();
}

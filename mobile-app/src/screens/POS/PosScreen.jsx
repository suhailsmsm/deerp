import React, { useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { ProductsScreen } from './ProductsScreen';

export default function PosScreen({ navigation }) {
  const { loadLocalSettings } = useSettingsStore();

  useEffect(() => {
    loadLocalSettings();
  }, []);

  return <ProductsScreen navigation={navigation} />;
}
